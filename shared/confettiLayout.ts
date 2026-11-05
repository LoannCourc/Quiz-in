// Confettis de « La bonne réponse » (TV) : répartis régulièrement sur toute la largeur, départs mélangés pour ne pas
// tomber en vague de gauche à droite. Même nombre qu'avant (règle : 10 à 15 au plus). Logique pure, testée.
export const SPREAD_CONFETTI_COUNT = 12

export interface SpreadConfettiPiece {
  leftPercent: number
  delayMs: number
  durationMs: number
  colorIndex: number
}

const FIRST_LEFT = 4
const LAST_LEFT = 96
const DELAY_STEP_MS = 110
// Multiplicateur premier avec 12 : chaque rang de départ sert une seule fois, les voisins partent loin l'un de l'autre.
const DELAY_ORDER_STEP = 5
const DURATIONS_MS = [2_800, 3_200, 3_000] as const

export function spreadConfettiPieces(colorCount: number): SpreadConfettiPiece[] {
  return Array.from({ length: SPREAD_CONFETTI_COUNT }, (_, index) => ({
    leftPercent: FIRST_LEFT + (index * (LAST_LEFT - FIRST_LEFT)) / (SPREAD_CONFETTI_COUNT - 1),
    delayMs: ((index * DELAY_ORDER_STEP) % SPREAD_CONFETTI_COUNT) * DELAY_STEP_MS,
    durationMs: DURATIONS_MS[index % DURATIONS_MS.length],
    colorIndex: index % colorCount,
  }))
}
