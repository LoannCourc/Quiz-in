import { activeTeams, teamCountOf } from './teams'
import type { PlayerId, PublicSession, TeamId } from './types'

// Tirage des équipes (spec 6.4) : écran de la TV après chaque « Tirer au sort ». Les joueurs arrivent un à
// un dans leur colonne, puis le gong marque la fin. Calendrier commun à l'écran, aux sons de la TV et au
// bouton « Valider les équipes » de l'hôte (jamais avant que tous les joueurs soient placés).

// Intervalle entre deux arrivées, réduit pour que toutes les arrivées tiennent en TEAM_DRAW_ARRIVALS_MAX_MS.
export const TEAM_DRAW_STEP_MS = 450
export const TEAM_DRAW_ARRIVALS_MAX_MS = 6_000
// Durée de l'arrivée d'un joueur (animation de la TV) : le gong sonne quand le dernier est posé.
export const TEAM_DRAW_ARRIVAL_MS = 500
// Équipes complètes à l'écran après le gong, avant le retour au salon.
export const TEAM_DRAW_HOLD_MS = 3_000

export interface TeamColumn {
  team: TeamId
  // Membres triés par pseudo (même ordre sur la TV, au salon et au tirage).
  members: PlayerId[]
}

type TeamSession = Pick<PublicSession, 'players' | 'settings'>

// Colonnes des équipes de la partie, et joueurs sans équipe (arrivés après le tirage).
export function teamColumns(session: TeamSession): { columns: TeamColumn[]; unassigned: PlayerId[] } {
  const playerIds = Object.keys(session.players)
  const teams = activeTeams(teamCountOf(session.settings, playerIds.length))
  const byName = (a: PlayerId, b: PlayerId) => session.players[a].name.localeCompare(session.players[b].name, 'fr')
  const columns = teams.map((team) => ({ team, members: playerIds.filter((id) => session.players[id].team === team).sort(byName) }))
  const unassigned = playerIds.filter((id) => !teams.includes(session.players[id].team as TeamId)).sort(byName)
  return { columns, unassigned }
}

export interface TeamDrawArrival {
  playerId: PlayerId
  team: TeamId
  // Instant d'arrivée, en ms depuis le tirage (teamDrawAt).
  atMs: number
}

export interface TeamDrawTimeline {
  // Dans l'ordre d'arrivée : le 1er de chaque équipe, puis le 2e de chaque équipe… sans trou quand les
  // équipes sont de tailles inégales.
  arrivals: TeamDrawArrival[]
  stepMs: number
  // Dernier joueur posé : gong ; l'écran du tirage reste jusqu'à endMs.
  gongAtMs: number
  endMs: number
}

export function teamDrawStepMs(arrivalCount: number): number {
  if (arrivalCount <= 1) return TEAM_DRAW_STEP_MS
  return Math.min(TEAM_DRAW_STEP_MS, Math.floor(TEAM_DRAW_ARRIVALS_MAX_MS / (arrivalCount - 1)))
}

export function teamDrawTimeline(session: TeamSession): TeamDrawTimeline {
  const { columns } = teamColumns(session)
  const rows = Math.max(0, ...columns.map((column) => column.members.length))
  const order: Omit<TeamDrawArrival, 'atMs'>[] = []
  for (let row = 0; row < rows; row++) {
    for (const { team, members } of columns) if (members[row]) order.push({ playerId: members[row], team })
  }
  const stepMs = teamDrawStepMs(order.length)
  const arrivals = order.map((arrival, index) => ({ ...arrival, atMs: index * stepMs }))
  const lastAtMs = arrivals.length > 0 ? arrivals[arrivals.length - 1].atMs : 0
  const gongAtMs = lastAtMs + TEAM_DRAW_ARRIVAL_MS
  return { arrivals, stepMs, gongAtMs, endMs: gongAtMs + TEAM_DRAW_HOLD_MS }
}
