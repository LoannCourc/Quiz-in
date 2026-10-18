import type { PlayedQuizName } from '@shared/quizCatalog';

import { strings } from '@/constants/strings';

// « Électro des années 80 · Moyen » ; null : rien à afficher (Bluff, Dessine-moi, partie par thèmes).
export function formatPlayedQuizName(name: PlayedQuizName | null): string | null {
  return name && strings.catalog.playedQuiz(name.title, strings.catalog.difficultyLevels[name.level]);
}
