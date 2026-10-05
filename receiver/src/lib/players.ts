import type { Player, PlayerId, PublicSession } from '@shared/types'

export interface RankedPlayer extends Player {
  id: PlayerId
}

// Les rangs sont calculés par l'hôte ; la TV se contente de trier pour l'affichage.
export function sortByRank(players: Record<PlayerId, Player>): RankedPlayer[] {
  return Object.entries(players)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'fr'))
}

// Suspense : aucun ordre ne doit trahir le classement en cours de partie, tri par pseudo.
// Réponses reçues à la question en cours (answeredBy : qui, jamais quoi), joueurs déconnectés compris.
export function answeredByCount(session: PublicSession): number {
  return Object.keys(session.answeredBy?.[session.currentIndex] ?? {}).length
}

export function sortForGame(session: PublicSession): RankedPlayer[] {
  if (!session.settings.suspense) return sortByRank(session.players)
  return Object.entries(session.players)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

// La TV sait qui a répondu (answeredBy), jamais ce qui a été répondu.
export function hasAnswered(session: PublicSession, playerId: PlayerId): boolean {
  return session.answeredBy?.[session.currentIndex]?.[playerId] === true
}

// Comme la règle de passage automatique (spec 5), on ne compte que les joueurs connectés.
export function countConnected(players: RankedPlayer[]): number {
  return players.filter((player) => player.connected).length
}

export function countConnectedAnswered(session: PublicSession, players: RankedPlayer[]): number {
  return players.filter((player) => player.connected && hasAnswered(session, player.id)).length
}
