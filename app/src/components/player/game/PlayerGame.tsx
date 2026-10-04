import { CORRECT_ANSWER_POINTS } from '@shared/constants';
import { isAwaitingHost, nextQuestionCountdown, upcomingQuestionNumber } from '@shared/gameFlow';
import { answeredProgress } from '@shared/players';
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
  myResult,
  previousRank,
  rankedPlayers,
  revealOutcome,
  type AnswerState,
} from '@/lib/playerGame';

import { AnswerSentView } from './AnswerSentView';
import { Confetti } from './Confetti';
import type { PhaseTiming } from './phaseTiming';
import { QuestionView } from './QuestionView';
import { RevealView } from './RevealView';
import { EndView, PausedView, StartingView, WaitingView } from './StatusViews';
import { AwaitingScoresPhase, ScoresPhase, WaitHeader, type WaitInfo } from './TransitionViews';

export interface PlayerGameProps {
  // Champs publics de la session (jamais answers) : mêmes données pour la démo et la vraie partie.
  session: PublicSession;
  uid: PlayerId;
  serverOffsetMs: number;
  // Réponse locale à la question courante (appui en cours, refus…).
  answer: AnswerState;
  onAnswer: (choice: number) => void;
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
      return current.kind === 'sent' ? (
        <AnswerSentView {...common} choice={current.choice} progress={progress} />
      ) : (
        <QuestionView {...common} answer={current} onAnswer={onAnswer} />
      );
    }
    case 'reveal': {
      if (!session.reveal) return <WaitingView />;
      const result = myResult(session, uid);
      return (
        <>
          {wait && <WaitHeader step={0} wait={wait} />}
          <RevealView
          outcome={revealOutcome(result)}
          points={result?.points ?? 0}
          speedBonus={speedBonusOf(session, result)}
          correctAnswer={session.reveal.correctAnswer}
          correctChoice={correctChoiceIndex(session)}
          rank={me?.rank ?? ranked.length}
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
      if (isAwaitingHost(session)) return <AwaitingScoresPhase players={ranked} uid={uid} index={index} />;
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
        />
      );
    case 'paused':
      return <PausedView />;
    case 'ended':
      return <EndView players={ranked} uid={uid} />;
    case 'lobby':
    case 'validation':
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
