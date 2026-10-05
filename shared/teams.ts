import { MAX_TEAMS, MIN_TEAM_GAME_PLAYERS, MIN_TEAM_SIZE, MIN_TEAMS } from './constants'
import type { SessionUpdate } from './hostEngine'
import { computeRanks } from './ranking'
import type { Player, PlayerId, PlayerResult, PublicSession, Session, SessionSettings, TeamId, TeamMode, TeamStanding } from './types'

// Groupe (spec 6.4) : formation des équipes en LOBBY, contrôles du lancement et score des équipes.
// Logique pure, testée ; le moteur et les écrans ne font qu'appeler ces fonctions.

// Ordre fixe des équipes : avec 2 équipes, Rose et Cyan ; avec 3, plus Or ; avec 4, plus Vert.
export const TEAM_IDS: readonly TeamId[] = ['pink', 'cyan', 'gold', 'green']

export const TEAM_MODES: readonly TeamMode[] = ['random', 'host', 'players']

function clampTeamCount(count: number): number {
  return Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, Math.round(count)))
}

// Nombre d'équipes proposé : le plus grand qui laisse au moins 2 joueurs par équipe (4 au plus).
export function suggestedTeamCount(playerCount: number): number {
  return clampTeamCount(Math.floor(playerCount / MIN_TEAM_SIZE))
}

// Nombre d'équipes de la partie : celui choisi par l'hôte, sinon le nombre proposé.
export function teamCountOf(settings: Pick<SessionSettings, 'teamCount'>, playerCount: number): number {
  return settings.teamCount === undefined ? suggestedTeamCount(playerCount) : clampTeamCount(settings.teamCount)
}

export function activeTeams(teamCount: number): TeamId[] {
  return TEAM_IDS.slice(0, clampTeamCount(teamCount))
}

export function teamModeOf(settings: Pick<SessionSettings, 'teamMode'>): TeamMode {
  return settings.teamMode ?? 'random'
}

export function isTeamId(value: unknown): value is TeamId {
  return TEAM_IDS.includes(value as TeamId)
}

type TeamPlayers = Record<PlayerId, Pick<Player, 'team'>>

export function teamMembers(players: TeamPlayers, team: TeamId): PlayerId[] {
  return Object.keys(players).filter((id) => players[id].team === team)
}

// Tirage équilibré : joueurs mélangés (Fisher-Yates), puis distribués à tour de rôle ; les tailles
// d'équipe diffèrent d'un joueur au plus. random : générateur dans [0, 1[ (remplaçable pour les tests).
export function drawTeams(
  playerIds: readonly PlayerId[],
  teamCount: number,
  random: () => number = Math.random,
): Record<PlayerId, TeamId> {
  const shuffled = [...playerIds]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  const teams = activeTeams(teamCount)
  return Object.fromEntries(shuffled.map((id, index) => [id, teams[index % teams.length]]))
}

function isTeamLobby(session: Session): boolean {
  return session.status === 'lobby' && session.settings.teams === true
}

// Nombre d'équipes écrit avec chaque action du salon : les règles vérifient l'équipe d'un joueur
// d'après settings/teamCount (Or à partir de 3 équipes, Vert à 4).
function countPath(session: Session): SessionUpdate {
  return { 'settings/teamCount': teamCountOf(session.settings, Object.keys(session.players).length) }
}

// « Tirer au sort » : nouvelles équipes pour tous les joueurs, et heure du tirage (animation TV).
export function teamDrawUpdate(session: Session, nowServer: number, random: () => number = Math.random): SessionUpdate | null {
  if (!isTeamLobby(session)) return null
  const playerIds = Object.keys(session.players)
  const draw = drawTeams(playerIds, teamCountOf(session.settings, playerIds.length), random)
  const update: SessionUpdate = { ...countPath(session), teamDrawAt: nowServer }
  for (const [id, team] of Object.entries(draw)) update[`players/${id}/team`] = team
  return update
}

// L'hôte place un joueur dans une équipe (ou le retire de son équipe avec null).
export function assignTeamUpdate(session: Session, playerId: PlayerId, team: TeamId | null): SessionUpdate | null {
  if (!isTeamLobby(session) || !session.players[playerId]) return null
  const teams = activeTeams(teamCountOf(session.settings, Object.keys(session.players).length))
  if (team !== null && !teams.includes(team)) return null
  return { ...countPath(session), [`players/${playerId}/team`]: team }
}

// Nombre d'équipes choisi par l'hôte : les joueurs d'une équipe supprimée redeviennent sans équipe.
export function teamCountUpdate(session: Session, count: number): SessionUpdate | null {
  if (!isTeamLobby(session)) return null
  const teams = activeTeams(count)
  const update: SessionUpdate = { 'settings/teamCount': clampTeamCount(count) }
  for (const [id, player] of Object.entries(session.players)) {
    if (player.team && !teams.includes(player.team)) update[`players/${id}/team`] = null
  }
  return update
}

export function teamModeUpdate(session: Session, mode: TeamMode): SessionUpdate | null {
  return isTeamLobby(session) ? { ...countPath(session), 'settings/teamMode': mode } : null
}

// Raisons d'un lancement refusé en Groupe.
export type TeamRefusal = 'teamsTooFewPlayers' | 'teamsUnassigned' | 'teamTooSmall'

export function teamLaunchRefusal(session: Pick<PublicSession, 'settings' | 'players'>): TeamRefusal | null {
  if (!session.settings.teams) return null
  const playerIds = Object.keys(session.players)
  if (playerIds.length < MIN_TEAM_GAME_PLAYERS) return 'teamsTooFewPlayers'
  const teams = activeTeams(teamCountOf(session.settings, playerIds.length))
  if (playerIds.some((id) => !teams.includes(session.players[id].team as TeamId))) return 'teamsUnassigned'
  if (teams.some((team) => teamMembers(session.players, team).length < MIN_TEAM_SIZE)) return 'teamTooSmall'
  return null
}

// Joueurs comptés pour les équipes à la fin d'une question : ceux qui ont une équipe et sont connectés.
export function teamPresenceSnapshot(players: Record<PlayerId, Pick<Player, 'team' | 'connected'>>): Record<PlayerId, true> {
  return Object.fromEntries(
    Object.entries(players)
      .filter(([, player]) => player.team !== undefined && player.connected === true)
      .map(([id]) => [id, true as const]),
  )
}

// Points d'équipe d'une question : moyenne des points de ses joueurs présents à la fin de la question
// (un joueur présent sans réponse compte 0). Une équipe sans joueur présent marque 0.
export function teamQuestionPoints(
  players: TeamPlayers,
  presence: Readonly<Record<PlayerId, true>>,
  results: Readonly<Record<PlayerId, PlayerResult>>,
  teams: readonly TeamId[],
): Partial<Record<TeamId, number>> {
  return Object.fromEntries(
    teams.map((team) => {
      const present = teamMembers(players, team).filter((id) => presence[id])
      const total = present.reduce((sum, id) => sum + (results[id]?.points ?? 0), 0)
      return [team, present.length === 0 ? 0 : total / present.length]
    }),
  )
}

// Score et rang de chaque équipe : somme des points d'équipe des questions 0 à upToIndex.
export function teamStandings(
  teamPoints: Readonly<Record<number, Partial<Record<TeamId, number>>>>,
  teams: readonly TeamId[],
  upToIndex: number,
): Record<TeamId, TeamStanding> {
  const scores = Object.fromEntries(
    teams.map((team) => {
      let score = 0
      for (let index = 0; index <= upToIndex; index++) score += teamPoints[index]?.[team] ?? 0
      return [team, score]
    }),
  )
  const ranks = computeRanks(scores)
  return Object.fromEntries(teams.map((team) => [team, { score: scores[team], rank: ranks[team] }])) as Record<
    TeamId,
    TeamStanding
  >
}

// Équipes de la partie en cours, d'après les joueurs (celles qui ont au moins un joueur), dans l'ordre fixe.
export function teamsInGame(players: TeamPlayers): TeamId[] {
  return TEAM_IDS.filter((team) => teamMembers(players, team).length > 0)
}

// Rang d'un joueur dans son équipe (d'après les scores individuels) et taille de l'équipe.
export function rankInTeam(
  players: Record<PlayerId, Pick<Player, 'team' | 'score'>>,
  playerId: PlayerId,
): { rank: number; size: number } | null {
  const team = players[playerId]?.team
  if (!team) return null
  const members = teamMembers(players, team)
  const ranks = computeRanks(Object.fromEntries(members.map((id) => [id, players[id].score ?? 0])))
  return { rank: ranks[playerId], size: members.length }
}

// Meilleur joueur de chaque équipe (score individuel le plus haut ; à égalité, le premier pseudo).
export function bestPlayerByTeam(
  players: Record<PlayerId, Pick<Player, 'team' | 'score' | 'name'>>,
): Partial<Record<TeamId, PlayerId>> {
  const best: Partial<Record<TeamId, PlayerId>> = {}
  for (const [id, player] of Object.entries(players)) {
    if (!player.team) continue
    const current = best[player.team]
    const isBetter =
      current === undefined ||
      (player.score ?? 0) > (players[current].score ?? 0) ||
      ((player.score ?? 0) === (players[current].score ?? 0) && player.name.localeCompare(players[current].name, 'fr') < 0)
    if (isBetter) best[player.team] = id
  }
  return best
}

// Ligne du classement des équipes (TV et téléphone) : score, rang et meilleur joueur.
export interface TeamRow {
  team: TeamId
  score: number
  rank: number
  bestPlayerId?: PlayerId
}

// Classement des équipes de la partie, du premier au dernier (à égalité, dans l'ordre fixe).
export function teamRanking(session: Pick<PublicSession, 'teams' | 'players'>): TeamRow[] {
  const best = bestPlayerByTeam(session.players)
  return teamsInGame(session.players)
    .map((team) => ({
      team,
      score: session.teams?.[team]?.score ?? 0,
      rank: session.teams?.[team]?.rank ?? 1,
      ...(best[team] !== undefined && { bestPlayerId: best[team] }),
    }))
    .sort((a, b) => a.rank - b.rank || TEAM_IDS.indexOf(a.team) - TEAM_IDS.indexOf(b.team))
}

// Rang d'une équipe avant la question en cours (« 3e → 2e ») ; undefined à la première question.
export function previousTeamRank(
  session: Pick<PublicSession, 'teamPoints' | 'players' | 'currentIndex'>,
  team: TeamId,
): number | undefined {
  if (session.currentIndex === 0) return undefined
  const standings = teamStandings(session.teamPoints ?? {}, teamsInGame(session.players), session.currentIndex - 1)
  return standings[team]?.rank
}
