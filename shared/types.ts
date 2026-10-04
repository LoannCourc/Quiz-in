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

// Type de jeu d'un quiz : questions classiques, ou blind test (extraits musicaux joués par la TV).
export type QuizGameType = 'quiz' | 'blindTest';

// Source des extraits audio (interchangeable : seule l'app de l'hôte sait l'interroger).
export type AudioSourceId = 'deezer';

// Public visé par un quiz (pastille de la fiche, rangée « Pour les experts »).
export type QuizAudience = 'all' | 'kids' | 'experts';

// Palette du dégradé de l'affiche d'un quiz ; les couleurs sont définies par l'app (appTheme).
export type PosterPalette = 'pink' | 'blue' | 'green' | 'orange' | 'red' | 'cyan' | 'violet' | 'gold';

// Fiche d'un quiz dans le catalogue (nœud quizzes/{quizId}, spec 7).
export interface QuizSummary {
  title: string;
  theme: string;
  gameType: QuizGameType;
  language: 'fr';
  difficulty: number;
  difficultyLabel: string;
  questionCount: number;
  estimatedMinutes: number;
  description: string;
  audience: QuizAudience;
  poster: PosterPalette;
  // Date d'ajout AAAA-MM-JJ (rangée « Nouveautés ») ; vide si inconnue.
  addedAt: string;
  // Place dans le Top 10, choisie à la main (1 à 10) ; absente si le quiz n'y figure pas.
  featuredRank?: number;
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
  // Blind test : morceau dont un extrait est joué par la TV pendant la question.
  music?: MusicTrack;
}

// Morceau d'une question de blind test (lisible uniquement par l'hôte, comme toute la question).
export interface MusicTrack {
  source: AudioSourceId;
  // Identifiant du morceau chez la source (Deezer : identifiant numérique, en texte).
  id: string;
  title: string;
  artist: string;
  // Début et durée de l'extrait dans la preview, en secondes (défaut : AUDIO_EXTRACT_START_S et AUDIO_EXTRACT_S).
  startS?: number;
  durationS?: number;
}

// Extrait publié pendant QUESTION : seulement une adresse temporaire, jamais l'identifiant ni le titre.
export interface PublicAudio {
  url: string;
  startS: number;
  durationS: number;
}

// Question telle que publiée pendant l'état QUESTION : jamais la bonne réponse.
export interface PublicQuestion {
  text: string;
  options?: ChoiceOptions;
  difficulty: Difficulty;
  timeLimit: number;
  audio?: PublicAudio;
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
  // Blind test : titre et artiste, affichés à la révélation avec la mention de la source.
  music?: RevealMusic;
  stats: RevealStats;
  // Résultat de chaque joueur ayant répondu ; un joueur absent n'a pas répondu (0 point).
  results?: Record<PlayerId, PlayerResult>;
}

export interface RevealMusic {
  title: string;
  artist: string;
  source: AudioSourceId;
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
  // Heure serveur du départ de l'hôte (coupure), écrite par son onDisconnect ; effacée à son retour.
  hostLeftAt?: number;
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
