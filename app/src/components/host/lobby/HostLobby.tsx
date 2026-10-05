import { DEV_SHORT_GAME_QUESTIONS } from '@shared/constants';
import type { SessionUpdate } from '@shared/hostEngine';
import { canLaunchGame, connectedPlayerIds } from '@shared/players';
import {
  assignTeamUpdate,
  lobbyTeamRefusal,
  teamCountUpdate,
  teamDrawUpdate,
  teamModeUpdate,
  type TeamRefusal,
} from '@shared/teams';
import type { Session } from '@shared/types';
import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionToggle } from '@/components/host/OptionToggle';
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

import { HostJoinCard } from './HostJoinCard';
import { JoinWithoutTv } from './JoinWithoutTv';
import { LobbyCodeCard } from './LobbyCodeCard';
import { LobbyHeader } from './LobbyHeader';
import { LobbyPlayerRows } from './LobbyPlayerRows';
import { TeamsPage } from './TeamsPage';
import { TeamsSummaryRow } from './TeamsSummaryRow';
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
  // Blind test : interrupteur et adresses des extraits (absent : quiz classique, démo).
  audio?: LobbyAudio;
  // Démo : actions du salon (équipes) appliquées localement au lieu d'écrire dans la base.
  applyUpdate?: (build: LobbyUpdate) => void;
}

export type LobbyUpdate = (session: Session, nowServer: number) => SessionUpdate | null;

export type LobbyAudio = GameAudioUrls & { isEnabled: boolean };

const NO_AUDIO: LobbyAudio = { urls: {}, status: 'none', retry: () => undefined, isEnabled: false };

// Salon de l'hôte : quiz, code, TV (ou « Je n'ai pas de TV »), joueurs, et « Lancer la partie » fixé
// en bas, toujours visible. La page défile : aucune hauteur fixe, la liste des joueurs et le formulaire
// de l'hôte gardent une hauteur confortable, même avec une grande police.
export function HostLobby(props: HostLobbyProps) {
  const { code, session, questions, serverOffsetMs, cast, header, initialNoTvOpen = false, audio = NO_AUDIO, applyUpdate } = props;
  const { initialTvDetailsOpen = false, initialTeamsOpen = false } = props;
  // L'hôte joue aussi (spec 4.1) : son uid de joueur est celui de l'hôte.
  const uid = session.hostUid;
  const players = session.players;
  const isRegistered = players[uid] !== undefined;
  const [isEditing, setIsEditing] = useState(false);
  // « Je joue aussi » : l'hôte ouvre le formulaire des joueurs.
  const [isHostJoining, setIsHostJoining] = useState(false);
  // Replié à chaque ouverture du salon : état local, jamais mémorisé.
  const [isNoTvOpen, setIsNoTvOpen] = useState(initialNoTvOpen);
  const [isTvDetailsOpen, setIsTvDetailsOpen] = useState(initialTvDetailsOpen);
  const [isTeamsOpen, setIsTeamsOpen] = useState(initialTeamsOpen);
  const closeTeams = useCallback(() => setIsTeamsOpen(false), []);
  const [isShortGame, setIsShortGame] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // Un hôte qui ne s'inscrit pas peut quand même lancer : seuls les joueurs connectés comptent.
  const hasEnoughPlayers = canLaunchGame(players);
  // Groupe : lancement possible seulement avec des équipes valides, ou tirées au lancement « Au
  // hasard » (le moteur vérifie aussi).
  const teamRefusal = lobbyTeamRefusal(session);
  const canLaunch = hasEnoughPlayers && teamRefusal === null && questions.kind === 'ready' && audio.status !== 'loading' && !isLaunching;

  // Actions du salon (équipes) : même chemin que les contrôles de l'hôte (relire, calculer, un update).
  function teamAction(build: LobbyUpdate) {
    if (applyUpdate) {
      applyUpdate(build);
      return;
    }
    applyHostAction(code, build, Date.now() + serverOffsetMs).catch((error: unknown) => {
      console.error('[teams] Action impossible', error);
      setLaunchError(strings.hostControls.actionFailed);
    });
  }
  const connectedCount = connectedPlayerIds(players).length;

  // Lancement : un seul update() (LOBBY → STARTING) ; un refus affiche sa raison.
  async function launch() {
    if (questions.kind !== 'ready') return;
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const limit = isShortGame ? DEV_SHORT_GAME_QUESTIONS : undefined;
      const launchAudio = { enabled: audio.isEnabled, urls: audio.urls };
      const outcome = await launchGame(code, session, questions.questions, Date.now() + serverOffsetMs, limit, launchAudio);
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

  const footer = (
    <View style={styles.footer}>
      <LaunchHint
        questions={questions}
        hasEnoughPlayers={hasEnoughPlayers}
        teamRefusal={teamRefusal}
        error={launchError}
        audioStatus={audio.status}
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
        onMode={(mode) => teamAction((current) => teamModeUpdate(current, mode))}
        onCount={(count) => teamAction((current) => teamCountUpdate(current, count))}
        onAssign={(playerId, team) => teamAction((current) => assignTeamUpdate(current, playerId, team))}
        onDraw={() => teamAction(teamDrawUpdate)}
        onClose={closeTeams}
      />
    );
  }

  const showJoinForm = isEditing || (!isRegistered && isHostJoining);

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        {header ?? <LobbyHeader quizId={session.quizId} />}
        {cast.isTvConnected ? (
          <TvConnectedBar code={code} isOpen={isTvDetailsOpen} onToggle={() => setIsTvDetailsOpen((open) => !open)} />
        ) : (
          <LobbyCodeCard code={code} compact={isNoTvOpen} />
        )}
        {cast.isTvConnected ? null : isNoTvOpen ? (
          <JoinWithoutTv code={code} onHide={() => setIsNoTvOpen(false)} />
        ) : (
          <>
            {cast.isAvailable && <TvCastPill cast={cast} />}
            <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={() => setIsNoTvOpen(true)}>
              <Text style={styles.noTvLink}>{strings.hostLobby.noTvLink}</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.players}>
        <View style={styles.playersHeader}>
          <Text style={styles.playersTitle}>{strings.hostLobby.playersTitle}</Text>
          <Text style={styles.playersCount}>{strings.hostLobby.connectedCount(connectedCount)}</Text>
        </View>
        <View style={styles.playersPanel}>
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
          {Object.keys(players).length === 0 ? (
            <Text style={textStyles.muted}>{strings.hostLobby.noPlayers}</Text>
          ) : (
            <LobbyPlayerRows
              players={players}
              hostUid={uid}
              onEditHost={isRegistered && !isEditing ? () => setIsEditing(true) : undefined}
            />
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
        </View>
      </View>
      {!isRegistered && !showJoinForm && <HostJoinCard onJoin={() => setIsHostJoining(true)} />}
      {session.settings.teams && <TeamsSummaryRow session={session} onPress={() => setIsTeamsOpen(true)} />}
    </Screen>
  );
}

interface LaunchHintProps {
  questions: GameQuestionsState;
  hasEnoughPlayers: boolean;
  teamRefusal: TeamRefusal | null;
  error: string | null;
  audioStatus: AudioUrlsStatus;
}

// Ce qui empêche le lancement, ou l'erreur du dernier essai.
function LaunchHint({ questions, hasEnoughPlayers, teamRefusal, error, audioStatus }: LaunchHintProps) {
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
  // Pas assez de joueurs : rien d'écrit, le bouton reste désactivé (attendre les joueurs est l'état normal).
  if (!hasEnoughPlayers) return null;
  if (teamRefusal) {
    return <Text style={[styles.hint, styles.centered]}>{strings.hostLobby.launchRefusals[teamRefusal]}</Text>;
  }
  return null;
}

const styles = StyleSheet.create({
  top: {
    gap: Spacing.three,
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
