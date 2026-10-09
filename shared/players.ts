import { LOBBY_GHOST_GRACE_MS, MIN_PLAYERS } from './constants'
import type { GameStatus, Player, PlayerId } from './types'

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

// Heure (horloge de l'hôte) à laquelle l'hôte a vu chaque joueur passer à « déconnecté ».
// La base ne stocke pas cette heure : l'hôte la note lui-même en suivant la présence.
export type DisconnectedSince = Record<PlayerId, number>

// Met à jour le suivi : un joueur qui vient de se déconnecter est noté à nowMs ; un joueur
// reconnecté ou retiré de la partie sort du suivi ; les autres gardent leur heure.
export function trackDisconnections(
  previous: DisconnectedSince,
  players: PresenceEntries,
  nowMs: number,
): DisconnectedSince {
  const next: DisconnectedSince = {}
  for (const [id, player] of Object.entries(players)) {
    if (player.connected !== true) next[id] = previous[id] ?? nowMs
  }
  return next
}

// Joueurs fantômes à retirer du lobby : déconnectés depuis plus de LOBBY_GHOST_GRACE_MS.
// Uniquement en LOBBY (après le lancement, un joueur déconnecté garde sa place, spec 6.6),
// et jamais l'hôte.
export function ghostPlayersToRemove(
  game: { status: GameStatus; hostUid: PlayerId; players: PresenceEntries },
  disconnectedSince: DisconnectedSince,
  nowMs: number,
): PlayerId[] {
  if (game.status !== 'lobby') return []
  return Object.entries(game.players)
    .filter(([id, player]) => {
      const since = disconnectedSince[id]
      return id !== game.hostUid && player.connected !== true && since !== undefined && nowMs - since > LOBBY_GHOST_GRACE_MS
    })
    .map(([id]) => id)
}

// « x/N ont répondu » : parmi les joueurs connectés, ceux qui ont répondu à la question courante
// (answeredBy, public : qui a répondu, jamais quoi).
export function answeredProgress(
  players: PresenceEntries,
  answeredBy: Record<PlayerId, true> | undefined,
): { answered: number; total: number } {
  const connected = connectedPlayerIds(players)
  return { answered: connected.filter((id) => answeredBy?.[id] === true).length, total: connected.length }
}

// « Quitter » de l'hôte qui jouait (feuille Réglages du salon) : son entrée de joueur est retirée, rien
// d'autre (équipes, tirage et validation restent ; le salon dit s'il manque un joueur dans une équipe).
export function hostLeaveUpdate(session: { status: GameStatus; hostUid: PlayerId; players: Record<PlayerId, unknown> }): Record<string, null> | null {
  if (session.status !== 'lobby' || session.players[session.hostUid] === undefined) return null
  return { [`players/${session.hostUid}`]: null }
}

// « Exclure » de l'hôte (salon) : l'entrée du joueur est retirée et son identifiant gardé dans banned :
// les règles l'empêchent de rejoindre à nouveau cette partie (même navigateur, même identifiant).
// Jamais l'hôte lui-même, seulement en lobby, seulement un joueur présent.
export function removePlayerUpdate(
  session: { status: GameStatus; hostUid: PlayerId; players: Record<PlayerId, unknown> },
  uid: PlayerId,
): Record<string, true | null> | null {
  if (session.status !== 'lobby' || uid === session.hostUid || session.players[uid] === undefined) return null
  return { [`players/${uid}`]: null, [`banned/${uid}`]: true }
}
