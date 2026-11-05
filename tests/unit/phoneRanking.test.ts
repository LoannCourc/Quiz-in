import { describe, expect, test } from 'vitest'

import { interimRanking } from '../../shared/interimRanking'
import { phoneRanking, phoneRankRowHeight, PHONE_RANK_ROW_MAX, PHONE_RANK_ROW_MIN, rankOrdinal } from '../../shared/phoneRanking'
import { computeRanks } from '../../shared/ranking'
import type { Player, PlayerResult, PublicSession } from '../../shared/types'

// Partie à l'instant du classement : scores actuels, points de la dernière question.
function game(scores: Record<string, number>, points: Record<string, number> = {}, currentIndex = 2) {
  const ranks = computeRanks(scores)
  const players = Object.fromEntries(Object.entries(scores).map(([id, score]): [string, Player] => [id, { name: id.toUpperCase(), avatar: '🦊', score, rank: ranks[id], connected: true }]))
  const results = Object.fromEntries(Object.entries(points).map(([id, value]): [string, PlayerResult] => [id, { correct: true, points: value }]))
  return { players, currentIndex, reveal: { correctAnswer: 'x', stats: {}, results } } as Pick<PublicSession, 'players' | 'reveal' | 'currentIndex'>
}

describe('Classement du téléphone : ta place', () => {
  test('2e, à 60 points du 1er, a gagné une place : score d’avant, barre, mouvement', () => {
    const { me } = phoneRanking(game({ a: 1240, moi: 1180, c: 960 }, { moi: 300 }), 'moi')
    expect(me).toMatchObject({ rank: 2, score: 1180, previousScore: 880, previousRank: 3, movement: 1 })
    expect(me?.standing).toEqual({ kind: 'behind', gap: 60, leaderName: 'A', share: 1180 / 1240 })
  })

  test('1er : en tête, avance sur le 2e, pas de barre', () => {
    expect(phoneRanking(game({ moi: 1300, b: 1000 }), 'moi').me?.standing).toEqual({ kind: 'leader', lead: { name: 'B', points: 300 } })
    expect(phoneRanking(game({ moi: 1300 }), 'moi').me?.standing).toEqual({ kind: 'leader', lead: null })
  })

  test('égalité : à égalité avec un autre joueur, en tête ou plus bas', () => {
    expect(phoneRanking(game({ moi: 1000, b: 1000, c: 500 }), 'moi').me?.standing).toEqual({ kind: 'tied', withName: 'B' })
    expect(phoneRanking(game({ a: 2000, b: 1000, moi: 1000 }), 'moi').me?.standing).toEqual({ kind: 'tied', withName: 'B' })
  })

  test('descente : mouvement négatif ; inchangé : 0', () => {
    expect(phoneRanking(game({ a: 2000, moi: 1000 }, { a: 1500 }), 'moi').me?.movement).toBe(-1)
    expect(phoneRanking(game({ a: 2000, moi: 1000 }, { a: 100, moi: 100 }), 'moi').me?.movement).toBe(0)
  })

  test('premier classement : pas de mouvement, place d’avant = place actuelle', () => {
    const { me, rows } = phoneRanking(game({ a: 500, moi: 300 }, { a: 500, moi: 300 }, 0), 'moi')
    expect(me?.movement).toBeNull()
    expect(me?.previousRank).toBe(2)
    expect(rows[0].movement).toBeNull()
  })

  test('ordinal', () => {
    expect(rankOrdinal(1)).toEqual({ number: '1', suffix: 'er' })
    expect(rankOrdinal(2)).toEqual({ number: '2', suffix: 'e' })
  })
})

describe('Classement du téléphone : le top 5', () => {
  const seven = { a: 700, b: 600, c: 500, d: 400, e: 300, f: 200, moi: 100 }

  test('5 joueurs ou moins : tout le monde, sans « top 5 » ni « et N autres »', () => {
    const ranking = phoneRanking(game({ a: 5, b: 4, c: 3, d: 2, moi: 1 }), 'moi')
    expect(ranking.rows).toHaveLength(5)
    expect(ranking).toMatchObject({ isTopFive: false, othersCount: 0, myRowOutside: null })
  })

  test('hors du top 5 : les 5 premiers, puis ta ligne avec ton vrai rang, sans « et N autres »', () => {
    const ranking = phoneRanking(game(seven), 'moi')
    expect(ranking.rows.map((row) => row.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(ranking.myRowOutside?.player.rank).toBe(7)
    expect(ranking.myRowOutside?.isMe).toBe(true)
    expect(ranking).toMatchObject({ isTopFive: true, othersCount: 0 })
  })

  test('dans le top 5 avec plus de 5 joueurs : « et N autres », ta ligne repérée', () => {
    const ranking = phoneRanking(game(seven), 'c')
    expect(ranking.othersCount).toBe(2)
    expect(ranking.myRowOutside).toBeNull()
    expect(ranking.rows.filter((row) => row.isMe).map((row) => row.id)).toEqual(['c'])
  })

  test('mêmes rangs, mouvements et couleurs que le classement de la TV', () => {
    const session = game({ a: 1000, b: 900, c: 800, d: 700 }, { d: 500, b: 50 })
    const tv = interimRanking(session)
    const phone = phoneRanking(session, 'a')
    for (const row of tv.rows) {
      expect(phone.rows.find((other) => other.id === row.id)).toMatchObject({ movement: row.movement, colorIndex: row.colorIndex, share: row.share })
    }
  })

  test('pas dans la partie : la liste seule', () => {
    expect(phoneRanking(game(seven), 'absent').me).toBeNull()
  })
})

describe('Classement du téléphone : hauteur des lignes', () => {
  test('58 si tout tient, réduite sinon, jamais sous le minimum', () => {
    expect(phoneRankRowHeight(400, 5, 8)).toBe(PHONE_RANK_ROW_MAX)
    expect(phoneRankRowHeight(250, 5, 8)).toBe(43)
    expect(phoneRankRowHeight(100, 5, 8)).toBe(PHONE_RANK_ROW_MIN)
    expect(PHONE_RANK_ROW_MIN).toBe(30)
    expect(phoneRankRowHeight(0, 0, 8)).toBe(PHONE_RANK_ROW_MAX)
  })
})
