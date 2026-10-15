import { drawPoolQuestions, parseQuestionRef, poolQuizzes, questionRef, type QuestionPool } from '@shared/questionPool';
import { parseQuizCatalog } from '@shared/quizValidation';
import { questionLevelOf } from '@shared/themeCatalog';
import { drawThemeQuestions, type LevelChoice } from '@shared/themePool';
import type { GameQuestion } from '@shared/types';
import { get, ref, set } from 'firebase/database';

import { db } from './firebase';
import { loadQuizQuestions } from './hostGame';
import { loadPlayedQuestions } from './playedQuestions';

// Partie tirée dans un ensemble de quiz (thèmes du Quiz, « Mon mélange » du Bluff), côté hôte : tirage au
// salon, écrit dans la partie (questionRefs), puis relu tel quel (relance de l'app).

export interface LoadedQuestions {
  questions: GameQuestion[];
  // « quizId/questionId » de chaque question, dans l'ordre de la partie.
  refs: string[];
}

async function questionsByQuiz(quizIds: readonly string[], isBluff: boolean): Promise<Map<string, GameQuestion[]>> {
  const loaded = await Promise.all(quizIds.map(async (quizId) => [quizId, await loadQuizQuestions(quizId, isBluff)] as const));
  return new Map(loaded);
}

// Questions des identifiants, dans leur ordre ; une question disparue du catalogue est sautée.
function pick(refs: readonly string[], byQuiz: Map<string, GameQuestion[]>): LoadedQuestions {
  const found = refs.flatMap((questionRefText) => {
    const parsed = parseQuestionRef(questionRefText);
    const question = parsed && byQuiz.get(parsed.quizId)?.find((candidate) => candidate.id === parsed.questionId);
    return question ? [{ question, ref: questionRefText }] : [];
  });
  return { questions: found.map((entry) => entry.question), refs: found.map((entry) => entry.ref) };
}

// Questions déjà tirées pour cette partie.
export async function loadDrawnQuestions(refs: readonly string[], isBluff: boolean): Promise<LoadedQuestions> {
  const quizIds = [...new Set(refs.flatMap((questionRefText) => parseQuestionRef(questionRefText)?.quizId ?? []))];
  return pick(refs, await questionsByQuiz(quizIds, isBluff));
}

// Nouveau tirage dans l'ensemble (jamais jouées d'abord), mémorisé dans la partie avant d'être utilisé. Secours
// quand la partie n'a pas encore de tirage (Bluff, ou partie par thèmes créée sans tirage sur la fiche) :
// thèmes du Quiz, même tirage que la fiche (niveaux choisis, parts égales entre les thèmes).
export async function drawPoolGame(code: string, pool: QuestionPool, count: number, isBluff: boolean, levels: LevelChoice): Promise<LoadedQuestions> {
  const catalog = parseQuizCatalog((await get(ref(db, 'quizzes'))).val()).valid;
  const quizzes = poolQuizzes(catalog, pool, isBluff ? 'bluff' : 'quiz');
  const byQuiz = await questionsByQuiz(quizzes.map((quiz) => quiz.id), isBluff);
  const playedAt = await loadPlayedQuestions();
  const drawn =
    pool.kind === 'themes'
      ? drawThemeQuestions(
          quizzes.flatMap((quiz) =>
            (byQuiz.get(quiz.id) ?? []).map((question) => ({ ref: questionRef(quiz.id, question.id), theme: quiz.theme, level: questionLevelOf(question.difficulty) })),
          ),
          pool.themes,
          levels,
          count,
          playedAt,
        )
      : drawPoolQuestions([...byQuiz].flatMap(([quizId, questions]) => questions.map((question) => questionRef(quizId, question.id))), playedAt, count);
  await set(ref(db, `sessions/${code}/questionRefs`), drawn);
  return pick(drawn, byQuiz);
}
