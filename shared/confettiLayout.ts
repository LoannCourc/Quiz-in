// Confettis de « La bonne réponse » (TV) : répartis régulièrement sur toute la largeur, départs mélangés pour ne pas
// tomber en vague de gauche à droite. Au-dessus de la mise en page : les cartes des réponses couvrent toute la largeur,
// des confettis placés derrière n'étaient visibles que dans les marges. Logique pure, testée.
export const SPREAD_CONFETTI_COUNT = 18

export interface SpreadConfettiPiece {
  leftPercent: number
  delayMs: number
  durationMs: number
  colorIndex: number
}

const FIRST_LEFT = 3
const LAST_LEFT = 97
const DELAY_STEP_MS = 65
// Multiplicateur premier avec 18 : chaque rang de départ sert une seule fois, les voisins partent loin l'un de l'autre.
const DELAY_ORDER_STEP = 7
const DURATIONS_MS = [2_200, 2_600, 2_400] as const

export function spreadConfettiPieces(colorCount: number): SpreadConfettiPiece[] {
  return Array.from({ length: SPREAD_CONFETTI_COUNT }, (_, index) => ({
    leftPercent: FIRST_LEFT + (index * (LAST_LEFT - FIRST_LEFT)) / (SPREAD_CONFETTI_COUNT - 1),
    delayMs: ((index * DELAY_ORDER_STEP) % SPREAD_CONFETTI_COUNT) * DELAY_STEP_MS,
    durationMs: DURATIONS_MS[index % DURATIONS_MS.length],
    colorIndex: index % colorCount,
  }))
}
