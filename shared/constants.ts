// Constantes de jeu issues de la spec (sections 5 et 6), ajustables après les tests.
import type { AnswerMode, AudioSourceId, PosterPalette, QuizAudience, SessionSettings } from './types';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 20;
// Lobby : un joueur déconnecté depuis plus longtemps est retiré par l'hôte (joueur fantôme).
export const LOBBY_GHOST_GRACE_MS = 30_000;
export const QUESTIONS_PER_GAME = 10;
// Partie courte proposée en développement seulement (tests manuels).
export const DEV_SHORT_GAME_QUESTIONS = 3;
export const CHOICE_COUNT = 4;

// Catalogue de l'hôte (spec 4.1 et 7).
export const QUIZ_DESCRIPTION_MAX_LENGTH = 160;
export const FEATURED_QUIZ_COUNT = 10;
export const NEW_QUIZ_COUNT = 10;
export const QUIZ_AUDIENCES: readonly QuizAudience[] = ['all', 'kids', 'experts'];
export const POSTER_PALETTES: readonly PosterPalette[] = ['pink', 'blue', 'green', 'orange', 'red', 'cyan', 'violet', 'gold'];

// Durées en secondes.
export const STARTING_DURATION_S = 3;
export const QUESTION_DURATION_S: Record<AnswerMode, number> = { choice: 20, free: 30 };
export const ALL_ANSWERED_DELAY_S = 2;
export const REVEAL_DURATION_S: Record<AnswerMode, number> = { choice: 6, free: 6 };
export const SCORES_DURATION_S = 5;
// Fin du classement : annonce plein écran de la question suivante (comprise dans SCORES_DURATION_S).
export const NEXT_QUESTION_ANNOUNCE_MS = 1_500;
// Hôte absent (coupure) : au-delà, joueurs ou TV suppriment la partie (spec 6.6).
// Même valeur écrite en dur dans database.rules.json (300000 ms), vérifiée par les tests des règles.
export const HOST_DISCONNECT_TIMEOUT_S = 300;
// Marge avant la révélation, après la fin du chrono : laisse arriver les dernières réponses
// (les règles acceptent submittedAt jusqu'à phaseEndsAt + 1 000 ms).
export const REVEAL_GRACE_MS = 1200;
// Durée maximale d'attente d'une transition de l'hôte avant de relâcher son verrou (écriture en attente).
export const TRANSITION_LOCK_MAX_MS = 10_000;
// Joueurs et TV : phase considérée comme bloquée (« En attente de l'hôte… ») au-delà de cette
// marge après phaseEndsAt sans changement de phase (l'hôte avance normalement bien avant).
export const STALE_PHASE_MARGIN_MS = 5_000;

// Points : bonne réponse, plus bonus de rapidité jusqu'à MAX_SPEED_BONUS_POINTS.
export const CORRECT_ANSWER_POINTS = 100;
export const MAX_SPEED_BONUS_POINTS = 100;

export const SCORES_TOP_COUNT = 5;

// Réglages proposés par défaut sur la fiche d'un quiz.
export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  answerMode: 'choice',
  speedBonus: true,
  control: false,
  teams: false,
};

// Réponse libre : une faute de frappe tolérée si la réponse attendue a au moins ce nombre de lettres.
export const TYPO_TOLERANCE_MIN_LETTERS = 5;

export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 12;
// Limites de contenu, identiques aux règles de validation de database.rules.json.
export const QUESTION_TEXT_MAX_LENGTH = 140;
export const OPTION_TEXT_MAX_LENGTH = 80;
export const EXPLANATION_MAX_LENGTH = 300;
export const QUESTION_TIME_LIMIT_MAX_S = 300;

// Code de salle sans caractères ambigus (ni O/0, ni I/1).
export const ROOM_CODE_LENGTH = 4;
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// Codes tirés au plus à la création d'une partie, si les précédents sont déjà pris.
export const ROOM_CODE_MAX_ATTEMPTS = 5;

export const SESSION_TTL_HOURS = 24;

// Site Firebase Hosting des joueurs (cible « players » dans .firebaserc). Le QR code du lobby
// pointe vers `${PLAYERS_SITE_URL}/join/CODE` (spec 6.6).
export const PLAYERS_SITE_URL = 'https://quizin-play.web.app';

// Site Firebase Hosting du récepteur TV (cible « tv ») : il affiche la partie de `?code=CODE`.
export const RECEIVER_SITE_URL = 'https://quiz-in-7dbd6.web.app';
export const RECEIVER_CODE_PARAM = 'code';

// Seuils de la difficulté moyenne d'un quiz : en dessous = Facile, jusqu'à = Moyen, au-delà = Difficile.
export const DIFFICULTY_EASY_MAX = 1.67;
export const DIFFICULTY_MEDIUM_MAX = 2.33;

// Blind test (spec 15) : extrait joué par la TV, pris dans la preview de 30 s de la source audio.
export const AUDIO_SOURCES: readonly AudioSourceId[] = ['deezer'];
export const AUDIO_PREVIEW_S = 30;
// L'extrait joue pendant tout le timer de la question : début + timer ≤ AUDIO_PREVIEW_S. Avec le timer
// des Choix multiples (20 s), le début se choisit entre 0 et 10 s.
export const AUDIO_EXTRACT_START_S = 0;
// Les adresses des extraits expirent (Deezer : environ 15 min) : l'hôte renouvelle toute adresse à
// laquelle il reste moins de AUDIO_URL_MIN_VALIDITY_MS, en vérifiant toutes les AUDIO_URL_REFRESH_INTERVAL_MS.
export const AUDIO_URL_MIN_VALIDITY_MS = 5 * 60_000;
export const AUDIO_URL_REFRESH_INTERVAL_MS = 60_000;
// Fondu de fin, sur les dernières millisecondes du timer (pas de musique pendant la révélation).
export const AUDIO_FADE_OUT_MS = 400;
// Interrupteur à distance du blind test : absent ou false = désactivé (modifiable dans la console seulement).
export const BLIND_TEST_ENABLED_PATH = 'config/blindTestEnabled';
