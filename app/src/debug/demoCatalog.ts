import { QUESTIONS_PER_GAME } from '@shared/constants';
import { difficultyLevel, estimateQuizMinutes } from '@shared/quizCatalog';
import type { QuizEntry } from '@shared/quizValidation';
import type { QuizIconName } from '@shared/themeIcons';
import type { BlindTestDecade, BlindTestGenre, DifficultyLevel, PosterPalette, QuizAudience, QuizGameType } from '@shared/types';

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
  genre?: BlindTestGenre;
  decade?: BlindTestDecade;
  level?: DifficultyLevel;
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
  { id: 'demo-bt-tubes', title: 'Tubes francophones', theme: 'Musique', difficulty: 1.2, audience: 'all', poster: 'pink', addedAt: '2026-10-03', featuredRank: 8, gameType: 'blindTest', genre: 'chanson', decade: 'all', icon: 'speechBubble', description: 'Dix tubes que tout le monde a fredonnés : reconnaissez-les dès les premières notes.' },
  { id: 'demo-bt-annees-80', title: 'Années 80', theme: 'Musique', difficulty: 2.1, audience: 'all', poster: 'cyan', addedAt: '2026-09-20', gameType: 'blindTest', genre: 'pop', decade: 1980, icon: 'cassette', description: 'Synthés, refrains et tubes de la décennie : un blind test pour les nostalgiques.' },
  { id: 'demo-bt-rock80', title: 'Rock français 80', theme: 'Musique', difficulty: 2.6, audience: 'all', poster: 'blue', addedAt: '2026-09-12', gameType: 'blindTest', genre: 'rock', decade: 1980, icon: 'guitar', description: 'Guitares et refrains en français.' },
  { id: 'demo-bt-hardrock80', title: 'Hard rock 80', theme: 'Musique', difficulty: 3, level: 'impossible', audience: 'experts', poster: 'red', addedAt: '2026-09-10', gameType: 'blindTest', genre: 'rock', decade: 1980, icon: 'guitar', description: 'Pour les spécialistes.' },
  { id: 'demo-bt-synth', title: 'Synthpop obscur', theme: 'Musique', difficulty: 3, level: 'impossible', audience: 'experts', poster: 'pink', addedAt: '2026-09-08', gameType: 'blindTest', genre: 'pop', decade: 1980, icon: 'cassette', description: 'Les faces B des années 80.' },
  { id: 'demo-bt-italo', title: 'Italo disco', theme: 'Musique', difficulty: 2.7, audience: 'all', poster: 'orange', addedAt: '2026-09-06', gameType: 'blindTest', genre: 'discoFunk', decade: 1980, icon: 'discoBall', description: 'Paillettes et boîtes à rythmes.' },
  { id: 'demo-bt-90', title: 'Années 90', theme: 'Musique', difficulty: 1.6, audience: 'all', poster: 'cyan', addedAt: '2026-10-02', gameType: 'blindTest', genre: 'pop', decade: 1990, icon: 'cd', description: 'Eurodance et boys bands.' },
  { id: 'demo-bt-rap', title: 'Rap français', theme: 'Musique', difficulty: 2.4, audience: 'all', poster: 'violet', addedAt: '2026-10-01', gameType: 'blindTest', genre: 'rap', decade: 'all', icon: 'microphone', description: 'De MC Solaar à Orelsan.' },
  { id: 'demo-bt-electro', title: 'French touch', theme: 'Musique', difficulty: 2.2, audience: 'all', poster: 'gold', addedAt: '2026-09-30', gameType: 'blindTest', genre: 'electro', decade: 2000, icon: 'headphones', description: 'Daft Punk, Justice et compagnie.' },
  { id: 'demo-bluff-royal', title: 'Fins royales', theme: 'Histoire', difficulty: 2.0, audience: 'all', poster: 'gold', addedAt: '2026-10-04', gameType: 'bluff', description: 'Des rois et des reines aux fins improbables : inventez des réponses assez crédibles pour piéger les autres.' },
  { id: 'demo-bluff-betes', title: 'Drôles de bêtes', theme: 'Sciences et nature', difficulty: 1.8, audience: 'all', poster: 'green', addedAt: '2026-10-03', gameType: 'bluff', description: 'Animaux étonnants : la vraie réponse est souvent plus folle que vos inventions.' },
  { id: 'demo-bluff-objets', title: 'Objets du quotidien', theme: 'Culture générale', difficulty: 1.6, audience: 'all', poster: 'violet', addedAt: '2026-09-28', gameType: 'bluff', description: 'L’origine surprenante des objets de tous les jours.' },
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
