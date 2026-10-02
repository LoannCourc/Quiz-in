import { CORRECT_ANSWER_POINTS, MAX_SPEED_BONUS_POINTS } from './constants'

export interface PointsInput {
  correct: boolean
  speedBonus: boolean
  // Temps restant au moment de la réponse (phaseEndsAt - submittedAt, horodatages serveur).
  remainingMs: number
  // Durée totale de la question.
  durationMs: number
}

// Spec 6.2 : 100 points par bonne réponse, plus arrondi(100 × temps restant / durée) avec Rapidité.
export function computePoints({ correct, speedBonus, remainingMs, durationMs }: PointsInput): number {
  if (!correct) return 0
  if (!speedBonus || durationMs <= 0) return CORRECT_ANSWER_POINTS
  // Une réponse reçue dans la tolérance réseau (après la fin) a un temps restant négatif : bonus nul.
  const ratio = Math.min(Math.max(remainingMs / durationMs, 0), 1)
  return CORRECT_ANSWER_POINTS + Math.round(MAX_SPEED_BONUS_POINTS * ratio)
}
