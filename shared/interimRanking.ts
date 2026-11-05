import { SCORES_TOP_COUNT } from './constants'
import { previousRanks } from './ranking'
import type { Player, PlayerId, PublicSession } from './types'

// Classement affiché entre deux questions sur la TV (maquette « 1er avec une couronne ») : le 1er sur sa carte,
// les suivants sur une barre, avec leur mouvement depuis la question précédente. Logique pure, sans écriture
// dans la base : les rangs d'avant viennent des scores moins les points de la dernière question.

// Couleurs des barres (theme.css, --rank-bar-0 à 5). Fixes pour un joueur pendant la partie, tant que la liste
// des joueurs ne change pas : la couleur le suit quand il monte ou descend.
export const RANK_BAR_COLOR_COUNT = 6

export type LeaderStatus =
  // Premier classement : pas de question précédente.
  | 'first'
  | 'holds'
  | 'takes'
  | 'tied'

export interface InterimLeader {
  id: PlayerId
  player: Player
  status: LeaderStatus
}

export interface InterimRow {
  id: PlayerId
  player: Player
  // Part du score du 1er, de 0 à 1.
  share: number
  // Places gagnées (positif) ou perdues (négatif) ; null : premier classement.
  movement: number | null
  colorIndex: number
}

export interface InterimRanking {
  leader: InterimLeader | null
  rows: InterimRow[]
  // Joueurs au-delà des 5 affichés.
  othersCount: number
}

type RankingSession = Pick<PublicSession, 'players' | 'reveal' | 'currentIndex'>

// Du 1er au dernier ; à rang égal, par nom. Commun à la TV et aux téléphones.
export function sortedRankingPlayers(players: Record<PlayerId, Player>): [PlayerId, Player][] {
  return Object.entries(players).sort(([, a], [, b]) => a.rank - b.rank || a.name.localeCompare(b.name, 'fr'))
}

function leaderStatus(leaderId: PlayerId, session: RankingSession, before: Record<PlayerId, number>): LeaderStatus {
  const leaders = Object.values(session.players).filter((player) => player.rank === 1)
  if (leaders.length > 1) return 'tied'
  if (session.currentIndex === 0) return 'first'
  const previousLeaders = Object.keys(before).filter((id) => before[id] === 1)
  return previousLeaders.length === 1 && previousLeaders[0] === leaderId ? 'holds' : 'takes'
}

export function rankBarColorIndex(players: Record<PlayerId, Player>, id: PlayerId): number {
  return Object.keys(players).sort().indexOf(id) % RANK_BAR_COLOR_COUNT
}

export function interimRanking(session: RankingSession): InterimRanking {
  const sorted = sortedRankingPlayers(session.players)
  const first = sorted[0]
  if (!first) return { leader: null, rows: [], othersCount: 0 }
  const before = previousRanks(session)
  const isFirstRanking = session.currentIndex === 0
  const topScore = first[1].score ?? 0
  const rows = sorted.slice(1, SCORES_TOP_COUNT).map(([id, player]) => ({
    id,
    player,
    share: topScore > 0 ? Math.min(1, Math.max(0, (player.score ?? 0) / topScore)) : 0,
    movement: isFirstRanking ? null : before[id] - player.rank,
    colorIndex: rankBarColorIndex(session.players, id),
  }))
  return {
    leader: { id: first[0], player: first[1], status: leaderStatus(first[0], session, before) },
    rows,
    othersCount: Math.max(0, sorted.length - SCORES_TOP_COUNT),
  }
}
