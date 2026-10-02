import { MIN_PLAYERS } from './constants'
import type { Player, PlayerId } from './types'

// Seule la présence compte ici : en lobby, score et rank ne sont pas encore écrits.
type PresenceEntries = Record<PlayerId, Pick<Player, 'connected'>>

// Joueurs connectés (présence écrite par chaque joueur, spec 7).
export function connectedPlayerIds(players: PresenceEntries): PlayerId[] {
  return Object.entries(players)
    .filter(([, player]) => player.connected === true)
    .map(([id]) => id)
}

// Spec 5 : lancement possible à partir de MIN_PLAYERS joueurs connectés, hôte compris.
export function canLaunchGame(players: PresenceEntries): boolean {
  return connectedPlayerIds(players).length >= MIN_PLAYERS
}
