import { questionLevelOf, QUESTION_LEVELS } from '@shared/themeCatalog';
import type { QuizEntry } from '@shared/quizValidation';
import type { Difficulty, Question } from '@shared/types';

import type { ThemeQuestionSource } from '@/lib/themeGameDraw';

// Questions fictives des thèmes de la démo (/debug/catalog?pool=…, développement uniquement) : pour chaque
// quiz, autant de questions par niveau que son levelCounts ; rien n'est jamais « déjà joué ».
function demoQuestions(entry: QuizEntry): Question[] {
  const counts = entry.levelCounts ?? { easy: entry.questionCount, medium: 0, hard: 0 };
  const difficulties = QUESTION_LEVELS.flatMap((level, index) => Array<Difficulty>(counts[level]).fill((index + 1) as Difficulty));
  return difficulties.map((difficulty, index) => ({
    id: `q-${String(index + 1).padStart(2, '0')}`,
    text: `Question ${index + 1} (${questionLevelOf(difficulty)})`,
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    acceptedAnswers: ['A'],
    difficulty,
  }));
}

export function demoThemeSource(entries: readonly QuizEntry[]): ThemeQuestionSource {
  return {
    questions: async (quizId) => {
      const entry = entries.find((candidate) => candidate.id === quizId);
      return entry ? demoQuestions(entry) : [];
    },
    playedAt: async () => ({}),
  };
}
