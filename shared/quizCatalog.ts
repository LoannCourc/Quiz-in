import {
  DIFFICULTY_EASY_MAX,
  DIFFICULTY_MEDIUM_MAX,
  QUESTION_DURATION_S,
  REVEAL_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
} from './constants'
import type { AnswerMode, Difficulty, DifficultyLevel, SessionSettings } from './types'

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

// Durée estimée en minutes, calculée sur le mode le plus long (Réponse libre), arrondie au-dessus.
export function estimateQuizMinutes(questionCount: number): number {
  const perQuestionS = QUESTION_DURATION_S.free + REVEAL_DURATION_S.free + SCORES_DURATION_S
  return Math.ceil((STARTING_DURATION_S + questionCount * perQuestionS) / 60)
}

export type GameOption = 'speedBonus' | 'control' | 'teams'

// Options développées au MVP : Contrôle (P1) et Groupe (P2) sont affichées mais désactivées.
export const AVAILABLE_OPTIONS: readonly GameOption[] = ['speedBonus']

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
