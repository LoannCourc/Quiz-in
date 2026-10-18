import { DEV_SHORT_GAME_QUESTIONS } from '@shared/constants';
import type { SessionUpdate } from '@shared/hostEngine';
import { drawRoundsOf, drawRoundsUpdate } from '@shared/drawGame';
import { canLaunchGame, connectedPlayerIds, hostLeaveUpdate, removePlayerUpdate } from '@shared/players';
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
import { poolOf } from '@shared/questionPool';
import type { Session, SoundSettings } from '@shared/types';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SoundQuickAccess } from '@/components/host/settings/SoundQuickAccess';
import { BackButton } from '@/components/ui/BackButton';
import { BigButton } from '@/components/ui/BigButton';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { CastGame } from '@/hooks/useCastGame';
import type { AudioUrlsStatus, GameAudioUrls } from '@/hooks/useAudioUrls';
import type { GameQuestionsState } from '@/hooks/useGameQuestions';
import { confirmAction } from '@/lib/confirm';
import { applyHostAction, launchGame } from '@/lib/hostGame';
import { markQuestionsPlayed } from '@/lib/playedQuestions';
import { markQuizPlayed } from '@/lib/playedQuizzes';
import { saveSoundPreferences } from '@/lib/soundPreferences';
import { consumeTvRetry } from '@/lib/tvRetry';

import { LobbyCodeHero } from './LobbyCodeHero';
import { LobbyHeader } from './LobbyHeader';
import { LobbyPlayerGrid } from './LobbyPlayerGrid';
import { LobbySettingsRow, LobbySettingsSheet } from './LobbySettings';
import { TeamsPage } from './TeamsPage';
import { DisplayOptionsSheet, type DisplayOption } from './DisplayOptionsSheet';
import { InviteSheet } from './InviteSheet';
import { LocalNetworkSheet } from './LocalNetworkSheet';
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
  initialDisplayOptionsOpen?: boolean;
  initialInviteOpen?: boolean;
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
  const { code, session, questions, serverOffsetMs, cast, header, initialDisplayOptionsOpen = false, audio = NO_AUDIO, applyUpdate } = props;
  const { initialTeamsOpen = false, initialSettingsOpen = false, initialInviteOpen = false } = props;
  // L'hôte joue aussi (spec 4.1) : son uid de joueur est celui de l'hôte.
  const uid = session.hostUid;
  const players = session.players;
  // Replié à chaque ouverture du salon : état local, jamais mémorisé. QR code et lien : « QR code » ou
  // « Je n'ai pas de TV ».
  const { showTvPicker, needsLocalNetworkExplanation } = cast;
  // iOS, première fois : explication du réseau local, puis la liste une fois la feuille disparue.
  const [isLocalNetworkSheetOpen, setIsLocalNetworkSheetOpen] = useState(false);
  const isTvPickerAfterSheet = useRef(false);
  const openTvPicker = useCallback(() => {
    if (needsLocalNetworkExplanation) setIsLocalNetworkSheetOpen(true);
    else showTvPicker();
  }, [needsLocalNetworkExplanation, showTvPicker]);

  // Retour de l'aide par « Réessayer » : la liste des TV se rouvre (l'icône Cast native est ici).
  useFocusEffect(
    useCallback(() => {
      if (consumeTvRetry()) openTvPicker();
    }, [openTvPicker]),
  );
  // « Autres façons d'afficher » : l'écran choisi s'ouvre une fois la feuille fermée (sur iOS, une feuille
  // encore à l'écran resterait par-dessus le nouvel écran).
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(initialDisplayOptionsOpen);
  const chosenDisplay = useRef<DisplayOption | null>(null);
  const openDisplayOption = useCallback(
    (option: DisplayOption) => (option === 'tvHelp' ? router.push('/tv-help') : router.push({ pathname: '/tv-computer', params: { code } })),
    [code],
  );
  // Feuille « Inviter des joueurs » (QR code et lien des joueurs).
  const [isInviteOpen, setIsInviteOpen] = useState(initialInviteOpen);
  const [isSettingsOpen, setIsSettingsOpen] = useState(initialSettingsOpen);
  const [isTeamsOpen, setIsTeamsOpen] = useState(initialTeamsOpen);
  const closeTeams = useCallback(() => setIsTeamsOpen(false), []);
  const [isShortGame, setIsShortGame] = useState(false);
  // Dessine-moi, développement seulement : un seul dessinateur pour toutes les manches.
  const [isSingleDrawer, setIsSingleDrawer] = useState(false);
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
      const singleDrawer = __DEV__ && isSingleDrawer;
      const outcome = await launchGame(code, session, questions.questions, Date.now() + serverOffsetMs, limit, launchAudio, singleDrawer);
      if (!outcome.ok) setLaunchError(strings.hostLobby.launchRefusals[outcome.reason]);
      // Lot E : le quiz porte le repère « déjà fait » dans le catalogue de ce téléphone.
      if (outcome.ok) {
        // « Déjà fait » : un quiz choisi seul ; questions jouées : toujours (tirages suivants).
        if (poolOf(session.settings) === null) void markQuizPlayed(session.quizId);
        void markQuestionsPlayed(questions.refs);
      }
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

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        <View style={styles.headerRow}>
          <BackButton />
          <View style={styles.fill}>{header ?? <LobbyHeader quizId={session.quizId} drawRounds={drawRoundsOf(session.settings)} settings={session.settings} />}</View>
          <SoundQuickAccess sound={soundSettingsOf(session)} onChange={changeSound} />
        </View>
        {cast.isTvConnected ? (
          <TvConnectedBar code={code} onDetails={() => setIsInviteOpen(true)} />
        ) : (
          <>
            <LobbyCodeHero code={code} />
            {cast.isAvailable && <TvCastPill onPress={openTvPicker} />}
            {/* Recherche Cast sans résultat depuis 8 s : le bandeau mène tout droit à l'aide Chromecast. */}
            {cast.noTvFound && (
              <Pressable accessibilityRole="link" onPress={() => router.push('/tv-help')} style={styles.noTvFoundBanner}>
                <Text style={styles.noTvFoundText}>
                  {strings.hostLobby.noTvFoundBanner} <Text style={styles.noTvFoundAction}>{strings.hostLobby.noTvFoundAction}</Text>
                </Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" onPress={() => setIsDisplayOptionsOpen(true)} style={styles.displayOptionsButton}>
              <Text style={styles.displayOptionsLink}>{strings.hostLobby.displayOptionsLink}</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.players}>
        <View style={styles.playersHeader}>
          <View style={styles.playersTitleRow}>
            <Text style={styles.playersTitle}>{strings.hostLobby.playersTitle}</Text>
            <Text style={styles.playersCount}>{strings.hostLobby.connectedCount(connectedCount)}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setIsInviteOpen(true)} style={({ pressed }) => [styles.inviteButton, pressed && styles.pressed]}>
            <ButtonLabel stretch={false} style={styles.inviteLabel}>{`+ ${strings.hostLobby.inviteButton}`}</ButtonLabel>
          </Pressable>
        </View>
        <LobbyPlayerGrid
          players={players}
          hostUid={uid}
          onRemove={(playerId, name) =>
            confirmAction(strings.hostLobby.removeConfirm(name), () => lobbyAction((current) => removePlayerUpdate(current, playerId)))
          }
        />
      </View>
      <LobbySettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        code={code}
        session={session}
        onRounds={(rounds) => lobbyAction((current) => drawRoundsUpdate(current, rounds))}
        onTeamsEnabled={(enabled) => lobbyAction((current) => teamsEnabledUpdate(current, enabled))}
        onOpenTeams={() => setIsTeamsOpen(true)}
        onHostLeave={() => lobbyAction((current) => hostLeaveUpdate(current))}
        isShortGame={isShortGame}
        onShortGame={setIsShortGame}
        isSingleDrawer={isSingleDrawer}
        onSingleDrawer={setIsSingleDrawer}
      />
      <InviteSheet code={code} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <DisplayOptionsSheet
        isOpen={isDisplayOptionsOpen}
        onClose={() => setIsDisplayOptionsOpen(false)}
        onChoose={(option) => {
          setIsDisplayOptionsOpen(false);
          if (Platform.OS === 'ios') chosenDisplay.current = option;
          else openDisplayOption(option);
        }}
        onDismissed={() => {
          const option = chosenDisplay.current;
          chosenDisplay.current = null;
          if (option) openDisplayOption(option);
        }}
      />
      <LocalNetworkSheet
        isOpen={isLocalNetworkSheetOpen}
        onContinue={() => {
          isTvPickerAfterSheet.current = true;
          setIsLocalNetworkSheetOpen(false);
        }}
        onLater={() => setIsLocalNetworkSheetOpen(false)}
        onDismissed={() => {
          if (!isTvPickerAfterSheet.current) return;
          isTvPickerAfterSheet.current = false;
          showTvPicker();
        }}
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
  // Dessine-moi à deux : le seul dessinateur possible dessine toutes les manches (information, sans blocage).
}

// Ce qui empêche le lancement, ou l'erreur du dernier essai.

function LaunchHint(props: LaunchHintProps) {
  const { questions, hasEnoughPlayers, teamRefusal, unassignedCount, error, audioStatus, connectedCount } = props;
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
  // Lien discret sous « Afficher sur la TV » (zone de toucher de 44 au moins).
  displayOptionsButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  displayOptionsLink: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  // Recherche des TV sans résultat depuis 8 s : bandeau vers l'aide Chromecast.
  noTvFoundBanner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  noTvFoundText: {
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  noTvFoundAction: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    textDecorationLine: 'underline',
  },
  players: {
    gap: Spacing.two,
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  playersTitleRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: Spacing.two,
  },
  inviteButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  pressed: {
    opacity: 0.7,
  },
  inviteLabel: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 15,
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
