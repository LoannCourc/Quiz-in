import { selectGameQuestions } from '@shared/hostEngine';
import type { GameQuestion } from '@shared/types';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { loadQuizQuestions } from '@/lib/hostGame';

export type GameQuestionsState =
  | { kind: 'loading' }
  | { kind: 'error'; detail: string }
  // questions : les questions de la partie (au plus QUESTIONS_PER_GAME, dans l'ordre du quiz).
  | { kind: 'ready'; questions: GameQuestion[] };

// Questions de la partie, chargées une fois par l'hôte. Rien de critique n'est gardé ici :
// après une relance de l'app, elles sont simplement relues. isBluff : partie de Bluff.
export function useGameQuestions(quizId: string, isBluff: boolean): GameQuestionsState {
  const [state, setState] = useState<GameQuestionsState>({ kind: 'loading' });

  useEffect(() => {
    let isActive = true;
    loadQuizQuestions(quizId, isBluff)
      .then((questions) => {
        if (isActive) setState({ kind: 'ready', questions: selectGameQuestions(questions) });
      })
      .catch((error: unknown) => {
        console.error('[engine] Chargement des questions impossible', error);
        if (isActive) setState({ kind: 'error', detail: toErrorMessage(error) });
      });
    return () => {
      isActive = false;
    };
  }, [quizId, isBluff]);

  return state;
}
