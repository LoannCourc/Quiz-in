import { STARTING_DURATION_S } from './constants'

// 3-2-1 puis « GO ! » au début de la partie (spec 5), dans la durée de la phase STARTING : la première
// question arrive à la même heure qu'avant le « GO ! ». Calendrier commun à la TV, aux téléphones et aux
// sons (bips sur chaque chiffre, son GO sur le « GO ! »), compté depuis la fin de la phase (une reprise
// après une pause garde le même déroulé).

export const STARTING_DIGITS = 3
export const GO_DISPLAY_MS = 600
// 0,8 s par chiffre : (3 000 - 600) / 3.
export const STARTING_DIGIT_MS = (STARTING_DURATION_S * 1000 - GO_DISPLAY_MS) / STARTING_DIGITS

export type StartingStep = number | 'go'

// Ce qu'affiche le 3-2-1 quand il reste remainingMs avant la fin de la phase.
export function startingStep(remainingMs: number): StartingStep {
  if (remainingMs <= GO_DISPLAY_MS) return 'go'
  return Math.min(STARTING_DIGITS, Math.ceil((remainingMs - GO_DISPLAY_MS) / STARTING_DIGIT_MS))
}

// Temps (ms) avant le prochain changement d'affichage ; 0 une fois la phase finie.
export function msUntilNextStartingStep(remainingMs: number): number {
  if (remainingMs <= 0) return 0
  if (remainingMs <= GO_DISPLAY_MS) return remainingMs
  return (remainingMs - GO_DISPLAY_MS) % STARTING_DIGIT_MS || STARTING_DIGIT_MS
}

// Heures (serveur) du début de chaque chiffre (3, 2, 1) et du « GO ! », pour une phase finissant à end.
export function startingTimeline(end: number): { digitsAt: number[]; goAt: number } {
  const goAt = end - GO_DISPLAY_MS
  const digitsAt = Array.from({ length: STARTING_DIGITS }, (_, index) => goAt - (STARTING_DIGITS - index) * STARTING_DIGIT_MS)
  return { digitsAt, goAt }
}
