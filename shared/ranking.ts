import type { PlayerId, PublicSession } from './types'

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

// Rangs d'avant la dernière question, recalculés à partir des scores moins les points de cette question
// (publiés dans reveal.results) : rien de plus à garder dans la base, et une TV rechargée retrouve la même valeur.
export function previousRanks(session: Pick<PublicSession, 'players' | 'reveal'>): Record<PlayerId, number> {
  const results = session.reveal?.results ?? {}
  const before: Record<PlayerId, number> = {}
  for (const [id, player] of Object.entries(session.players)) before[id] = (player.score ?? 0) - (results[id]?.points ?? 0)
  return computeRanks(before)
}
