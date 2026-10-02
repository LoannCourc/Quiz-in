// Types communs à l'app hôte, au client joueur et au récepteur TV (spec, sections 5, 7 et 8).

export type GameStatus =
  | 'lobby'
  | 'starting'
  | 'question'
  | 'reveal'
  | 'validation'
  | 'scores'
  | 'paused'
  | 'ended';

export type AnswerMode = 'free' | 'choice';

// 1 = Facile, 2 = Moyen, 3 = Difficile.
export type Difficulty = 1 | 2 | 3;

// Niveau d'un quiz, déduit de la moyenne des difficultés de ses questions (spec 8).
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Fiche d'un quiz dans le catalogue (nœud quizzes/{quizId}, spec 7).
export interface QuizSummary {
  title: string;
  theme: string;
  gameType: 'quiz';
  language: 'fr';
  difficulty: number;
  difficultyLabel: string;
  questionCount: number;
  estimatedMinutes: number;
}

export type ChoiceOptions = [string, string, string, string];

// Question complète, lisible uniquement par l'hôte.
export interface Question {
  id: string;
  text: string;
  options: ChoiceOptions;
  correctIndex: number;
  acceptedAnswers: string[];
  difficulty: Difficulty;
  explanation?: string;
  timeLimit?: number;
}

// Question telle que publiée pendant l'état QUESTION : jamais la bonne réponse.
export interface PublicQuestion {
  text: string;
  options?: ChoiceOptions;
  difficulty: Difficulty;
  timeLimit: number;
}

// Objet plutôt que simple texte, pour pouvoir ajouter des champs (masquage par l'hôte en P1).
export interface FreeAnswerEntry {
  playerId: PlayerId;
  value: string;
}

export interface RevealStats {
  // Choix multiples : nombre de réponses par proposition (même ordre que options).
  choiceCounts?: number[];
  // Réponse libre : réponses données par les joueurs.
  freeAnswers?: FreeAnswerEntry[];
}

export interface Reveal {
  correctAnswer: string;
  explanation?: string;
  stats: RevealStats;
  // Résultat de chaque joueur ayant répondu ; un joueur absent n'a pas répondu (0 point).
  results?: Record<PlayerId, PlayerResult>;
}

export interface PlayerResult {
  correct: boolean;
  points: number;
}

export interface SessionSettings {
  answerMode: AnswerMode;
  speedBonus: boolean;
  control: boolean;
  teams: boolean;
}

export interface Player {
  name: string;
  avatar: string;
  score: number;
  rank: number;
  connected: boolean;
}

export interface Answer {
  // Texte saisi en Réponse libre, index de la proposition en Choix multiples.
  value: string | number;
  submittedAt: number;
  correct?: boolean;
  points?: number;
}

export type PlayerId = string;

// Partie de la session lisible par les joueurs et la TV : tout sauf answers.
export interface PublicSession {
  hostUid: PlayerId;
  quizId: string;
  status: GameStatus;
  settings: SessionSettings;
  currentIndex: number;
  // Nombre de questions de la partie : écrit par l'hôte au lancement, absent en lobby.
  questionCount?: number;
  phaseStartedAt: number;
  phaseEndsAt: number;
  // Renseignés en PAUSED : état à reprendre et temps restant de la phase interrompue.
  pausedFrom?: GameStatus;
  remainingMs?: number;
  currentQuestion?: PublicQuestion;
  reveal?: Reveal;
  players: Record<PlayerId, Player>;
  // Qui a répondu à chaque question, jamais quoi.
  answeredBy?: Record<number, Record<PlayerId, true>>;
}

// Session complète, lisible uniquement par l'hôte.
export interface Session extends PublicSession {
  answers?: Record<number, Record<PlayerId, Answer>>;
}
