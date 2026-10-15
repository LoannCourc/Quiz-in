import { drawGameQuestions, drawRoundsOf } from '@shared/drawGame';
import { drawCategoriesOf, drawCategoryId } from '@shared/drawWords';
import { selectGameQuestions } from '@shared/hostEngine';
import { gameQuestionCount, poolOf, questionRef, type QuestionPool } from '@shared/questionPool';
import { normalizeLevels, type LevelChoice } from '@shared/themePool';
import type { GameQuestion, Session } from '@shared/types';
import { useEffect, useMemo, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { loadQuizQuestions } from '@/lib/hostGame';
import { drawPoolGame, loadDrawnQuestions, type LoadedQuestions } from '@/lib/poolQuestions';

export type GameQuestionsState =
  | { kind: 'loading' }
  | { kind: 'error'; detail: string }
  // questions : les questions de la partie, dans l'ordre ; refs : « quizId/questionId » de chacune
  // (mémoire des questions jouées). Dessine-moi : pas de refs (mots tirés dans le code).
  | { kind: 'ready'; questions: GameQuestion[]; refs: string[] };

// Questions de la partie, chargées par l'hôte. Un quiz seul : ses 10 premières questions, relues après une
// relance de l'app. Ensemble de quiz (thèmes, Mon mélange) : tirées au salon et écrites dans la partie
// (questionRefs), relues ensuite telles quelles. Dessine-moi : manches tirées du code de la partie et des
// catégories choisies (mots dans le code, toujours les mêmes), sans lecture dans la base.
export function useGameQuestions(code: string, session: Session): GameQuestionsState {
  const { quizId, settings, questionRefs } = session;
  const isBluff = settings.answerMode === 'bluff';
  const isDraw = settings.answerMode === 'draw';
  // Clés texte : un nouveau tableau de même contenu (session relue) ne relance rien.
  const categoriesKey = drawCategoriesOf(settings.drawCategories ?? []).map(drawCategoryId).join(',');
  const drawRounds = drawRoundsOf(settings);
  const pool = poolOf(settings);
  const loadKey = JSON.stringify({
    quizId,
    isBluff,
    pool,
    count: gameQuestionCount(settings),
    levels: normalizeLevels(settings.levels),
    refs: questionRefs ?? null,
  } satisfies LoadInput);
  // État étiqueté par sa clé : après « Changer de jeu », les questions de l'ancien jeu ne sont jamais rendues
  // (chargement tant que les nouvelles ne sont pas arrivées).
  const [loaded, setLoaded] = useState<{ key: string; state: GameQuestionsState }>({ key: loadKey, state: { kind: 'loading' } });
  const drawQuestions = useMemo(
    () => (isDraw ? drawGameQuestions(code, drawRounds, categoriesKey === '' ? [] : categoriesKey.split(',')) : null),
    [code, isDraw, categoriesKey, drawRounds],
  );

  useEffect(() => {
    if (isDraw) return;
    let isActive = true;
    loadQuestions(code, JSON.parse(loadKey) as LoadInput)
      .then((result) => {
        if (isActive) setLoaded({ key: loadKey, state: { kind: 'ready', ...result } });
      })
      .catch((error: unknown) => {
        console.error('[engine] Chargement des questions impossible', error);
        if (isActive) setLoaded({ key: loadKey, state: { kind: 'error', detail: toErrorMessage(error) } });
      });
    return () => {
      isActive = false;
    };
  }, [code, loadKey, isDraw]);

  if (drawQuestions) return { kind: 'ready', questions: drawQuestions, refs: [] };
  return loaded.key === loadKey ? loaded.state : { kind: 'loading' };
}

// Ce qui décide des questions à charger (clé texte de l'effet).
interface LoadInput {
  quizId: string;
  isBluff: boolean;
  pool: QuestionPool | null;
  count: number;
  levels: LevelChoice;
  refs: string[] | null;
}

async function loadQuestions(code: string, { quizId, isBluff, pool, count, levels, refs }: LoadInput): Promise<LoadedQuestions> {
  if (pool === null) {
    const questions = selectGameQuestions(await loadQuizQuestions(quizId, isBluff));
    return { questions, refs: questions.map((question) => questionRef(quizId, question.id)) };
  }
  if (refs) return loadDrawnQuestions(refs, isBluff);
  return drawPoolGame(code, pool, count, isBluff, levels);
}
