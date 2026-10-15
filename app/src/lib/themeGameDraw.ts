import { drawPoolQuestions, poolQuizzes, questionRef } from '@shared/questionPool';
import { parseQuestions, type QuizEntry } from '@shared/quizValidation';
import { questionLevelOf, type DrawnQuestionInfo } from '@shared/themeCatalog';
import type { Question } from '@shared/types';
import { get, ref } from 'firebase/database';

import { warnIgnoredEntries } from './devLog';
import { db } from './firebase';
import { loadPlayedQuestions } from './playedQuestions';

// Tirage d'une partie tirée dans des thèmes du Quiz, fait sur la fiche (maquette QN1-F) : la fiche montre la
// répartition réelle (« Au programme »), et ces questions sont écrites avec la partie (questionRefs).

// D'où viennent les questions : la base (hôte), ou des questions fictives (démo /debug/catalog).
export interface ThemeQuestionSource {
  questions: (quizId: string) => Promise<Question[]>;
  // Heure du dernier lancement de chaque question jouée sur ce téléphone (« quizId/questionId »).
  playedAt: () => Promise<Record<string, number>>;
}

export const databaseQuestionSource: ThemeQuestionSource = {
  async questions(quizId) {
    const { valid, ignoredCount } = parseQuestions((await get(ref(db, `questions/${quizId}`))).val());
    warnIgnoredEntries('Questions du quiz', ignoredCount);
    return valid;
  },
  playedAt: loadPlayedQuestions,
};

export interface ThemeGameDraw {
  // « quizId/questionId », dans l'ordre de la partie.
  refs: string[];
  // Thème et niveau de chaque question tirée, dans le même ordre.
  info: DrawnQuestionInfo[];
  // Quiz des thèmes choisis (le premier donne quizId à la partie).
  quizzes: QuizEntry[];
}

// Questions des thèmes choisis, puis tirage : d'abord celles jamais jouées sur ce téléphone.
export async function drawThemeGame(source: ThemeQuestionSource, entries: readonly QuizEntry[], themes: readonly string[], count: number): Promise<ThemeGameDraw> {
  const quizzes = poolQuizzes(entries, { kind: 'themes', themes }, 'quiz');
  const loaded = await Promise.all(quizzes.map(async (quiz) => ({ quiz, questions: await source.questions(quiz.id) })));
  const infoByRef = new Map<string, DrawnQuestionInfo>();
  for (const { quiz, questions } of loaded) {
    for (const question of questions) infoByRef.set(questionRef(quiz.id, question.id), { theme: quiz.theme, level: questionLevelOf(question.difficulty) });
  }
  const refs = drawPoolQuestions([...infoByRef.keys()], await source.playedAt(), count);
  return { refs, info: refs.map((drawn) => infoByRef.get(drawn) as DrawnQuestionInfo), quizzes };
}
