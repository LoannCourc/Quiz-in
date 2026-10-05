import { DEV_SHORT_GAME_QUESTIONS } from '@shared/constants';
import type { SessionUpdate } from '@shared/hostEngine';
import { canLaunchGame, connectedPlayerIds } from '@shared/players';
import {
  assignTeamUpdate,
  teamCountUpdate,
  teamDrawUpdate,
  teamLaunchRefusal,
  teamModeOf,
  teamModeUpdate,
  type TeamRefusal,
} from '@shared/teams';
import type { Session } from '@shared/types';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

import { JoinWithoutTv } from './JoinWithoutTv';
import { LobbyCodeCard } from './LobbyCodeCard';
import { LobbyHeader } from './LobbyHeader';
import { LobbyPlayerRows } from './LobbyPlayerRows';
import { TeamComposer } from './TeamComposer';
import { TvCastPill } from './TvCastPill';

interface HostLobbyProps {
  code: string;
  session: Session;
  questions: GameQuestionsState;
  serverOffsetMs: number;
  cast: CastGame;
  // Démo (/debug/lobby) : en-tête fourni sans lecture de la base, bloc « sans TV » déjà ouvert.
  header?: ReactNode;
  initialNoTvOpen?: boolean;
  // Blind test : interrupteur et adresses des extraits (absent : quiz classique, démo).
  audio?: LobbyAudio;
  // Démo : actions du salon (équipes) appliquées localement au lieu d'écrire dans la base.
  applyUpdate?: (build: LobbyUpdate) => void;
}

export type LobbyUpdate = (session: Session, nowServer: number) => SessionUpdate | null;

export type LobbyAudio = GameAudioUrls & { isEnabled: boolean };

const NO_AUDIO: LobbyAudio = { urls: {}, status: 'none', retry: () => undefined, isEnabled: false };

// Salon de l'hôte : quiz, code, TV (ou « Je n'ai pas de TV »), joueurs, et « Lancer la partie » fixé
// en bas. La page ne défile pas : seule la liste des joueurs défile, le bouton reste toujours visible.
export function HostLobby(props: HostLobbyProps) {
  const { code, session, questions, serverOffsetMs, cast, header, initialNoTvOpen = false, audio = NO_AUDIO, applyUpdate } = props;
  // L'hôte joue aussi (spec 4.1) : son uid de joueur est celui de l'hôte.
  const uid = session.hostUid;
  const players = session.players;
  const isRegistered = players[uid] !== undefined;
  const [isEditing, setIsEditing] = useState(false);
  // Replié à chaque ouverture du salon : état local, jamais mémorisé.
  const [isNoTvOpen, setIsNoTvOpen] = useState(initialNoTvOpen);
  const [isShortGame, setIsShortGame] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // Un hôte qui ne s'inscrit pas peut quand même lancer : seuls les joueurs connectés comptent.
  const hasEnoughPlayers = canLaunchGame(players);
  // Groupe : lancement possible seulement avec des équipes valides (le moteur le vérifie aussi).
  const teamRefusal = teamLaunchRefusal(session);
  const canLaunch = hasEnoughPlayers && teamRefusal === null && questions.kind === 'ready' && audio.status !== 'loading' && !isLaunching;
  const isTeamDraw = session.settings.teams && teamModeOf(session.settings) === 'random';
  const hasTeams = Object.values(players).some((player) => player.team !== undefined);

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
      {isTeamDraw ? (
        <View style={styles.footerRow}>
          <View style={styles.fill}>
            <BigButton
              label={hasTeams ? strings.teams.composer.redraw : strings.teams.composer.draw}
              variant="secondary"
              size="compact"
              onPress={() => teamAction(teamDrawUpdate)}
            />
          </View>
          <View style={styles.fill}>
            <BigButton
              label={isLaunching ? strings.hostLobby.launching : strings.hostLobby.launchButton}
              size="compact"
              onPress={launch}
              disabled={!canLaunch}
            />
          </View>
        </View>
      ) : (
        <BigButton
          label={isLaunching ? strings.hostLobby.launching : strings.hostLobby.launchButton}
          onPress={launch}
          disabled={!canLaunch}
        />
      )}
    </View>
  );

  return (
    <Screen scrollable={false} footer={footer}>
      <View style={styles.top}>
        {header ?? <LobbyHeader quizId={session.quizId} />}
        <LobbyCodeCard code={code} compact={isNoTvOpen} />
        {isNoTvOpen ? (
          <JoinWithoutTv code={code} onHide={() => setIsNoTvOpen(false)} />
        ) : (
          <>
            {cast.isAvailable && <TvCastPill cast={cast} />}
            {!cast.isTvConnected && (
              <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={() => setIsNoTvOpen(true)}>
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
        <ScrollView style={styles.playersPanel} contentContainerStyle={styles.playersContent} keyboardShouldPersistTaps="handled">
          {(!isRegistered || isEditing) && (
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
          ) : session.settings.teams ? (
            <TeamComposer
              settings={session.settings}
              players={players}
              onMode={(mode) => teamAction((current) => teamModeUpdate(current, mode))}
              onCount={(count) => teamAction((current) => teamCountUpdate(current, count))}
              onAssign={(playerId, team) => teamAction((current) => assignTeamUpdate(current, playerId, team))}
            />
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
        </ScrollView>
      </View>
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
  if (!hasEnoughPlayers) {
    return <Text style={[styles.hint, styles.centered]}>{strings.hostLobby.launchRefusals.notEnoughPlayers}</Text>;
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
  noTvLink: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  // Occupe la hauteur restante ; la liste défile à l'intérieur.
  players: {
    flex: 1,
    minHeight: 0,
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
    flexGrow: 0,
    flexShrink: 1,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  playersContent: {
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
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  fill: {
    flex: 1,
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
