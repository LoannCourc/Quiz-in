import type { PlayerId, PublicSession } from '@shared/types';

import { effectiveAnswer, myResult, rankedPlayers, topWithMe, type AnswerState } from '@/lib/playerGame';

import { AnswerSentView } from './AnswerSentView';
import type { PhaseTiming } from './Countdown';
import { QuestionView } from './QuestionView';
import { RevealView } from './RevealView';
import { EndView, PausedView, ScoresView, StartingView, WaitingView } from './StatusViews';

export interface PlayerGameProps {
  // Champs publics de la session (jamais answers) : mêmes données pour la démo et la vraie partie.
  session: PublicSession;
  uid: PlayerId;
  serverOffsetMs: number;
  // Réponse locale à la question courante (appui en cours, refus…).
  answer: AnswerState;
  onAnswer: (choice: number) => void;
}

// Écran du joueur pendant la partie, choisi d'après l'état de la session. Aucun accès à Firebase :
// la page parente fournit les données.
export function PlayerGame({ session, uid, serverOffsetMs, answer, onAnswer }: PlayerGameProps) {
  const timing: PhaseTiming = {
    phaseStartedAt: session.phaseStartedAt,
    phaseEndsAt: session.phaseEndsAt,
    serverOffsetMs,
  };
  const ranked = rankedPlayers(session.players);
  const me = ranked.find((player) => player.id === uid);

  switch (session.status) {
    case 'starting':
      return <StartingView timing={timing} />;
    case 'question': {
      const question = session.currentQuestion;
      if (!question) return <WaitingView />;
      const current = effectiveAnswer(session, uid, answer);
      return current.kind === 'sent' ? (
        <AnswerSentView question={question} index={session.currentIndex} timing={timing} choice={current.choice} />
      ) : (
        <QuestionView
          question={question}
          index={session.currentIndex}
          timing={timing}
          answer={current}
          onAnswer={onAnswer}
        />
      );
    }
    case 'reveal':
      if (!session.reveal) return <WaitingView />;
      return (
        <RevealView
          correctAnswer={session.reveal.correctAnswer}
          explanation={session.reveal.explanation}
          result={myResult(session, uid)}
          rank={me?.rank ?? ranked.length}
          score={me?.score ?? 0}
          playerCount={ranked.length}
        />
      );
    case 'scores':
      return <ScoresView players={topWithMe(ranked, uid)} uid={uid} />;
    case 'paused':
      return <PausedView />;
    case 'ended':
      return <EndView players={ranked} uid={uid} />;
    case 'lobby':
    case 'validation':
      return <WaitingView />;
  }
}
