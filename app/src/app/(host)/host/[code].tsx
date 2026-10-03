import { DEV_SHORT_GAME_QUESTIONS } from '@shared/constants';
import {
  endUpdate,
  hostControls,
  pauseUpdate,
  replayUpdate,
  resumeUpdate,
  type SessionUpdate,
} from '@shared/hostEngine';
import { canLaunchGame } from '@shared/players';
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import type { Session } from '@shared/types';
import * as Clipboard from 'expo-clipboard';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HostControlsBar, HostControlsPanel, type HostActions } from '@/components/host/HostControls';
import { OptionToggle } from '@/components/host/OptionToggle';
import { PlayerGame } from '@/components/player/game/PlayerGame';
import { JoinForm } from '@/components/player/JoinForm';
import { PlayerList } from '@/components/player/PlayerList';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useAnswer } from '@/hooks/useAnswer';
import { useGameQuestions, type GameQuestionsState } from '@/hooks/useGameQuestions';
import { useHostEngine } from '@/hooks/useHostEngine';
import { useLeaveGuard } from '@/hooks/useLeaveGuard';
import { useLiveValue } from '@/hooks/useLiveValue';
import { useLobbyCleanup } from '@/hooks/useLobbyCleanup';
import { usePresence } from '@/hooks/usePresence';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { receiverUrl } from '@/lib/createGame';
import { confirmAction } from '@/lib/confirm';
import { applyHostAction, deleteGame, launchGame } from '@/lib/hostGame';
import { clearHostedGameCode, saveHostedGameCode } from '@/lib/hostedGameStorage';

// Écran de l'hôte : lobby (code, lien TV, joueurs, lancement), puis la partie, pilotée par le
// moteur (useHostEngine) tant que cet écran est affiché.
export default function HostScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? '');

  return isValidRoomCode(code) ? (
    <HostSession code={code} />
  ) : (
    <Screen>
      <Text style={textStyles.error}>{strings.hostLobby.notHost}</Text>
    </Screen>
  );
}

function HostSession({ code }: { code: string }) {
  // Seul l'hôte peut lire sa session d'un bloc : un refus signifie « pas l'hôte » ou « introuvable ».
  const session = useLiveValue<Session>(`sessions/${code}`);
  // La base ne stocke pas les objets vides : players manque tant que personne n'a rejoint.
  // Objet recréé seulement quand la session change (le moteur se recalcule sur ce changement).
  const value = session.kind === 'ready' ? session.value : null;
  const current = useMemo(() => value && { ...value, players: value.players ?? {} }, [value]);

  if (session.kind === 'loading') {
    return (
      <Screen>
        <Text style={textStyles.body}>{strings.hostLobby.loading}</Text>
      </Screen>
    );
  }
  if (current === null) {
    return (
      <Screen>
        <Text style={textStyles.error}>{strings.hostLobby.notHost}</Text>
      </Screen>
    );
  }
  return <HostGame code={code} session={current} />;
}

// Partie en cours : de STARTING jusqu'avant END.
function isInProgress(session: Session): boolean {
  return session.status !== 'lobby' && session.status !== 'ended';
}

function HostGame({ code, session }: { code: string; session: Session }) {
  const questions = useGameQuestions(session.quizId);
  const serverOffsetMs = useServerTimeOffset();
  const uid = session.hostUid;
  const isRegistered = session.players[uid] !== undefined;
  const inProgress = isInProgress(session);

  const engine = useHostEngine({
    code,
    session,
    questions: questions.kind === 'ready' ? questions.questions : null,
    serverOffsetMs,
  });
  // Même présence que les autres joueurs : il compte dans les joueurs connectés.
  usePresence(code, isRegistered ? uid : null);
  useLeaveGuard(inProgress);
  useLobbyCleanup(code, session);

  // Partie terminée : plus rien à reprendre après une relance de l'app.
  useEffect(() => {
    if (session.status === 'ended') void clearHostedGameCode();
  }, [session.status]);

  return (
    <>
      {inProgress && <KeepScreenOn />}
      {session.status === 'lobby' ? (
        <Screen>
          <LobbyContent code={code} session={session} questions={questions} serverOffsetMs={serverOffsetMs} />
        </Screen>
      ) : (
        <HostInGame
          code={code}
          session={session}
          serverOffsetMs={serverOffsetMs}
          isRegistered={isRegistered}
          onSkip={engine.skip}
        />
      )}
    </>
  );
}

// L'hôte est l'autorité de la partie : si son téléphone se verrouille, la partie se fige.
// Écran maintenu allumé tant que ce composant est affiché (de STARTING à END).
function KeepScreenOn() {
  useKeepAwake();
  return null;
}

interface HostInGameProps {
  code: string;
  session: Session;
  serverOffsetMs: number;
  isRegistered: boolean;
  onSkip: () => void;
}

// Pendant la partie, l'hôte inscrit joue comme les autres. Ses contrôles sont dans le pied
// d'écran (bouton « Hôte » et panneau ; Reprendre en pause ; Rejouer / Quitter à la fin).
function HostInGame({ code, session, serverOffsetMs, isRegistered, onSkip }: HostInGameProps) {
  const { answer, onAnswer } = useAnswer(code, session.hostUid, session);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Une action = relire la session, calculer l'update (shared/hostEngine.ts), un seul update().
  async function act(buildUpdate: (current: Session, nowServer: number) => SessionUpdate | null) {
    setActionError(null);
    try {
      await applyHostAction(code, buildUpdate, Date.now() + serverOffsetMs);
    } catch (error) {
      console.error('[engine] Action de l’hôte impossible', error);
      setActionError(strings.hostControls.actionFailed);
    }
  }

  // Rejouer : même code, retour au lobby ; le code redevient « à reprendre » après une relance.
  async function replay() {
    await act(replayUpdate);
    await saveHostedGameCode(code);
  }

  // Quitter : suppression de toute la partie, puis retour au catalogue.
  function quit() {
    confirmAction(strings.hostControls.quitConfirm, () => {
      router.replace('/');
      void clearHostedGameCode();
      deleteGame(code).catch((error: unknown) => console.error('[engine] Suppression de la partie impossible', error));
    });
  }

  const actions: HostActions = {
    skip: onSkip,
    pause: () => void act(pauseUpdate),
    resume: () => void act(resumeUpdate),
    end: () => confirmAction(strings.hostControls.endConfirm, () => void act(endUpdate)),
    replay: () => void replay(),
    quit,
  };

  const footer = (
    <HostFooter
      status={session.status}
      error={actionError}
      onOpenPanel={() => setIsPanelOpen(true)}
      onResume={actions.resume}
      onReplay={actions.replay}
      onQuit={actions.quit}
    />
  );
  const overlay = isPanelOpen ? (
    <HostControlsPanel controls={hostControls(session)} actions={actions} onClose={() => setIsPanelOpen(false)} />
  ) : null;

  if (!isRegistered) {
    const title = session.status === 'ended' ? strings.game.ended.title : strings.hostGame.inProgressTitle;
    return (
      <View style={styles.fill}>
        <Screen footer={footer}>
          <Text style={textStyles.hero}>{title}</Text>
          <Text style={[textStyles.body, styles.centered]}>{strings.hostGame.spectatorHint}</Text>
        </Screen>
        {overlay}
      </View>
    );
  }
  return (
    <PlayerGame
      session={session}
      uid={session.hostUid}
      serverOffsetMs={serverOffsetMs}
      answer={answer}
      onAnswer={onAnswer}
      footer={footer}
      overlay={overlay}
    />
  );
}

interface HostFooterProps {
  status: Session['status'];
  error: string | null;
  onOpenPanel: () => void;
  onResume: () => void;
  onReplay: () => void;
  onQuit: () => void;
}

// Pied d'écran de l'hôte, sur tous les écrans de partie : la barre « Contrôles de l'hôte »
// (panneau), précédée de Reprendre en pause, et de Rejouer / Quitter en fin de partie.
function HostFooter({ status, error, onOpenPanel, onResume, onReplay, onQuit }: HostFooterProps) {
  return (
    <View style={styles.footerStack}>
      {error && <Text style={[textStyles.error, styles.centered]}>{error}</Text>}
      {status === 'paused' && <BigButton label={strings.hostControls.resume} onPress={onResume} />}
      {status === 'ended' && (
        <View style={styles.footerRow}>
          <View style={styles.fill}>
            <BigButton label={strings.hostControls.replay} onPress={onReplay} />
          </View>
          <View style={styles.fill}>
            <BigButton label={strings.hostControls.quit} variant="secondary" onPress={onQuit} />
          </View>
        </View>
      )}
      <HostControlsBar onPress={onOpenPanel} />
    </View>
  );
}

interface LobbyContentProps {
  code: string;
  session: Session;
  questions: GameQuestionsState;
  serverOffsetMs: number;
}

function LobbyContent({ code, session, questions, serverOffsetMs }: LobbyContentProps) {
  // L'hôte joue aussi (spec 4.1) : son uid de joueur est celui de l'hôte.
  const uid = session.hostUid;
  const players = session.players;
  const isRegistered = players[uid] !== undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [isShortGame, setIsShortGame] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const hasEnoughPlayers = canLaunchGame(players);
  const canLaunch = hasEnoughPlayers && questions.kind === 'ready' && !isLaunching;

  // Lancement : un seul update() (LOBBY → STARTING) ; un refus affiche sa raison.
  async function launch() {
    if (questions.kind !== 'ready') return;
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const limit = isShortGame ? DEV_SHORT_GAME_QUESTIONS : undefined;
      const outcome = await launchGame(code, session, questions.questions, Date.now() + serverOffsetMs, limit);
      if (!outcome.ok) setLaunchError(strings.hostLobby.launchRefusals[outcome.reason]);
    } catch (error) {
      console.error('[engine] Lancement impossible', error);
      setLaunchError(strings.hostLobby.launchFailed);
    } finally {
      setIsLaunching(false);
    }
  }

  return (
    <>
      <View style={styles.codeBlock}>
        <Text style={textStyles.muted}>{strings.hostLobby.codeLabel}</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <ReceiverLink code={code} />

      {!isRegistered || isEditing ? (
        <View style={styles.section}>
          <Text style={textStyles.label}>{strings.hostLobby.hostJoinTitle}</Text>
          <JoinForm
            code={code}
            uid={uid}
            status={session.status}
            players={players}
            edit={isRegistered ? { onDone: () => setIsEditing(false) } : undefined}
          />
        </View>
      ) : (
        <BigButton label={strings.profile.editButton} variant="secondary" onPress={() => setIsEditing(true)} />
      )}

      {Object.keys(players).length === 0 ? (
        <Text style={textStyles.muted}>{strings.hostLobby.noPlayers}</Text>
      ) : (
        <PlayerList players={players} highlightedUid={isRegistered ? uid : undefined} />
      )}

      {/* Partie courte : tests manuels, absente de l'app publiée (__DEV__ faux). */}
      {__DEV__ && (
        <OptionToggle
          title={strings.hostLobby.shortGame.title}
          hint={strings.hostLobby.shortGame.hint}
          value={isShortGame}
          onChange={setIsShortGame}
        />
      )}

      <BigButton
        label={isLaunching ? strings.hostLobby.launching : strings.hostLobby.launchButton}
        onPress={launch}
        disabled={!canLaunch}
      />
      <LaunchHint questions={questions} hasEnoughPlayers={hasEnoughPlayers} error={launchError} />
    </>
  );
}

interface LaunchHintProps {
  questions: GameQuestionsState;
  hasEnoughPlayers: boolean;
  error: string | null;
}

// Ce qui empêche le lancement, ou l'erreur du dernier essai.
function LaunchHint({ questions, hasEnoughPlayers, error }: LaunchHintProps) {
  if (error) return <Text style={[textStyles.error, styles.centered]}>{error}</Text>;
  if (questions.kind === 'error') {
    return <Text style={[textStyles.error, styles.centered]}>{strings.hostLobby.questionsError}</Text>;
  }
  if (questions.kind === 'loading') {
    return <Text style={[textStyles.muted, styles.centered]}>{strings.hostLobby.loadingQuestions}</Text>;
  }
  if (!hasEnoughPlayers) {
    return <Text style={[textStyles.muted, styles.centered]}>{strings.hostLobby.launchRefusals.notEnoughPlayers}</Text>;
  }
  return null;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

function ReceiverLink({ code }: { code: string }) {
  const url = receiverUrl(code);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  async function copy() {
    try {
      await Clipboard.setStringAsync(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <View style={styles.linkBlock}>
      <Text style={textStyles.muted}>{strings.hostLobby.receiverLabel}</Text>
      <Text selectable style={styles.url}>
        {url}
      </Text>
      <BigButton label={strings.hostLobby.copyButton} variant="secondary" onPress={copy} />
      {copyStatus === 'copied' && <Text style={textStyles.body}>{strings.hostLobby.copied}</Text>}
      {copyStatus === 'failed' && <Text style={textStyles.error}>{strings.hostLobby.copyFailed}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  codeBlock: {
    alignItems: 'center',
  },
  code: {
    color: AppColors.accent,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 12,
  },
  section: {
    gap: Spacing.three,
  },
  linkBlock: {
    gap: Spacing.two,
  },
  url: {
    color: AppColors.text,
    fontSize: AppSizes.textBody,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  centered: {
    textAlign: 'center',
  },
  fill: {
    flex: 1,
  },
  footerStack: {
    gap: Spacing.two,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
