import { CORRECT_ANSWER_POINTS } from '@shared/constants';
import { isAwaitingHost, nextQuestionCountdown, upcomingQuestionNumber } from '@shared/gameFlow';
import { answeredProgress } from '@shared/players';
import { bestPlayerByTeam, previousTeamRank, rankInTeam, teamRanking } from '@shared/teams';
import type { PlayerId, PlayerResult, PublicSession } from '@shared/types';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import type { AppBackgroundName } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import {
  correctChoiceIndex,
  effectiveAnswer,
  isFreeText,
  myResult,
  previousRank,
  rankedPlayers,
  revealOutcome,
  type AnswerState,
  type GivenAnswer,
} from '@/lib/playerGame';

import { AnswerSentView, ValidationWaitView } from './AnswerSentView';
import { Confetti } from './Confetti';
import { FreeQuestionView } from './FreeQuestionView';
import type { PhaseTiming } from './phaseTiming';
import { QuestionView } from './QuestionView';
import { RevealView, type FreeRevealInfo } from './RevealView';
import { EndView, PausedView, StartingView, WaitingView } from './StatusViews';
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
  const outcome = session.status === 'reveal' ? revealOutcome(myResult(session, uid)) : undefined;
  // Fond festif seulement pour une bonne réponse ; ton plus doux sinon.
  const background: AppBackgroundName = outcome === 'correct' ? 'celebration' : 'main';
  // Confettis : une fois à la révélation d'une bonne réponse et à la fin de partie.
  const showConfetti = outcome === 'correct' || session.status === 'ended';
  return (
    <View style={styles.root}>
      <Screen background={background} footer={props.footer}>
        {props.notice && <Text style={[textStyles.body, styles.notice]}>{props.notice}</Text>}
        {renderView(props)}
      </Screen>
      {showConfetti && <Confetti key={`${session.status}-${session.phaseStartedAt}`} />}
      {props.overlay}
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
  const info: TeamGameInfo = { team, rows: teamRanking(session), inTeam: rankInTeam(session.players, uid) };
  const previousRank = previousTeamRank(session, team);
  if (previousRank !== undefined) info.previousRank = previousRank;
  return info;
}

function renderView({ session, uid, serverOffsetMs, answer, onAnswer }: PlayerGameProps): ReactNode {
  const timing: PhaseTiming = {
    phaseStartedAt: session.phaseStartedAt,
    phaseEndsAt: session.phaseEndsAt,
    serverOffsetMs,
  };
  const ranked = rankedPlayers(session.players);
  const me = ranked.find((player) => player.id === uid);
  const score = me?.score ?? 0;
  const { currentIndex: index, questionCount } = session;
  const countdown = nextQuestionCountdown(session);
  // Suspense : ni rang ni étape Classement en cours de partie, seulement les points gagnés.
  const isSuspense = session.settings.suspense === true;
  const team = teamInfoOf(session, uid);
  const wait: WaitInfo | null = countdown && {
    timing: { phaseStartedAt: countdown.startsAt, phaseEndsAt: countdown.endsAt, serverOffsetMs },
    isLastQuestion: countdown.isLastQuestion,
  };

  switch (session.status) {
    case 'starting':
      return <StartingView timing={timing} />;
    case 'question': {
      const question = session.currentQuestion;
      if (!question) return <WaitingView />;
      const current = effectiveAnswer(session, uid, answer);
      const common = { question, index, questionCount, score, timing };
      const progress = answeredProgress(session.players, session.answeredBy?.[index]);
      if (current.kind === 'sent') return <AnswerSentView {...common} given={current.given} progress={progress} />;
      // Réponse libre : pas de propositions publiées, le joueur tape sa réponse.
      return question.options ? (
        <QuestionView {...common} answer={current} onAnswer={onAnswer} />
      ) : (
        <FreeQuestionView key={index} {...common} answer={current} onAnswer={onAnswer} />
      );
    }
    case 'reveal': {
      if (!session.reveal) return <WaitingView />;
      const result = myResult(session, uid);
      return (
        <>
          {wait && <WaitHeader step={0} wait={wait} withRanking={!isSuspense} />}
          <RevealView
            outcome={revealOutcome(result)}
            points={result?.points ?? 0}
            speedBonus={speedBonusOf(session, result)}
            correctAnswer={session.reveal.correctAnswer}
            correctChoice={correctChoiceIndex(session)}
            options={session.currentQuestion?.options}
            free={freeRevealInfo(session, result, answer)}
            // Groupe : rangs d'équipe à la place de « Ta place » (rien en Suspense, comme le rang).
            team={isSuspense ? undefined : team}
            rank={isSuspense ? undefined : (me?.rank ?? ranked.length)}
            previousRank={previousRank(session, uid)}
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
      if (isAwaitingHost(session)) return <AwaitingScoresPhase players={ranked} uid={uid} index={index} team={team} />;
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
});
