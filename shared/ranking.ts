import type { PlayerId } from './types'

// Rangs avec égalités (spec 6.5) : 280, 150, 150, 0 donnent 1, 2, 2, 4.
// Le rang d'un joueur = 1 + nombre de joueurs qui ont strictement plus de points.
export function computeRanks(scores: Record<PlayerId, number>): Record<PlayerId, number> {
  const values = Object.values(scores)
  return Object.fromEntries(
    Object.entries(scores).map(([playerId, score]) => [
      playerId,
      1 + values.filter((other) => other > score).length,
    ]),
  )
}
