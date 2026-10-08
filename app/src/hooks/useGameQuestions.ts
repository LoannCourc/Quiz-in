import { DRAW_ROUNDS_DEFAULT, drawGameQuestions } from '@shared/drawGame';
import { drawCategoriesOf, drawCategoryId } from '@shared/drawWords';
import { selectGameQuestions } from '@shared/hostEngine';
import type { AnswerMode, GameQuestion } from '@shared/types';
import { useEffect, useMemo, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { loadQuizQuestions } from '@/lib/hostGame';

export type GameQuestionsState =
  | { kind: 'loading' }
  | { kind: 'error'; detail: string }
  // questions : les questions de la partie (au plus QUESTIONS_PER_GAME, dans l'ordre du quiz).
  | { kind: 'ready'; questions: GameQuestion[] };

// Questions de la partie, chargées une fois par l'hôte. Rien de critique n'est gardé ici :
// après une relance de l'app, elles sont simplement relues. Dessine-moi : manches tirées du code de la
// partie et des catégories choisies (mots dans le code, toujours les mêmes), sans lecture dans la base.
export function useGameQuestions(
  code: string,
  quizId: string,
  answerMode: AnswerMode,
  drawCategories: readonly string[] = [],
  drawRounds = DRAW_ROUNDS_DEFAULT,
): GameQuestionsState {
  const isBluff = answerMode === 'bluff';
  const isDraw = answerMode === 'draw';
  const [state, setState] = useState<GameQuestionsState>({ kind: 'loading' });
  // Clé texte : un nouveau tableau de même contenu (session relue) ne retire pas les mots.
  const categoriesKey = drawCategoriesOf(drawCategories).map(drawCategoryId).join(',');
  const drawQuestions = useMemo(
    () => (isDraw ? drawGameQuestions(code, drawRounds, categoriesKey === '' ? [] : categoriesKey.split(',')) : null),
    [code, isDraw, categoriesKey, drawRounds],
  );

  useEffect(() => {
    if (isDraw) return;
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
  }, [code, quizId, isBluff, isDraw]);

  return drawQuestions ? { kind: 'ready', questions: drawQuestions } : state;
}
