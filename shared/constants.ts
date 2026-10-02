// Constantes de jeu issues de la spec (sections 5 et 6), ajustables après les tests.
import type { AnswerMode } from './types';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 20;
export const QUESTIONS_PER_GAME = 10;
export const CHOICE_COUNT = 4;

// Durées en secondes.
export const STARTING_DURATION_S = 3;
export const QUESTION_DURATION_S: Record<AnswerMode, number> = { choice: 20, free: 30 };
export const ALL_ANSWERED_DELAY_S = 2;
export const REVEAL_DURATION_S: Record<AnswerMode, number> = { choice: 8, free: 10 };
export const SCORES_DURATION_S = 6;
export const HOST_DISCONNECT_TIMEOUT_S = 120;

// Points : bonne réponse, plus bonus de rapidité jusqu'à MAX_SPEED_BONUS_POINTS.
export const CORRECT_ANSWER_POINTS = 100;
export const MAX_SPEED_BONUS_POINTS = 100;

export const SCORES_TOP_COUNT = 5;

export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 12;
export const QUESTION_TEXT_MAX_LENGTH = 140;

// Code de salle sans caractères ambigus (ni O/0, ni I/1).
export const ROOM_CODE_LENGTH = 4;
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const SESSION_TTL_HOURS = 24;

// Site Firebase Hosting des joueurs (cible « players » dans .firebaserc). Le QR code du lobby
// pointe vers `${PLAYERS_SITE_URL}/join/CODE` (spec 6.6).
export const PLAYERS_SITE_URL = 'https://quizin-jouer.web.app';

// Seuils de la difficulté moyenne d'un quiz : en dessous = Facile, jusqu'à = Moyen, au-delà = Difficile.
export const DIFFICULTY_EASY_MAX = 1.67;
export const DIFFICULTY_MEDIUM_MAX = 2.33;
