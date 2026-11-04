import { describe, expect, test } from 'vitest'

import { bluffTrappers } from '../../shared/bluff'
import { hostWaitBannerAt } from '../../shared/gameFlow'
import { HOST_WAIT_BANNER_DELAY_MS } from '../../shared/constants'
import { interimRanking, RANK_BAR_COLOR_COUNT } from '../../shared/interimRanking'
import { computeRanks, previousRanks } from '../../shared/ranking'
import { voteShares } from '../../shared/revealGauge'
import type { Player, PlayerResult, PublicSession } from '../../shared/types'

// Partie où chacun a ces scores après la question et a gagné ces points à la question.
function session(scores: Record<string, number>, points: Record<string, number>, currentIndex = 3) {
  const ranks = computeRanks(scores)
  const players: Record<string, Player> = Object.fromEntries(
    Object.entries(scores).map(([id, score]) => [id, { name: id, avatar: '🦊', score, rank: ranks[id], connected: true }]),
  )
  const results: Record<string, PlayerResult> = Object.fromEntries(Object.entries(points).map(([id, p]) => [id, { correct: p > 0, points: p }]))
  return { players, currentIndex, reveal: { correctAnswer: 'x', stats: {}, results } } as Pick<PublicSession, 'players' | 'reveal' | 'currentIndex'>
}

describe('Rangs d’avant la dernière question', () => {
  test('score moins les points de la question ; absent des résultats : 0 point', () => {
    const game = session({ a: 300, b: 250, c: 200 }, { a: 200 })
    expect(previousRanks(game)).toEqual({ a: 3, b: 1, c: 2 })
  })
})

describe('Classement intermédiaire de la TV', () => {
  test('le 1er à part, les suivants avec leur part du score du 1er et leur mouvement', () => {
    const { leader, rows, othersCount } = interimRanking(session({ a: 1000, b: 800, c: 500, d: 100 }, { b: 500, a: 0, c: 0, d: 0 }))
    expect(leader?.id).toBe('a')
    expect(leader?.status).toBe('holds')
    expect(rows.map((row) => row.id)).toEqual(['b', 'c', 'd'])
    expect(rows.map((row) => row.share)).toEqual([0.8, 0.5, 0.1])
    // b : 3e → 2e ; c : 2e → 3e ; d : inchangé.
    expect(rows.map((row) => row.movement)).toEqual([1, -1, 0])
    expect(othersCount).toBe(0)
  })

  test('nouveau 1er : « passe en tête »', () => {
    expect(interimRanking(session({ a: 500, b: 400 }, { a: 300, b: 0 })).leader?.status).toBe('takes')
  })

  test('1er seul après une égalité : « passe en tête »', () => {
    expect(interimRanking(session({ a: 500, b: 300 }, { a: 200, b: 0 })).leader?.status).toBe('takes')
  })

  test('égalité en tête : les deux au rang 1, le second dans les lignes', () => {
    const { leader, rows } = interimRanking(session({ a: 500, b: 500, c: 100 }, { a: 100, b: 0, c: 0 }))
    expect(leader?.status).toBe('tied')
    expect(rows[0].player.rank).toBe(1)
    expect(rows[0].share).toBe(1)
  })

  test('premier classement : aucun mouvement, le 1er n’est ni « reste » ni « passe »', () => {
    const { leader, rows } = interimRanking(session({ a: 200, b: 100 }, { a: 200, b: 100 }, 0))
    expect(leader?.status).toBe('first')
    expect(rows.map((row) => row.movement)).toEqual([null])
  })

  test('moins de 5 joueurs : autant de lignes que de joueurs ; plus de 5 : top 5 et le nombre des autres', () => {
    expect(interimRanking(session({ a: 3, b: 2 }, {})).rows).toHaveLength(1)
    const scores = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`p${index}`, 1000 - index]))
    const crowded = interimRanking(session(scores, {}))
    expect(crowded.rows).toHaveLength(4)
    expect(crowded.othersCount).toBe(7)
  })

  test('tout le monde à 0 : barres vides, sans division par zéro', () => {
    const { rows, leader } = interimRanking(session({ a: 0, b: 0 }, {}))
    expect(rows[0].share).toBe(0)
    expect(leader?.status).toBe('tied')
  })

  test('aucun joueur : rien à afficher', () => {
    expect(interimRanking(session({}, {}))).toEqual({ leader: null, rows: [], othersCount: 0 })
  })

  test('la couleur suit le joueur quand il change de rang', () => {
    const before = interimRanking(session({ a: 900, b: 500, c: 400 }, {}))
    const after = interimRanking(session({ a: 900, b: 500, c: 800 }, { c: 400 }))
    const colorOf = (ranking: typeof before, id: string) => ranking.rows.find((row) => row.id === id)?.colorIndex
    expect(colorOf(after, 'c')).toBe(colorOf(before, 'c'))
    expect(colorOf(after, 'b')).toBe(colorOf(before, 'b'))
    expect(colorOf(after, 'c')).toBeLessThan(RANK_BAR_COLOR_COUNT)
    expect(colorOf(after, 'b')).not.toBe(colorOf(after, 'c'))
  })
})

describe('Jauge des votes', () => {
  test('part de chaque proposition sur les joueurs qui ont répondu', () => {
    expect(voteShares([2, 1, 9, 0])).toEqual([2 / 12, 1 / 12, 9 / 12, 0])
  })

  test('personne n’a répondu : aucun remplissage', () => {
    expect(voteShares([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
  })
})

describe('Bluff : qui a piégé combien', () => {
  test('du plus au moins, jamais un leurre ni la vraie réponse, sans ceux qui n’ont piégé personne', () => {
    expect(
      bluffTrappers([
        { text: 'a', kind: 'bluff', authors: ['hugo'], voters: ['x'] },
        { text: 'b', kind: 'truth', voters: ['y', 'z', 'w'] },
        { text: 'c', kind: 'bluff', authors: ['lola'], voters: ['u', 'v'] },
        { text: 'd', kind: 'bluff', authors: ['emma'] },
        { text: 'e', kind: 'decoy', voters: ['t'] },
      ]),
    ).toEqual([
      { id: 'lola', trapped: 2 },
      { id: 'hugo', trapped: 1 },
    ])
  })

  test('même proposition écrite par deux joueurs : chacun crédité', () => {
    expect(bluffTrappers([{ text: 'a', kind: 'bluff', authors: ['a', 'b'], voters: ['c'] }])).toEqual([
      { id: 'a', trapped: 1 },
      { id: 'b', trapped: 1 },
    ])
  })
})

describe('Bandeau d’attente de l’hôte', () => {
  const stepByStep = { answerMode: 'choice', speedBonus: true, control: false, teams: false, stepByStep: true } as PublicSession['settings']

  test('Pas à pas, révélation et classement : après le délai depuis le début de la phase', () => {
    expect(hostWaitBannerAt({ status: 'reveal', settings: stepByStep, phaseStartedAt: 1000 })).toBe(1000 + HOST_WAIT_BANNER_DELAY_MS)
    expect(hostWaitBannerAt({ status: 'scores', settings: stepByStep, phaseStartedAt: 1000 })).toBe(1000 + HOST_WAIT_BANNER_DELAY_MS)
  })

  test('Bluff : l’attente commence quand la vraie réponse est montrée', () => {
    expect(hostWaitBannerAt({ status: 'reveal', settings: stepByStep, phaseStartedAt: 1000 }, 9000)).toBe(9000 + HOST_WAIT_BANNER_DELAY_MS)
  })

  test('jamais en automatique ni pendant une question', () => {
    expect(hostWaitBannerAt({ status: 'reveal', settings: { ...stepByStep, stepByStep: false }, phaseStartedAt: 1000 })).toBeNull()
    expect(hostWaitBannerAt({ status: 'question', settings: stepByStep, phaseStartedAt: 1000 })).toBeNull()
  })

  test('délai de 20 s', () => {
    expect(HOST_WAIT_BANNER_DELAY_MS).toBe(20_000)
  })
})
