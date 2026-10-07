import { DEV_SHORT_GAME_QUESTIONS } from '@shared/constants';
import type { SessionUpdate } from '@shared/hostEngine';
import { canLaunchGame, connectedPlayerIds } from '@shared/players';
import {
  assignTeamUpdate,
  lateJoinerUpdate,
  lobbyTeamRefusal,
  teamAssignment,
  teamCountUpdate,
  teamDrawUpdate,
  teamModeUpdate,
  teamsEnabledUpdate,
  teamsValidatedUpdate,
  type TeamRefusal,
} from '@shared/teams';
import { soundSettingsOf } from '@shared/sound';
import type { Session, SoundSettings } from '@shared/types';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SoundQuickAccess } from '@/components/host/settings/SoundQuickAccess';
import { JoinForm } from '@/components/player/JoinForm';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { CastGame } from '@/hooks/useCastGame';
import type { AudioUrlsStatus, GameAudioUrls } from '@/hooks/useAudioUrls';
import type { GameQuestionsState } from '@/hooks/useGameQuestions';
import { applyHostAction, launchGame } from '@/lib/hostGame';
import { saveSoundPreferences } from '@/lib/soundPreferences';

import { JoinWithoutTv } from './JoinWithoutTv';
import { LobbyCodeHero } from './LobbyCodeHero';
import { LobbyHeader } from './LobbyHeader';
import { LobbyPlayerGrid } from './LobbyPlayerGrid';
import { LobbySettingsRow, LobbySettingsSheet } from './LobbySettings';
import { TeamsPage } from './TeamsPage';
import { TvCastPill } from './TvCastPill';
import { TvConnectedBar } from './TvConnectedBar';

interface HostLobbyProps {
  code: string;
  session: Session;
  questions: GameQuestionsState;
  serverOffsetMs: number;
  cast: CastGame;
  // Démo (/debug/lobby) : en-tête fourni sans lecture de la base, blocs déjà ouverts.
  header?: ReactNode;
  initialNoTvOpen?: boolean;
  initialTvDetailsOpen?: boolean;
  initialTeamsOpen?: boolean;
  initialSettingsOpen?: boolean;
  // Blind test : interrupteur et adresses des extraits (absent : quiz classique, démo).
  audio?: LobbyAudio;
  // Démo : actions du salon (équipes) appliquées localement au lieu d'écrire dans la base.
  applyUpdate?: (build: LobbyUpdate) => void;
}

export type LobbyUpdate = (session: Session, nowServer: number) => SessionUpdate | null;

export type LobbyAudio = GameAudioUrls & { isEnabled: boolean };

const NO_AUDIO: LobbyAudio = { urls: {}, status: 'none', retry: () => undefined, isEnabled: false };

// Salon de l'hôte (maquette N2, « le code d'abord ») : quiz et son, code en très grand (QR et lien à la
// demande), TV (ou « Je n'ai pas de TV »), joueurs, une ligne « Réglages », et « Lancer la partie » fixé
// en bas, toujours visible. TV connectée : le bloc du code devient la barre « TV connectée ». La page
// défile s'il le faut (grande police) ; au-delà de 8 joueurs, la grille défile dans sa propre zone.
export function HostLobby(props: HostLobbyProps) {
  const { code, session, questions, serverOffsetMs, cast, header, initialNoTvOpen = false, audio = NO_AUDIO, applyUpdate } = props;
  const { initialTvDetailsOpen = false, initialTeamsOpen = false, initialSettingsOpen = false } = props;
  // L'hôte joue aussi (spec 4.1) : son uid de joueur est celui de l'hôte.
  const uid = session.hostUid;
  const players = session.players;
  const isRegistered = players[uid] !== undefined;
  const [isEditing, setIsEditing] = useState(false);
  // « Je joue aussi » : l'hôte ouvre le formulaire des joueurs.
  const [isHostJoining, setIsHostJoining] = useState(false);
  // Replié à chaque ouverture du salon : état local, jamais mémorisé. QR code et lien : « QR code » ou
  // « Je n'ai pas de TV ».
  const [isQrOpen, setIsQrOpen] = useState(initialNoTvOpen);
  const [isTvDetailsOpen, setIsTvDetailsOpen] = useState(initialTvDetailsOpen);
  const [isSettingsOpen, setIsSettingsOpen] = useState(initialSettingsOpen);
  const [isTeamsOpen, setIsTeamsOpen] = useState(initialTeamsOpen);
  const closeTeams = useCallback(() => setIsTeamsOpen(false), []);
  const [isShortGame, setIsShortGame] = useState(false);
  // Dessine-moi, développement seulement : tester plusieurs manches avec 2 appareils.
  const [isSoloDrawer, setIsSoloDrawer] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // Un hôte qui ne s'inscrit pas peut quand même lancer : seuls les joueurs connectés comptent.
  const hasEnoughPlayers = canLaunchGame(players);
  // Groupe : lancement possible seulement avec des équipes valides, ou tirées au lancement « Au
  // hasard » (le moteur vérifie aussi).
  const teamRefusal = lobbyTeamRefusal(session);
  const canLaunch = hasEnoughPlayers && teamRefusal === null && questions.kind === 'ready' && audio.status !== 'loading' && !isLaunching;

  // Actions du salon (équipes, son de la TV) : même chemin que les contrôles de l'hôte (relire, calculer,
  // un update).
  function lobbyAction(build: LobbyUpdate) {
    if (applyUpdate) {
      applyUpdate(build);
      return;
    }
    applyHostAction(code, build, Date.now() + serverOffsetMs).catch((error: unknown) => {
      console.error('[lobby] Action impossible', error);
      setLaunchError(strings.hostControls.actionFailed);
    });
  }
  // Groupe : un joueur qui rejoint après la validation des équipes est placé dans l'équipe la moins
  // nombreuse (shared/teams.ts). Calculé à nouveau sur la session relue au moment d'écrire : deux appels
  // rapprochés donnent le même placement. Sans hôte (app fermée), l'alerte « sans équipe » reste.
  const hasLateJoiner = lateJoinerUpdate(session) !== null;
  useEffect(() => {
    if (hasLateJoiner) lobbyAction((current) => lateJoinerUpdate(current));
    // lobbyAction change à chaque rendu ; seul le besoin de placer quelqu'un déclenche l'écriture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLateJoiner, session]);

  const connectedCount = connectedPlayerIds(players).length;

  // Son de la TV : mémorisé sur le téléphone et publié dans la partie (la TV l'applique aussitôt).
  function changeSound(sound: SoundSettings) {
    void saveSoundPreferences(sound);
    lobbyAction(() => ({ sound }));
  }

  // Lancement : un seul update() (LOBBY → STARTING) ; un refus affiche sa raison.
  async function launch() {
    if (questions.kind !== 'ready') return;
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const limit = isShortGame ? DEV_SHORT_GAME_QUESTIONS : undefined;
      const launchAudio = { enabled: audio.isEnabled, urls: audio.urls };
      const outcome = await launchGame(
        code,
        session,
        questions.questions,
        Date.now() + serverOffsetMs,
        limit,
        launchAudio,
        __DEV__ && isSoloDrawer,
      );
      if (!outcome.ok) setLaunchError(strings.hostLobby.launchRefusals[outcome.reason]);
      // Extrait manquant : nouvel essai tout de suite, l'hôte pourra relancer dans un instant.
      if (!outcome.ok && outcome.reason === 'audioUnavailable') audio.retry();
    } catch (error) {
      console.error('[engine] Lancement impossible', error);
      setLaunchError(strings.hostLobby.launchFailed);
    } finally {
      setIsLaunching(false);
    }
  }

  // Pied fixe (maquette N2) : la ligne « Réglages », puis ce qui empêche le lancement, puis le bouton.
  const footer = (
    <View style={styles.footer}>
      <LobbySettingsRow onPress={() => setIsSettingsOpen(true)} />
      <LaunchHint
        questions={questions}
        hasEnoughPlayers={hasEnoughPlayers}
        teamRefusal={teamRefusal}
        unassignedCount={teamAssignment(session).unassigned}
        error={launchError}
        audioStatus={audio.status}
        connectedCount={connectedCount}
      />
      <BigButton
        label={isLaunching ? strings.hostLobby.launching : strings.hostLobby.launchButton}
        onPress={launch}
        disabled={!canLaunch}
      />
    </View>
  );

  // Groupe : la page « Équipes » remplace le salon tant qu'elle est ouverte.
  if (isTeamsOpen && session.settings.teams) {
    return (
      <TeamsPage
        session={session}
        onMode={(mode) => lobbyAction((current) => teamModeUpdate(current, mode))}
        onCount={(count) => lobbyAction((current) => teamCountUpdate(current, count))}
        onAssign={(playerId, team) => lobbyAction((current) => assignTeamUpdate(current, playerId, team))}
        onDraw={() => lobbyAction(teamDrawUpdate)}
        onClose={closeTeams}
        onValidate={() => {
          lobbyAction(teamsValidatedUpdate);
          closeTeams();
        }}
      />
    );
  }

  const showJoinForm = isEditing || (!isRegistered && isHostJoining);

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        <View style={styles.headerRow}>
          <View style={styles.fill}>{header ?? <LobbyHeader quizId={session.quizId} />}</View>
          <SoundQuickAccess sound={soundSettingsOf(session)} onChange={changeSound} />
        </View>
        {cast.isTvConnected ? (
          <TvConnectedBar code={code} isOpen={isTvDetailsOpen} onToggle={() => setIsTvDetailsOpen((open) => !open)} />
        ) : (
          <>
            <LobbyCodeHero code={code} isQrOpen={isQrOpen} onToggleQr={() => setIsQrOpen((open) => !open)} />
            {isQrOpen && <JoinWithoutTv code={code} onHide={() => setIsQrOpen(false)} />}
            {cast.isAvailable && <TvCastPill cast={cast} />}
            {!isQrOpen && (
              <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={() => setIsQrOpen(true)}>
                <Text style={styles.noTvLink}>{strings.hostLobby.noTvLink}</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      <View style={styles.players}>
        <View style={styles.playersHeader}>
          <Text style={styles.playersTitle}>{strings.hostLobby.playersTitle}</Text>
          <Text style={styles.playersCount}>{strings.hostLobby.connectedCount(connectedCount)}</Text>
        </View>
        {showJoinForm && (
          <View style={styles.joinForm}>
            <Text style={textStyles.label}>{strings.hostLobby.hostJoinTitle}</Text>
            <JoinForm
              code={code}
              uid={uid}
              status={session.status}
              players={players}
              edit={isRegistered ? { onDone: () => setIsEditing(false) } : undefined}
            />
          </View>
        )}
        <LobbyPlayerGrid players={players} hostUid={uid} />
      </View>
      <LobbySettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        session={session}
        onTeamsEnabled={(enabled) => lobbyAction((current) => teamsEnabledUpdate(current, enabled))}
        onOpenTeams={() => setIsTeamsOpen(true)}
        isHostRegistered={isRegistered}
        onHostProfile={() => (isRegistered ? setIsEditing(true) : setIsHostJoining(true))}
        isShortGame={isShortGame}
        onShortGame={setIsShortGame}
        isSoloDrawer={isSoloDrawer}
        onSoloDrawer={setIsSoloDrawer}
      />
    </Screen>
  );
}

interface LaunchHintProps {
  questions: GameQuestionsState;
  hasEnoughPlayers: boolean;
  teamRefusal: TeamRefusal | null;
  // Joueurs sans équipe (nombre exact, dans le motif du refus).
  unassignedCount: number;
  error: string | null;
  audioStatus: AudioUrlsStatus;
  connectedCount: number;
}

// Ce qui empêche le lancement, ou l'erreur du dernier essai.
function LaunchHint({ questions, hasEnoughPlayers, teamRefusal, unassignedCount, error, audioStatus, connectedCount }: LaunchHintProps) {
  if (error) return <Text style={[textStyles.error, styles.centered]}>{error}</Text>;
  if (questions.kind === 'error') {
    return <Text style={[textStyles.error, styles.centered]}>{strings.hostLobby.questionsError}</Text>;
  }
  if (audioStatus === 'loading') {
    return <Text style={[styles.hint, styles.centered]}>{strings.hostLobby.preparingAudio}</Text>;
  }
  if (audioStatus === 'missing') {
    return <Text style={[textStyles.error, styles.centered]}>{strings.hostLobby.launchRefusals.audioUnavailable}</Text>;
  }
  if (questions.kind === 'loading') {
    return <Text style={[styles.hint, styles.centered]}>{strings.hostLobby.loadingQuestions}</Text>;
  }
  // Personne encore : l'état normal du salon, dit simplement au-dessus du bouton grisé.
  if (connectedCount === 0) return <Text style={[styles.hint, styles.centered]}>{strings.hostLobby.waitingPlayers}</Text>;
  if (!hasEnoughPlayers) return null;
  if (teamRefusal === 'teamsUnassigned' && unassignedCount > 0) {
    return <Text style={[textStyles.error, styles.centered]}>{strings.hostLobby.unassignedLaunch(unassignedCount)}</Text>;
  }
  if (teamRefusal) {
    return <Text style={[styles.hint, styles.centered]}>{strings.hostLobby.launchRefusals[teamRefusal]}</Text>;
  }
  return null;
}

const styles = StyleSheet.create({
  top: {
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  fill: {
    flex: 1,
  },
  noTvLink: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  players: {
    gap: Spacing.two,
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  playersTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  playersCount: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
  playersPanel: {
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  joinForm: {
    gap: Spacing.three,
  },
  footer: {
    gap: Spacing.two,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 15,
  },
  centered: {
    textAlign: 'center',
  },
});
