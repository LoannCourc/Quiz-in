// Jauge des votes à la révélation : part de chaque proposition, de 0 à 1, sur les joueurs qui ont répondu.
export function voteShares(counts: readonly number[]): number[] {
  const total = counts.reduce((sum, count) => sum + count, 0)
  return counts.map((count) => (total > 0 ? count / total : 0))
}
