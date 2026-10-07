import { voteProgress } from '@shared/bluff';
import type { ValidationDecisions } from '@shared/freeAnswers';
import { isClassicQuestion } from '@shared/gameQuestions';
import {
  endUpdate,
  hostControls,
  pauseUpdate,
  replayUpdate,
  resumeUpdate,
  type HostControls,
  type SessionUpdate,
} from '@shared/hostEngine';
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { soundSettingsOf } from '@shared/sound';
import type { GameQuestion, Question, Session, SoundSettings } from '@shared/types';
import { expectedAnswer, reviewCounts, reviewGroups, type ReviewGroup } from '@shared/validationReview';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HostControlsBar, HostControlsPanel, type HostActions } from '@/components/host/HostControls';
import { HostLobby } from '@/components/host/lobby/HostLobby';
import { TvCastButton } from '@/components/host/TvCastButton';
import { HostValidation } from '@/components/host/validation/HostValidation';
import { PlayerGame } from '@/components/player/game/PlayerGame';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useAnswer } from '@/hooks/useAnswer';
import { useBluff } from '@/hooks/useBluff';
import { useDraw } from '@/hooks/useDraw';
import { useAudioUrls } from '@/hooks/useAudioUrls';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useCastGame, type CastGame } from '@/hooks/useCastGame';
import { useGameQuestions } from '@/hooks/useGameQuestions';
import { useHostEngine } from '@/hooks/useHostEngine';
import { useHostAbsence, type HostConnection } from '@/hooks/useHostAbsence';
import { useLeaveGuard } from '@/hooks/useLeaveGuard';
import { useLiveValue } from '@/hooks/useLiveValue';
import { useLobbyCleanup } from '@/hooks/useLobbyCleanup';
import { usePresence } from '@/hooks/usePresence';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { confirmAction } from '@/lib/confirm';
import { cancelHostAbsenceMarker } from '@/lib/hostAbsence';
import { applyHostAction, deleteGame, publishAudioUrl } from '@/lib/hostGame';
import { clearHostedGameCode, saveHostedGameCode } from '@/lib/hostedGameStorage';
import { publishSound, saveSoundPreferences } from '@/lib/soundPreferences';

// Écran de l'hôte : salon (HostLobby), puis la partie, pilotée par le
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
  const wasRemoved = session.kind === 'ready' && session.wasRemoved;

  // Partie supprimée pendant l'absence de l'hôte : plus d'écriture de départ, plus de reprise.
  useEffect(() => {
    if (!wasRemoved) return;
    cancelHostAbsenceMarker(code).catch((error: unknown) => console.warn('[absence] Annulation impossible', error));
    void clearHostedGameCode();
  }, [code, wasRemoved]);

  if (session.kind === 'loading') {
    return (
      <Screen>
        <Text style={textStyles.body}>{strings.hostLobby.loading}</Text>
      </Screen>
    );
  }
  if (current === null && wasRemoved) {
    return (
      <Screen>
        <Text style={[textStyles.body, styles.centered]}>{strings.hostGame.gameDeleted}</Text>
        <BigButton label={strings.hostGame.backToCatalog} onPress={() => router.replace('/')} />
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

// Question à choix ou à saisie (validation du Contrôle) ; jamais une question de Bluff ni de dessin.
function classicQuestion(question: GameQuestion | undefined): Question | undefined {
  return question && isClassicQuestion(question) ? question : undefined;
}

// Partie en cours : de STARTING jusqu'avant END.
function isInProgress(session: Session): boolean {
  return session.status !== 'lobby' && session.status !== 'ended';
}

function HostGame({ code, session }: { code: string; session: Session }) {
  const questions = useGameQuestions(code, session.quizId, session.settings.answerMode);
  const serverOffsetMs = useServerTimeOffset();
  const uid = session.hostUid;
  const isRegistered = session.players[uid] !== undefined;
  const inProgress = isInProgress(session);

  const connection = useHostAbsence(code, session, serverOffsetMs);
  const gameQuestions = questions.kind === 'ready' ? questions.questions : null;
  // Blind test : adresses des extraits, récupérées dès le salon et renouvelées avant expiration.
  const isBlindTestEnabled = useBlindTestEnabled();
  const audio = useAudioUrls(gameQuestions, isBlindTestEnabled);
  const engine = useHostEngine({
    code,
    session,
    questions: gameQuestions,
    serverOffsetMs,
    canWrite: connection.canWrite,
    audioUrls: audio.urls,
  });
  // Même présence que les autres joueurs : il compte dans les joueurs connectés.
  usePresence(code, isRegistered ? uid : null);
  const cast = useCastGame(code, session, connection.canWrite, serverOffsetMs);
  // Départ volontaire confirmé : pause avant de quitter l'écran (pas hors ligne : elle partirait en retard).
  useLeaveGuard(inProgress, async () => {
    if (connection.canWrite) await applyHostAction(code, pauseUpdate, Date.now() + serverOffsetMs);
  });
  useLobbyCleanup(code, session);

  // Adresse renouvelée pendant la partie : republiée pour l'extrait en cours (aussi pendant une pause).
  useEffect(() => {
    if (!gameQuestions || !connection.canWrite || !inProgress) return;
    publishAudioUrl(code, gameQuestions, audio.urls).catch((error: unknown) =>
      console.warn('[audio] Adresse non republiée', error),
    );
  }, [code, gameQuestions, audio.urls, connection.canWrite, inProgress]);

  // Partie terminée : plus rien à reprendre après une relance de l'app.
  useEffect(() => {
    if (session.status === 'ended') void clearHostedGameCode();
  }, [session.status]);

  return (
    <>
      {inProgress && <KeepScreenOn />}
      {session.status === 'lobby' ? (
        <HostLobby
          code={code}
          session={session}
          questions={questions}
          serverOffsetMs={serverOffsetMs}
          cast={cast}
          audio={{ ...audio, isEnabled: isBlindTestEnabled }}
        />
      ) : (
        <HostInGame
          code={code}
          session={session}
          serverOffsetMs={serverOffsetMs}
          isRegistered={isRegistered}
          question={classicQuestion(gameQuestions?.[session.currentIndex])}
          onSkip={engine.skip}
          onCancelDraw={engine.cancelDrawRound}
          isWriteRefused={engine.isWriteRefused}
          connection={connection}
          cast={cast}
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
  // Question en cours (questions de la partie lues par l'hôte) : pour la validation (Contrôle).
  question: Question | undefined;
  onSkip: (decisions?: ValidationDecisions) => void;
  // Dessine-moi : « Annuler la manche » (après confirmation).
  onCancelDraw: () => void;
  // Écriture de l'hôte refusée par les règles de la base.
  isWriteRefused: boolean;
  connection: HostConnection;
  cast: CastGame;
}

// Pendant la partie, l'hôte inscrit joue comme les autres. Ses contrôles sont dans le pied
// d'écran (bouton « Hôte » et panneau ; Reprendre en pause ; Rejouer / Quitter à la fin).
function HostInGame({ code, session, serverOffsetMs, isRegistered, question, onSkip, onCancelDraw, isWriteRefused, connection, cast }: HostInGameProps) {
  const { answer, onAnswer } = useAnswer(code, session.hostUid, session);
  const bluff = useBluff(code, session.hostUid, session);
  // Dessine-moi : l'hôte qui joue ne dessine jamais (D1), il regarde la TV.
  const draw = useDraw(code, session.hostUid, session);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Contrôle : coches de l'hôte pour la question en cours, gardées dans l'app jusqu'à « Valider »
  // (perdues si l'app est tuée : la correction automatique reprend, limite acceptée).
  const [review, setReview] = useState<{ index: number; decisions: ValidationDecisions }>({ index: -1, decisions: {} });
  const decisions = review.index === session.currentIndex ? review.decisions : {};
  const isValidation = session.status === 'validation' && question !== undefined;
  const groups: ReviewGroup[] =
    isValidation && question
      ? reviewGroups(question, session.answers?.[session.currentIndex] ?? {}, Object.keys(session.players), decisions)
      : [];

  // Une action = relire la session, calculer l'update (shared/hostEngine.ts), un seul update().
  async function act(buildUpdate: (current: Session, nowServer: number) => SessionUpdate | null) {
    setActionError(null);
    if (!connection.canWrite) return;
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
      // D'abord annuler l'écriture de départ, sinon elle recréerait un hostLeftAt orphelin.
      cancelHostAbsenceMarker(code)
        .then(() => deleteGame(code))
        .catch((error: unknown) => console.error('[engine] Suppression de la partie impossible', error));
    });
  }

  // Bluff, vote sans minuteur : qui n'a pas encore voté, et « Clore le vote » (confirmation s'il en manque).
  const votes = session.status === 'vote' ? voteProgress(session) : null;
  function closeVote() {
    const missing = votes?.missing.length ?? 0;
    if (missing === 0) onSkip();
    else confirmAction(strings.hostControls.closeVoteConfirm(missing), () => onSkip());
  }

  const actions: HostActions = {
    // Pendant la validation, Passer valide avec les coches actuelles.
    skip: () => onSkip(session.status === 'validation' ? decisions : undefined),
    pause: () => void act(pauseUpdate),
    resume: () => void act(resumeUpdate),
    end: () => confirmAction(strings.hostControls.endConfirm, () => void act(endUpdate)),
    replay: () => void replay(),
    quit,
    showTv: cast.showTvPicker,
    cancelDraw: () => confirmAction(strings.hostControls.cancelDrawConfirm, onCancelDraw),
  };

  // Hors ligne : seulement le message, aucun contrôle (rien ne doit partir en file d'attente).
  const footer = connection.isOffline ? (
    <ConnectionLostNotice />
  ) : (
    <HostFooter
      status={session.status}
      error={actionError}
      notice={hostNotice(connection, cast, isWriteRefused)}
      showCastButton={cast.isAvailable}
      onOpenPanel={() => setIsPanelOpen(true)}
      onResume={actions.resume}
      onReplay={actions.replay}
      onQuit={actions.quit}
      awaitingNext={hostControls(session).awaitingNext}
      onNext={actions.skip}
      validation={isValidation ? { counts: reviewCounts(groups), onValidate: actions.skip } : null}
      vote={votes ? { missingNames: votes.missing.map((id) => session.players[id]?.name ?? '?'), onClose: closeVote } : null}
    />
  );
  // Son de la TV : mémorisé sur le téléphone et publié dans la partie, que la TV applique aussitôt.
  async function changeSound(next: SoundSettings) {
    setActionError(null);
    if (!connection.canWrite) return;
    void saveSoundPreferences(next);
    try {
      await publishSound(code, next);
    } catch (error) {
      console.warn('[son] Réglage non publié', error);
      setActionError(strings.sound.publishFailed);
    }
  }

  const overlay = isPanelOpen && !connection.isOffline ? (
    <HostControlsPanel
      controls={hostControls(session)}
      actions={actions}
      canShowTv={cast.isAvailable}
      sound={soundSettingsOf(session)}
      onSoundChange={changeSound}
      onClose={() => setIsPanelOpen(false)}
    />
  ) : null;

  // Contrôle : l'hôte (joueur ou non) valide les réponses avant la révélation (maquette V1).
  if (isValidation && question) {
    return (
      <View style={styles.fill}>
        <Screen footer={footer}>
          <HostValidation
            session={session}
            question={question}
            expected={expectedAnswer(question)}
            groups={groups}
            decisions={decisions}
            onChange={(next) => setReview({ index: session.currentIndex, decisions: next })}
          />
        </Screen>
        {overlay}
      </View>
    );
  }
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
      bluff={bluff}
      draw={draw}
      footer={footer}
      overlay={overlay}
    />
  );
}

// Message au-dessus des contrôles quand la partie est en pause pour une raison extérieure.
function hostNotice(connection: HostConnection, cast: CastGame, isWriteRefused: boolean): string | null {
  if (isWriteRefused) return strings.hostGame.writeRefused;
  if (cast.castInterrupted) return strings.hostGame.castInterrupted;
  if (connection.returnedFromAbsence) return strings.hostGame.returnedFromAbsence;
  return null;
}

function ConnectionLostNotice() {
  return (
    <View style={styles.footerStack}>
      <Text style={[textStyles.label, styles.centered]}>{strings.hostGame.connectionLost}</Text>
      <Text style={[textStyles.muted, styles.centered]}>{strings.hostGame.connectionLostHint}</Text>
    </View>
  );
}

interface HostFooterProps {
  status: Session['status'];
  error: string | null;
  notice: string | null;
  showCastButton: boolean;
  onOpenPanel: () => void;
  onResume: () => void;
  onReplay: () => void;
  onQuit: () => void;
  // Pas à pas : la révélation attend l'hôte ; même action que Passer (verrou contre le double appui).
  awaitingNext: HostControls['awaitingNext'];
  onNext: () => void;
  // Contrôle : bilan des coches et « Valider les réponses » (null hors de la validation).
  validation: { counts: ReturnType<typeof reviewCounts>; onValidate: () => void } | null;
  // Bluff, vote sans minuteur : qui n'a pas encore voté, et « Clore le vote » (null hors du vote).
  vote: { missingNames: string[]; onClose: () => void } | null;
}

// Pied d'écran de l'hôte, sur tous les écrans de partie : la barre « Contrôles de l'hôte »
// (panneau), précédée de Reprendre en pause, et de Rejouer / Quitter en fin de partie.
function HostFooter({
  status,
  error,
  notice,
  showCastButton,
  onOpenPanel,
  onResume,
  onReplay,
  onQuit,
  awaitingNext,
  onNext,
  validation,
  vote,
}: HostFooterProps) {
  return (
    <View style={styles.footerStack}>
      {notice && <Text style={[textStyles.body, styles.centered]}>{notice}</Text>}
      {error && <Text style={[textStyles.error, styles.centered]}>{error}</Text>}
      {status === 'paused' && <BigButton label={strings.hostControls.resume} onPress={onResume} />}
      {awaitingNext && <BigButton label={strings.hostControls.next[awaitingNext]} onPress={onNext} />}
      {validation && (
        <>
          <Text style={[textStyles.muted, styles.centered]}>{strings.hostValidation.counts(validation.counts)}</Text>
          <BigButton label={strings.hostControls.validate} onPress={validation.onValidate} />
        </>
      )}
      {vote && (
        <>
          <Text style={[textStyles.muted, styles.centered]}>{strings.hostControls.voteMissing(vote.missingNames)}</Text>
          <BigButton label={strings.hostControls.closeVote} onPress={vote.onClose} />
        </>
      )}
      {status === 'ended' && (
        <View style={styles.footerRow}>
          <View style={styles.fill}>
            <BigButton label={strings.hostControls.replay} size="compact" onPress={onReplay} />
          </View>
          <View style={styles.fill}>
            <BigButton label={strings.hostControls.quit} variant="secondary" size="compact" onPress={onQuit} />
          </View>
        </View>
      )}
      <View style={styles.barRow}>
        <View style={styles.fill}>
          <HostControlsBar onPress={onOpenPanel} />
        </View>
        {/* Icône Cast : état de la TV, et cible de « Afficher sur la TV » dans le panneau. */}
        {showCastButton && <TvCastButton />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  fill: {
    flex: 1,
  },
  footerStack: {
    gap: Spacing.two,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
});
