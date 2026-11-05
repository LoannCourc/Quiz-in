import { SCORES_TOP_COUNT } from './constants'
import { rankBarColorIndex, sortedRankingPlayers } from './interimRanking'
import { previousRanks } from './ranking'
import type { Player, PlayerId, PublicSession } from './types'

// Classement du téléphone entre deux questions (version C, « ta place en vedette ») : le top 5 et la place du joueur.
// Mêmes rangs, mouvements et couleurs que le classement de la TV (shared/interimRanking.ts).

export interface PhoneRankRow {
  id: PlayerId
  player: Player
  // Part du score du 1er, de 0 à 1.
  share: number
  // Places gagnées (positif) ou perdues (négatif) ; null : premier classement.
  movement: number | null
  colorIndex: number
  isMe: boolean
}

export type MyStanding =
  // Seul en tête : avance sur le 2e (null s'il n'y a personne d'autre).
  | { kind: 'leader'; lead: { name: string; points: number } | null }
  | { kind: 'tied'; withName: string }
  | { kind: 'behind'; gap: number; leaderName: string; share: number }

export interface MyPlace {
  player: Player
  rank: number
  previousRank: number
  score: number
  previousScore: number
  movement: number | null
  standing: MyStanding
}

export interface PhoneRanking {
  // Les 5 premiers, ou tout le monde à 5 joueurs ou moins.
  rows: PhoneRankRow[]
  // Le joueur, s'il est hors du top 5 : après les points de suspension.
  myRowOutside: PhoneRankRow | null
  // Joueurs non affichés (« et N autres ») ; 0 si le joueur est hors du top 5 (sa ligne ferme la liste).
  othersCount: number
  // Plus de 5 joueurs : le libellé « Le top 5 » a un sens.
  isTopFive: boolean
  // null : pas dans la partie.
  me: MyPlace | null
}

type RankingSession = Pick<PublicSession, 'players' | 'reveal' | 'currentIndex'>

function standingOf(uid: PlayerId, sorted: readonly [PlayerId, Player][]): MyStanding {
  const me = sorted.find(([id]) => id === uid)?.[1] as Player
  const myScore = me.score ?? 0
  const tied = sorted.find(([id, player]) => id !== uid && player.rank === me.rank)
  if (tied) return { kind: 'tied', withName: tied[1].name }
  const [, leader] = sorted[0]
  if (me.rank === 1) {
    const second = sorted[1]?.[1]
    return { kind: 'leader', lead: second ? { name: second.name, points: myScore - (second.score ?? 0) } : null }
  }
  const leaderScore = leader.score ?? 0
  return { kind: 'behind', gap: leaderScore - myScore, leaderName: leader.name, share: leaderScore > 0 ? Math.min(1, Math.max(0, myScore / leaderScore)) : 0 }
}

export function phoneRanking(session: RankingSession, uid: PlayerId): PhoneRanking {
  const sorted = sortedRankingPlayers(session.players)
  const before = previousRanks(session)
  const isFirstRanking = session.currentIndex === 0
  const topScore = sorted[0]?.[1].score ?? 0
  const toRow = ([id, player]: [PlayerId, Player]): PhoneRankRow => ({
    id,
    player,
    share: topScore > 0 ? Math.min(1, Math.max(0, (player.score ?? 0) / topScore)) : 0,
    movement: isFirstRanking ? null : before[id] - player.rank,
    colorIndex: rankBarColorIndex(session.players, id),
    isMe: id === uid,
  })
  const rows = sorted.slice(0, SCORES_TOP_COUNT).map(toRow)
  const position = sorted.findIndex(([id]) => id === uid)
  const isOutside = position >= SCORES_TOP_COUNT
  const myEntry = position >= 0 ? sorted[position] : null
  let me: MyPlace | null = null
  if (myEntry) {
    const [, player] = myEntry
    const score = player.score ?? 0
    me = {
      player,
      rank: player.rank,
      previousRank: isFirstRanking ? player.rank : before[uid],
      score,
      previousScore: score - (session.reveal?.results?.[uid]?.points ?? 0),
      movement: isFirstRanking ? null : before[uid] - player.rank,
      standing: standingOf(uid, sorted),
    }
  }
  return {
    rows,
    myRowOutside: isOutside && myEntry ? toRow(myEntry) : null,
    othersCount: isOutside ? 0 : Math.max(0, sorted.length - SCORES_TOP_COUNT),
    isTopFive: sorted.length > SCORES_TOP_COUNT,
    me,
  }
}

// Hauteur des lignes : 58 si tout tient, réduite (jamais sous 30) plutôt que de faire défiler.
export const PHONE_RANK_ROW_MAX = 58
export const PHONE_RANK_ROW_MIN = 30

export function phoneRankRowHeight(available: number, rowCount: number, gap: number): number {
  if (rowCount <= 0) return PHONE_RANK_ROW_MAX
  const height = Math.floor((available - gap * (rowCount - 1)) / rowCount)
  return Math.min(PHONE_RANK_ROW_MAX, Math.max(PHONE_RANK_ROW_MIN, height))
}

// « 1er », « 2e » : le chiffre et son suffixe, affichés en deux tailles.
export function rankOrdinal(rank: number): { number: string; suffix: string } {
  return { number: String(rank), suffix: rank === 1 ? 'er' : 'e' }
}
