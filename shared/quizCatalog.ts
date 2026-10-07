import {
  BLUFF_TARGET_CHOICES,
  BLUFF_VOTE_ESTIMATE_S,
  DEFAULT_SESSION_SETTINGS,
  DIFFICULTY_EASY_MAX,
  DIFFICULTY_MEDIUM_MAX,
  QUESTION_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
  VALIDATION_ESTIMATE_S,
} from './constants'
import { hasValidationPhase, revealDurationS } from './gameFlow'
import type { AnswerMode, Difficulty, DifficultyLevel, QuizGameType, SessionSettings } from './types'

// Identifiant de quiz : minuscules, chiffres et tirets (aussi utilisé comme clé dans la base).
export function isValidQuizId(quizId: string): boolean {
  return /^[a-z0-9-]{1,64}$/.test(quizId)
}

// Moyenne arrondie au centième, comme elle est stockée dans quizzes/{quizId}/difficulty.
export function averageDifficulty(difficulties: readonly Difficulty[]): number {
  if (difficulties.length === 0) return 0
  const sum = difficulties.reduce<number>((total, difficulty) => total + difficulty, 0)
  return Math.round((sum / difficulties.length) * 100) / 100
}

// Spec 8 : moins de 1,67 → Facile, jusqu'à 2,33 → Moyen, au-delà → Difficile.
export function difficultyLevel(average: number): DifficultyLevel {
  if (average < DIFFICULTY_EASY_MAX) return 'easy'
  if (average <= DIFFICULTY_MEDIUM_MAX) return 'medium'
  return 'hard'
}

// Durée estimée en minutes, arrondie au-dessus. Par défaut, celle du mode proposé à la création
// de la partie (Choix multiples).
// Phases de réponse d'une question : écriture et vote en Bluff (révélation estimée avec les choix visés).
function answerPhasesS(answerMode: AnswerMode): number {
  const voteS = answerMode === 'bluff' ? BLUFF_VOTE_ESTIMATE_S : 0
  return QUESTION_DURATION_S[answerMode] + voteS + revealDurationS(answerMode, BLUFF_TARGET_CHOICES)
}

export function estimateQuizMinutes(
  questionCount: number,
  answerMode: AnswerMode = DEFAULT_SESSION_SETTINGS.answerMode,
): number {
  // Un classement après chaque question, sauf la dernière (l'écran de fin le remplace).
  const totalS = STARTING_DURATION_S + questionCount * answerPhasesS(answerMode) + Math.max(0, questionCount - 1) * SCORES_DURATION_S
  return Math.ceil(totalS / 60)
}

// Durée estimée d'une partie selon ses réglages, en minutes arrondies au-dessus : sans les classements
// intermédiaires en Suspense (ni après la dernière question), avec une validation estimée en Contrôle ; null en Pas à pas (la durée
// dépend de l'hôte : « à votre rythme »).
export function estimateGameMinutes(questionCount: number, settings: SessionSettings): number | null {
  if (settings.stepByStep) return null
  const { answerMode } = settings
  const scoresS = settings.suspense ? 0 : SCORES_DURATION_S
  const validationS = hasValidationPhase(settings) ? VALIDATION_ESTIMATE_S : 0
  const totalS = STARTING_DURATION_S + questionCount * (answerPhasesS(answerMode) + validationS) + Math.max(0, questionCount - 1) * scoresS
  return Math.ceil(totalS / 60)
}

export type GameOption ='speedBonus' | 'control' | 'teams'

// Options développées (Contrôle seulement en Réponse libre).
export const AVAILABLE_OPTIONS: readonly GameOption[] = ['speedBonus', 'control', 'teams']

// Modes de réponse jouables (un mode absent serait affiché « bientôt »).
export const AVAILABLE_ANSWER_MODES: readonly AnswerMode[] = ['choice', 'free']

// Règles de compatibilité (spec 4.1) : Contrôle seulement en Réponse libre ; en Choix multiples,
// deux options actives au maximum ; en Réponse libre, les trois peuvent l'être.
export function areSettingsCompatible(settings: SessionSettings): boolean {
  if (settings.control && settings.answerMode !== 'free') return false
  const activeCount = [settings.speedBonus, settings.control, settings.teams].filter(Boolean).length
  return settings.answerMode === 'free' || activeCount <= 2
}

export function canEnableOption(settings: SessionSettings, option: GameOption): boolean {
  return AVAILABLE_OPTIONS.includes(option) && areSettingsCompatible({ ...settings, [option]: true })
}

// Changer de mode coupe les options devenues incompatibles (Contrôle en Choix multiples).
export function withAnswerMode(settings: SessionSettings, answerMode: AnswerMode): SessionSettings {
  const next = { ...settings, answerMode }
  return areSettingsCompatible(next) ? next : { ...next, control: false }
}

// Options sans objet en Bluff (spec 16) : pas de mode de réponse à choisir, ni Contrôle ni Rapidité.
export const BLUFF_HIDDEN_OPTIONS: readonly GameOption[] = ['speedBonus', 'control']

// Réglages adaptés au type du quiz : un Bluff se joue toujours en mode bluff, sans Contrôle ni Rapidité ;
// un autre quiz ne garde jamais le mode bluff (retour au mode par défaut).
// Mode de réponse imposé par le type de jeu (Bluff, Dessine-moi) : pas de choix du mode dans la feuille,
// ni Contrôle ni Rapidité.
export function hasImposedAnswerMode(answerMode: AnswerMode): boolean {
  return answerMode === 'bluff' || answerMode === 'draw'
}

export function settingsForGameType(settings: SessionSettings, gameType: QuizGameType): SessionSettings {
  if (gameType === 'bluff') return { ...settings, answerMode: 'bluff', speedBonus: false, control: false }
  // Dessine-moi (lot 2) : sans Rapidité ni Contrôle (le jugement des réponses viendra au lot 3).
  if (gameType === 'draw') return { ...settings, answerMode: 'draw', speedBonus: false, control: false }
  return settings.answerMode === 'bluff' ? { ...settings, answerMode: DEFAULT_SESSION_SETTINGS.answerMode } : settings
}
