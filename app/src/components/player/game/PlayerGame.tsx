import { voteProgress } from '@shared/bluff';
import { CORRECT_ANSWER_POINTS, isKnownAnswerMode } from '@shared/constants';
import { isDrawGuesser } from '@shared/drawGuess';
import { hasRankingStep, isAwaitingHost, nextQuestionCountdown, upcomingQuestionNumber } from '@shared/gameFlow';
import { answeredProgress, connectedPlayerIds } from '@shared/players';
import { SUSPENSE_DRUMROLL_MS } from '@shared/sound';
import { revealStreak } from '@shared/streak';
import { bestPlayerByTeam, rankInTeam, teamRanking } from '@shared/teams';
import { isTvPresent } from '@shared/tvPresence';
import type { PlayerId, PlayerResult, PublicSession } from '@shared/types';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import type { AppBackgroundName } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useDelayPassed } from '@/hooks/useDelayPassed';
import type { PlayerBluff } from '@/lib/playerBluff';
import type { PlayerDraw } from '@/lib/playerDraw';
import {
  correctChoiceIndex,
  effectiveAnswer,
  isFreeText,
  myResult,
  rankedPlayers,
  revealOutcome,
  type AnswerState,
  type GivenAnswer,
} from '@/lib/playerGame';

import { AnswerSentView, ValidationWaitView } from './AnswerSentView';
import { BluffRevealView, BluffVoteView, BluffWriteView, type BluffProgressPlayer } from './BluffViews';
import { Confetti } from './Confetti';
import { FreeQuestionView } from './FreeQuestionView';
import type { PhaseTiming } from './phaseTiming';
import { QuestionHeader } from './QuestionHeader';
import { QuestionView } from './QuestionView';
import { RevealView, type FreeRevealInfo } from './RevealView';
import { DrawerTopBar, DrawerView, DrawGuessView, DrawRevealView, DrawSpectatorView } from './DrawViews';
import { EndView, OutdatedView, PausedView, StartingView, WaitingView } from './StatusViews';
import { TeamEndScreen, type TeamGameInfo } from './TeamViews';
import { AwaitingScoresPhase, ScoresPhase, WaitHeader, type WaitInfo } from './TransitionViews';

export interface PlayerGameProps {
  // Champs publics de la session (jamais answers) : mêmes données pour la démo et la vraie partie.
  session: PublicSession;
  uid: PlayerId;
  serverOffsetMs: number;
  // Réponse locale à la question courante (appui en cours, refus…).
  answer: AnswerState;
  // Index de la proposition, ou texte saisi en Réponse libre.
  onAnswer: (given: GivenAnswer) => void;
  // Message affiché au-dessus de l'écran (profil modifié au moment du lancement).
  notice?: string;
  // Hôte : pied d'écran fixe (bouton des contrôles, Reprendre, Rejouer / Quitter), qui réserve
  // sa place sous le contenu, et calque par-dessus l'écran (panneau des contrôles).
  footer?: ReactNode;
  overlay?: ReactNode;
  // Bluff : proposition, verdict et vote du joueur (useBluff) ; absent hors d'une partie de Bluff.
  bluff?: PlayerBluff | null;
  // Dessine-moi : mot du dessinateur et envoi de son dessin (useDraw) ; absent hors de ce jeu.
  draw?: PlayerDraw | null;
}

// Bonus de rapidité contenu dans les points d'une bonne réponse (option Rapidité seulement).
function speedBonusOf(session: PublicSession, result: PlayerResult | undefined): number | undefined {
  if (!session.settings.speedBonus || !result?.correct) return undefined;
  return result.points - CORRECT_ANSWER_POINTS;
}

// Écran du joueur pendant la partie, en plein écran, choisi d'après l'état de la session.
// Aucun accès à Firebase : la page parente fournit les données.
export function PlayerGame(props: PlayerGameProps) {
  const { session, uid } = props;
  // Suspense : le classement final attend la fin du roulement de tambour de la TV (spec 17).
  const isSuspenseEnd = session.status === 'ended' && session.settings.suspense === true;
  const isEndShown = useDelayPassed(session.phaseStartedAt, isSuspenseEnd ? SUSPENSE_DRUMROLL_MS : 0, props.serverOffsetMs);
  const outcome = session.status === 'reveal' ? revealOutcome(myResult(session, uid)) : undefined;
  // Fond festif seulement pour une bonne réponse ; ton plus doux sinon.
  const background: AppBackgroundName = outcome === 'correct' ? 'celebration' : 'main';
  // Confettis : une fois à la révélation d'une bonne réponse et à la fin de partie.
  const showConfetti = outcome === 'correct' || (session.status === 'ended' && isEndShown);
  // Dessinateur pendant sa manche : la page ne défile pas (le doigt dessine).
  const isDrawing = isDrawerNow(props);
  return (
    <View style={styles.root}>
      <Screen
        background={background}
        header={isEndShown ? questionTopBar(props) : undefined}
        footer={props.footer}
        scrollable={!isDrawing}>
        {props.notice && <Text style={[textStyles.body, styles.notice]}>{props.notice}</Text>}
        {isEndShown ? renderView(props) : <SuspenseEndView isTeams={session.settings.teams} />}
      </Screen>
      {showConfetti && <Confetti key={`${session.status}-${session.phaseStartedAt}`} />}
      {props.overlay}
    </View>
  );
}

// Dessine-moi : le joueur est le dessinateur de la manche en cours (jamais l'hôte, décision D1).
function isDrawerNow({ session, uid, draw }: PlayerGameProps): boolean {
  return Boolean(draw) && session.status === 'question' && session.drawTurn?.drawer === uid;
}

// Question et vote du Bluff : numéro de la question et minuteur (maquette S1), fixés en haut de l'écran
// (hors de la zone qui défile : le clavier ne les fait jamais sortir de l'écran).
function questionTopBar(props: PlayerGameProps): ReactNode {
  const { session, serverOffsetMs, bluff } = props;
  const isQuestion = session.status === 'question' && session.currentQuestion !== undefined;
  const isVote = session.status === 'vote' && session.currentQuestion?.choices !== undefined && Boolean(bluff);
  if (!isQuestion && !isVote) return undefined;
  const timing: PhaseTiming = { phaseStartedAt: session.phaseStartedAt, phaseEndsAt: session.phaseEndsAt, serverOffsetMs };
  if (session.drawTurn && isDrawerNow(props)) {
    return (
      <DrawerTopBar key={session.drawTurn.round} word={props.draw?.word ?? null} category={session.drawTurn.category} timing={timing} />
    );
  }
  // Vote du Bluff sans minuteur : « X/Y ont voté » et leur proportion à la place du temps.
  const votes = isVote ? voteProgress(session) : undefined;
  return (
    <QuestionHeader
      index={session.currentIndex}
      questionCount={session.questionCount}
      isRound={session.settings.answerMode === 'draw'}
      timing={votes ? undefined : timing}
      votes={votes}
    />
  );
}

// Suspense : « Et le grand gagnant est… » sur le téléphone aussi, pour ne rien révéler avant la TV.
function SuspenseEndView({ isTeams }: { isTeams: boolean }) {
  const texts = strings.game.ended;
  return (
    <View style={styles.suspense}>
      <Text style={[textStyles.hero, styles.notice]}>{isTeams ? texts.suspenseTeams : texts.suspense}</Text>
      <Text style={[textStyles.muted, styles.notice]}>{texts.suspenseHint}</Text>
    </View>
  );
}

// Réponse libre : ce que la révélation du joueur rappelle (S2). undefined en Choix multiples.
function freeRevealInfo(session: PublicSession, result: PlayerResult | undefined, answer: AnswerState): FreeRevealInfo | undefined {
  const { currentQuestion: question, reveal } = session;
  if (!question || question.options || !reveal) return undefined;
  const given = answer.kind === 'idle' || !isFreeText(answer.given) ? null : answer.given;
  const info: FreeRevealInfo = { title: reveal.correctAnswer, given, speedBonus: session.settings.speedBonus };
  // Blind test « both » : titre et artiste séparés, chacun jugé à part.
  if (question.ask === 'both' && reveal.music) {
    info.title = reveal.music.title;
    info.artist = reveal.music.artist;
    info.parts = result?.parts ?? { title: false, artist: false };
  }
  return info;
}

// Groupe : équipe du joueur, classement des équipes et rang dans l'équipe (données publiques).
function teamInfoOf(session: PublicSession, uid: PlayerId): TeamGameInfo | undefined {
  const team = session.players[uid]?.team;
  if (!session.settings.teams || !team) return undefined;
  return { team, rows: teamRanking(session), inTeam: rankInTeam(session.players, uid) };
}

// Bluff : joueurs connectés, allumés quand ils ont fini (proposition acceptée, ou vote).
function bluffProgress(session: PublicSession, done: Record<PlayerId, true> | undefined): BluffProgressPlayer[] {
  return connectedPlayerIds(session.players).map((id) => ({ id, avatar: session.players[id].avatar, done: done?.[id] === true }));
}

// Groupe : nom de l'équipe du dessinateur, si le joueur est dans une autre équipe (il regardait).
function otherTeamRound(session: PublicSession, uid: PlayerId): string | null {
  const drawerTeam = session.drawTurn && session.players[session.drawTurn.drawer]?.team;
  if (!session.settings.teams || !drawerTeam || session.players[uid]?.team === drawerTeam) return null;
  return strings.teams.names[drawerTeam];
}

function renderView({ session, uid, serverOffsetMs, answer, onAnswer, bluff, draw }: PlayerGameProps): ReactNode {
  if (!isKnownAnswerMode(session.settings.answerMode)) return <OutdatedView />;
  const timing: PhaseTiming = {
    phaseStartedAt: session.phaseStartedAt,
    phaseEndsAt: session.phaseEndsAt,
    serverOffsetMs,
  };
  const ranked = rankedPlayers(session.players);
  const { currentIndex: index, questionCount } = session;
  const countdown = nextQuestionCountdown(session);
  const team = teamInfoOf(session, uid);
  const wait: WaitInfo | null = countdown && {
    timing: { phaseStartedAt: countdown.startsAt, phaseEndsAt: countdown.endsAt, serverOffsetMs },
    isLastQuestion: countdown.isLastQuestion,
    isRound: session.settings.answerMode === 'draw',
  };

  switch (session.status) {
    case 'starting':
      return <StartingView timing={timing} />;
    case 'question': {
      const question = session.currentQuestion;
      if (!question) return <WaitingView />;
      if (draw && session.drawTurn) {
        const { drawTurn } = session;
        if (drawTurn.drawer === uid) return <DrawerView key={drawTurn.round} session={session} draw={draw} />;
        const drawerName = session.players[drawTurn.drawer]?.name ?? '';
        if (isDrawGuesser(session, uid)) return <DrawGuessView key={drawTurn.round} turn={drawTurn} drawerName={drawerName} draw={draw} />;
        const drawerTeam = session.players[drawTurn.drawer]?.team;
        const team = drawerTeam ? strings.teams.names[drawerTeam] : '';
        return <DrawSpectatorView turn={drawTurn} drawerName={drawerName} team={team} />;
      }
      if (bluff) {
        const progress = bluffProgress(session, session.bluffedBy?.[index]);
        return <BluffWriteView key={index} {...{ question, bluff, progress }} showQuestion={!isTvPresent(session)} />;
      }
      const current = effectiveAnswer(session, uid, answer);
      const common = { question };
      const progress = answeredProgress(session.players, session.answeredBy?.[index]);
      if (current.kind === 'sent') return <AnswerSentView {...common} given={current.given} progress={progress} />;
      // Réponse libre : pas de propositions publiées, le joueur tape sa réponse.
      return question.options ? (
        <QuestionView {...common} answer={current} onAnswer={onAnswer} />
      ) : (
        <FreeQuestionView key={index} {...common} answer={current} onAnswer={onAnswer} />
      );
    }
    case 'vote': {
      const question = session.currentQuestion;
      if (!question?.choices || !bluff) return <WaitingView />;
      const progress = bluffProgress(session, session.votedBy?.[index]);
      return <BluffVoteView key={index} {...{ question, bluff, progress }} showQuestion={!isTvPresent(session)} />;
    }
    case 'reveal': {
      if (!session.reveal) return <WaitingView />;
      if (draw) {
        const drawer = session.drawTurn && session.players[session.drawTurn.drawer];
        return (
          <>
            {wait && <WaitHeader step={0} wait={wait} withRanking={hasRankingStep(session)} />}
            <DrawRevealView
              word={session.reveal.correctAnswer}
              drawerName={drawer?.name ?? null}
              result={myResult(session, uid)}
              playingTeam={otherTeamRound(session, uid)}
              isDrawer={session.drawTurn?.drawer === uid}
              isCancelled={session.reveal.stats.drawCancelled === true}
            />
          </>
        );
      }
      const result = myResult(session, uid);
      const bluffChoices = session.reveal.stats.bluffChoices;
      if (bluffChoices) {
        return (
          <>
            {wait && <WaitHeader step={0} wait={wait} withRanking={hasRankingStep(session)} />}
            <BluffRevealView choices={bluffChoices} result={result} uid={uid} players={session.players} streak={revealStreak(session, uid)} />
            {isAwaitingHost(session) && <Text style={[textStyles.muted, styles.notice]}>{strings.game.awaitingHost}</Text>}
          </>
        );
      }
      return (
        <>
          {wait && <WaitHeader step={0} wait={wait} withRanking={hasRankingStep(session)} />}
          <RevealView
            outcome={revealOutcome(result)}
            points={result?.points ?? 0}
            speedBonus={speedBonusOf(session, result)}
            correctAnswer={session.reveal.correctAnswer}
            correctChoice={correctChoiceIndex(session)}
            options={session.currentQuestion?.options}
            free={freeRevealInfo(session, result, answer)}
            team={team?.team}
            streak={revealStreak(session, uid)}
          />
          {/* Pas à pas : l'hôte passera à la suite (aussi après une reconnexion pendant l'attente). */}
          {isAwaitingHost(session) && (
            <Text style={[textStyles.muted, styles.notice]}>{strings.game.awaitingHost}</Text>
          )}
        </>
      );
    }
    case 'scores':
      // Pas à pas : classement en attente de l'hôte (aussi après une reconnexion).
      if (isAwaitingHost(session)) return <AwaitingScoresPhase players={ranked} uid={uid} index={index} team={team} isRound={session.settings.answerMode === 'draw'} />;
      if (!wait) return <WaitingView />;
      return (
        <ScoresPhase
          key={`${session.phaseStartedAt}-${session.phaseEndsAt}`}
          players={ranked}
          uid={uid}
          index={index}
          phase={timing}
          wait={wait}
          upcoming={upcomingQuestionNumber(session)}
          questionCount={questionCount}
          team={team}
        />
      );
    case 'paused':
      return <PausedView />;
    case 'ended':
      return team ? (
        <TeamEndScreen info={team} players={ranked} uid={uid} isBestOfTeam={bestPlayerByTeam(session.players)[team.team] === uid} />
      ) : (
        <EndView players={ranked} uid={uid} />
      );
    case 'validation':
      return <ValidationWaitView given={answer.kind === 'idle' ? null : answer.given} />;
    case 'lobby':
      return <WaitingView />;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  notice: {
    textAlign: 'center',
  },
  suspense: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
});
