import { QUESTIONS_PER_GAME } from '@shared/constants';
import { difficultyLevel, estimateQuizMinutes } from '@shared/quizCatalog';
import type { QuizEntry } from '@shared/quizValidation';
import type { QuizIconName } from '@shared/themeIcons';
import type { PosterPalette, QuizAudience, QuizGameType } from '@shared/types';

import { strings } from '@/constants/strings';

// Catalogue fictif de l'écran /debug/catalog (développement uniquement) : contrôle du rendu avec
// une douzaine de quiz variés. Ces fiches n'existent pas dans la base et ne sont pas jouables.

interface DemoQuiz {
  id: string;
  title: string;
  theme: string;
  difficulty: number;
  audience: QuizAudience;
  poster: PosterPalette;
  addedAt: string;
  featuredRank?: number;
  description: string;
  gameType?: QuizGameType;
  icon?: QuizIconName;
}

const DEMO_QUIZZES: DemoQuiz[] = [
  { id: 'demo-culture', title: 'Culture générale', theme: 'Culture générale', difficulty: 1.3, audience: 'all', poster: 'pink', addedAt: '2026-09-28', featuredRank: 1, description: 'Histoire, sciences, arts et vie quotidienne : un quiz pour tous les âges, idéal pour lancer la soirée.' },
  { id: 'demo-cinema-90', title: 'Cinéma des années 90', theme: 'Cinéma et séries', difficulty: 2.1, audience: 'all', poster: 'blue', addedAt: '2026-09-15', featuredRank: 2, description: 'Répliques cultes, acteurs et bandes originales de la décennie.' },
  { id: 'demo-geo-monde', title: 'Géographie du monde', theme: 'Géographie', difficulty: 2.4, audience: 'all', poster: 'green', addedAt: '2026-08-30', featuredRank: 3, description: 'Capitales, fleuves et drapeaux : faites le tour du monde en dix questions.' },
  { id: 'demo-histoire-france', title: 'Histoire de France', theme: 'Histoire', difficulty: 2.0, audience: 'all', poster: 'red', addedAt: '2026-10-02', featuredRank: 4, description: 'Des Gaulois à nos jours, les grandes dates et les personnages qui ont fait le pays.' },
  { id: 'demo-sport-records', title: 'Sport et records', theme: 'Sport', difficulty: 1.9, audience: 'all', poster: 'cyan', addedAt: '2026-10-01', featuredRank: 5, description: 'Champions, médailles et exploits hors normes.' },
  { id: 'demo-musique', title: 'Musique, côté culture', theme: 'Musique', difficulty: 2.2, audience: 'all', poster: 'orange', addedAt: '2026-09-30', description: 'Instruments, compositeurs et grands tubes : la musique sans les oreilles.' },
  { id: 'demo-enfants', title: 'Spécial enfants', theme: 'Sciences et nature', difficulty: 1.0, audience: 'kids', poster: 'orange', addedAt: '2026-09-10', featuredRank: 6, description: 'Animaux, contes et petites énigmes : les plus jeunes peuvent gagner.' },
  { id: 'demo-dessins-animes', title: 'Dessins animés', theme: 'Cinéma et séries', difficulty: 1.2, audience: 'kids', poster: 'green', addedAt: '2026-08-12', description: 'Héros et chansons des dessins animés, d’hier et d’aujourd’hui.' },
  { id: 'demo-cuisine', title: 'Cuisine et terroir', theme: 'Loisirs', difficulty: 1.5, audience: 'all', poster: 'pink', addedAt: '2026-07-21', description: 'Fromages, spécialités régionales et secrets de grand-mère.' },
  { id: 'demo-sciences-pointues', title: 'Sciences pointues', theme: 'Sciences et nature', difficulty: 2.8, audience: 'experts', poster: 'violet', addedAt: '2026-09-05', featuredRank: 7, description: 'Physique, chimie et biologie : pour celles et ceux qui ont gardé leurs cours.' },
  { id: 'demo-espace', title: 'L’espace et les étoiles', theme: 'Sciences et nature', difficulty: 2.0, audience: 'all', poster: 'blue', addedAt: '2026-06-18', description: 'Planètes, missions et astronautes : un quiz la tête dans les étoiles.' },
  { id: 'demo-capitales-expert', title: 'Capitales impossibles avec un titre très long pour tester', theme: 'Géographie', difficulty: 2.9, audience: 'experts', poster: 'gold', addedAt: '2026-05-02', description: 'Les capitales que personne ne connaît. Titre volontairement long pour vérifier la coupure sur trois lignes.' },
  { id: 'demo-bt-tubes', title: 'Tubes francophones', theme: 'Musique', difficulty: 1.2, audience: 'all', poster: 'pink', addedAt: '2026-10-03', featuredRank: 8, gameType: 'blindTest', icon: 'speechBubble', description: 'Dix tubes que tout le monde a fredonnés : reconnaissez-les dès les premières notes.' },
  { id: 'demo-bt-annees-80', title: 'Années 80', theme: 'Musique', difficulty: 2.1, audience: 'all', poster: 'cyan', addedAt: '2026-09-20', gameType: 'blindTest', icon: 'cassette', description: 'Synthés, refrains et tubes de la décennie : un blind test pour les nostalgiques.' },
];

export const DEMO_CATALOG: QuizEntry[] = DEMO_QUIZZES.map(({ featuredRank, gameType = 'quiz', ...quiz }) => ({
  ...quiz,
  gameType,
  language: 'fr',
  difficultyLabel: strings.catalog.difficultyLevels[difficultyLevel(quiz.difficulty)],
  questionCount: QUESTIONS_PER_GAME,
  estimatedMinutes: estimateQuizMinutes(QUESTIONS_PER_GAME),
  ...(featuredRank !== undefined && { featuredRank }),
}));
