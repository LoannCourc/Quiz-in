import type { Player, PlayerId, Session } from '@shared/types'

export interface RankedPlayer extends Player {
  id: PlayerId
}

// Les rangs sont calculés par l'hôte ; la TV se contente de trier pour l'affichage.
export function sortByRank(players: Record<PlayerId, Player>): RankedPlayer[] {
  return Object.entries(players)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'fr'))
}

export function currentAnswers(session: Session) {
  return session.answers?.[session.currentIndex] ?? {}
}

// Comme la règle de passage automatique (spec 5), on ne compte que les joueurs connectés.
export function countConnected(players: RankedPlayer[]): number {
  return players.filter((player) => player.connected).length
}

export function countConnectedAnswered(session: Session, players: RankedPlayer[]): number {
  const answers = currentAnswers(session)
  return players.filter((player) => player.connected && answers[player.id]).length
}
