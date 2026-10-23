import { describe, expect, test } from 'vitest'

import {
  ALL_BADGES,
  applyBadgeAction,
  applyFinishedGame,
  BADGE_SCHEMA_VERSION,
  emptyBadgeState,
  localDayOf,
  parseBadgeState,
  PROCESSED_GAMES_KEPT,
  tierReached,
  type BadgeGame,
  type BadgeState,
  type FinishedGame,
  type PlayerGameOutcome,
} from '../../shared/badges'

const OPEN: readonly BadgeGame[] = ['quiz', 'bluff', 'draw']
const NOW = 1_000

let nextKey = 0
function game(overrides: Partial<FinishedGame> = {}, outcome: Partial<PlayerGameOutcome> | null = {}): FinishedGame {
  return {
    gameKey: `ABCD:${++nextKey}`,
    role: 'player',
    game: 'quiz',
    playerCount: 4,
    questionCount: 10,
    localDay: '2026-10-23',
    ...(outcome && {
      outcome: { won: false, perfect: false, comeback: false, fastestCorrectMs: null, bluffFooled: 0, drawGuessed: 0, ...outcome },
    }),
    ...overrides,
  }
}

function play(games: FinishedGame[], openGames: readonly BadgeGame[] = OPEN, start: BadgeState = emptyBadgeState()) {
  let state = start
  const unlocked: string[] = []
  for (const finished of games) {
    const update = applyFinishedGame(state, finished, openGames, NOW)
    state = update.state
    unlocked.push(...update.unlocked)
  }
  return { state, unlocked }
}

const wins = (n: number) => Array.from({ length: n }, () => game({}, { won: true }))
const losses = (n: number) => Array.from({ length: n }, () => game({}, { won: false }))

describe('Badges : catalogue', () => {
  test('39 badges, identifiants uniques', () => {
    expect(ALL_BADGES).toHaveLength(39)
    expect(new Set(ALL_BADGES).size).toBe(39)
  })
})

describe('Badges : parties jouées, victoires, défaites', () => {
  test('paliers 5 / 20 / 100 des parties jouées', () => {
    expect(play(losses(4)).unlocked).not.toContain('played.1')
    const { state, unlocked } = play(losses(20))
    expect(unlocked).toEqual(expect.arrayContaining(['played.1', 'played.2', 'losses.1', 'losses.2']))
    expect(state.counters.completed).toBe(20)
    expect(tierReached(state.counters, 'played', OPEN)).toBe(2)
  })

  test('victoire (égalité au premier rang comprise, décidée par le suivi) et défaite comptées à part', () => {
    const { state } = play([...wins(3), ...losses(2)])
    expect(state.counters).toMatchObject({ completed: 5, wins: 3, losses: 2 })
  })

  test('un badge débloqué n’est jamais renvoyé une seconde fois', () => {
    const { unlocked } = play(losses(30))
    expect(unlocked.filter((id) => id === 'played.1')).toHaveLength(1)
  })
})

describe('Badges : série de victoires', () => {
  test('3 victoires d’affilée : palier 1 ; une défaite remet la série à zéro', () => {
    const { state, unlocked } = play([...wins(2), ...losses(1), ...wins(2)])
    expect(state.counters.winStreak).toBe(2)
    expect(state.counters.bestWinStreak).toBe(2)
    expect(unlocked).not.toContain('winStreak.1')
    expect(play(wins(3)).unlocked).toContain('winStreak.1')
  })

  test('meilleure série gardée après une défaite : 5 puis défaite → palier 2 acquis', () => {
    const { state, unlocked } = play([...wins(5), ...losses(1)])
    expect(state.counters.winStreak).toBe(0)
    expect(state.counters.bestWinStreak).toBe(5)
    expect(unlocked).toEqual(expect.arrayContaining(['winStreak.1', 'winStreak.2']))
  })

  test('partie abandonnée : jamais transmise (le suivi ne produit rien), la série continue', () => {
    // Une partie non terminée n'appelle pas applyFinishedGame : 2 victoires, (abandon), 1 victoire = série de 3.
    expect(play(wins(3)).state.counters.winStreak).toBe(3)
  })

  test('organisateur : la série n’est pas touchée', () => {
    const { state } = play([...wins(2), game({ role: 'organizer' }, null), ...wins(1)])
    expect(state.counters.winStreak).toBe(3)
  })
})

describe('Badges : jours différents (Fidèle)', () => {
  test('même jour compté une fois ; 3 jours différents → palier 1', () => {
    const { state, unlocked } = play([
      game({ localDay: '2026-10-23' }),
      game({ localDay: '2026-10-23' }),
      game({ localDay: '2026-10-24' }),
      game({ localDay: '2026-11-02' }),
    ])
    expect(state.counters.playedDays).toEqual(['2026-10-23', '2026-10-24', '2026-11-02'])
    expect(unlocked).toContain('loyal.1')
  })

  test('jour local du téléphone : 23 h 59 et 0 h 01 sont deux jours', () => {
    expect(localDayOf(new Date(2026, 11, 24, 23, 59))).toBe('2026-12-24')
    expect(localDayOf(new Date(2026, 11, 25, 0, 1))).toBe('2026-12-25')
  })

  test('30 jours au plus gardés : palier 3', () => {
    const days = Array.from({ length: 35 }, (_, i) => localDayOf(new Date(2026, 0, 1 + i)))
    const { state, unlocked } = play(days.map((localDay) => game({ localDay })))
    expect(state.counters.playedDays).toHaveLength(30)
    expect(unlocked).toContain('loyal.3')
  })
})

describe('Badges : organisateur (hôte qui ne joue pas)', () => {
  test('Parties jouées, Joueurs réunis, Touche-à-tout, Fidèle seulement', () => {
    const organizer = (overrides: Partial<FinishedGame>) => game({ role: 'organizer', playerCount: 15, localDay: '2026-12-25', ...overrides }, null)
    const { state, unlocked } = play([organizer({ game: 'quiz' }), organizer({ game: 'bluff', localDay: '2026-12-26' }), organizer({ game: 'draw', questionCount: 30, localDay: '2026-12-27' })])
    expect(state.counters).toMatchObject({ completed: 3, wins: 0, losses: 0, winStreak: 0, christmas: 0, maxQuizQuestions: 0 })
    expect(unlocked).toEqual(expect.arrayContaining(['gathering.3', 'allRounder.1', 'loyal.1']))
    expect(unlocked).not.toContain('christmas')
    expect(unlocked).not.toContain('marathon.1')
  })

  test('un résultat de joueur transmis par erreur avec le rôle organisateur est ignoré', () => {
    const { state } = play([game({ role: 'organizer' }, { won: true, perfect: true })])
    expect(state.counters).toMatchObject({ wins: 0, perfect: 0 })
  })
})

describe('Badges : Touche-à-tout (jeux ouverts)', () => {
  const each = (games: BadgeGame[]) => games.map((g) => game({ game: g }))

  test('une partie de chacun des jeux ouverts → palier 1', () => {
    expect(play(each(['quiz', 'bluff'])).unlocked).not.toContain('allRounder.1')
    expect(play(each(['quiz', 'bluff', 'draw'])).unlocked).toContain('allRounder.1')
  })

  test('un jeu ouvert plus tard : badge déjà débloqué gardé, palier suivant exige aussi le nouveau jeu', () => {
    const first = play(each(['quiz', 'bluff', 'draw']))
    const tenEach = Array.from({ length: 9 }, () => each(['quiz', 'bluff', 'draw'])).flat()
    const withNewGame: readonly BadgeGame[] = [...OPEN, 'blindTest']
    const later = play(tenEach, withNewGame, first.state)
    expect(later.state.unlocked['allRounder.1']).toBe(NOW)
    expect(later.unlocked).not.toContain('allRounder.2')
    expect(tierReached(later.state.counters, 'allRounder', OPEN)).toBe(2)
  })
})

describe('Badges : Marathon, réponse rapide, Bluff, Dessine-moi', () => {
  test('Marathon : Quiz seulement, plus grand nombre de questions terminé', () => {
    const { state, unlocked } = play([game({ questionCount: 20 }), game({ game: 'bluff', questionCount: 30 })])
    expect(state.counters.maxQuizQuestions).toBe(20)
    expect(unlocked).toEqual(expect.arrayContaining(['marathon.1', 'marathon.2']))
    expect(unlocked).not.toContain('marathon.3')
  })

  test('Rapide comme l’éclair : strictement sous 5 s / 3 s / 2 s', () => {
    expect(play([game({}, { fastestCorrectMs: 5000 })]).unlocked).not.toContain('lightning.1')
    const { state, unlocked } = play([game({}, { fastestCorrectMs: 2900 }), game({}, { fastestCorrectMs: null })])
    expect(state.counters.fastestCorrectMs).toBe(2900)
    expect(unlocked).toEqual(expect.arrayContaining(['lightning.1', 'lightning.2']))
    expect(play([game({}, { fastestCorrectMs: 1999 })]).unlocked).toContain('lightning.3')
  })

  test('Menteur ultime et Artiste : cumul', () => {
    const { state, unlocked } = play([game({ game: 'bluff' }, { bluffFooled: 6 }), game({ game: 'bluff' }, { bluffFooled: 5 }), game({ game: 'draw' }, { drawGuessed: 30 })])
    expect(state.counters).toMatchObject({ bluffFooled: 11, drawGuessed: 30 })
    expect(unlocked).toEqual(expect.arrayContaining(['liar.1', 'artist.1', 'artist.2']))
  })

  test('Joueurs réunis : plus grande partie terminée', () => {
    expect(play([game({ playerCount: 10 })]).unlocked).toEqual(expect.arrayContaining(['gathering.1', 'gathering.2']))
  })
})

describe('Badges uniques', () => {
  test('Sans faute et Comeback viennent du suivi de la partie', () => {
    expect(play([game({}, { perfect: true, comeback: true, won: true })]).unlocked).toEqual(expect.arrayContaining(['perfect', 'comeback']))
  })

  test('Noël : 24 ou 25 décembre ; Réveillon : 31 décembre ou 1er janvier (date locale)', () => {
    expect(play([game({ localDay: '2026-12-24' })]).unlocked).toContain('christmas')
    expect(play([game({ localDay: '2026-12-25' })]).unlocked).toContain('christmas')
    expect(play([game({ localDay: '2026-12-26' })]).unlocked).not.toContain('christmas')
    expect(play([game({ localDay: '2026-12-31' })]).unlocked).toContain('newYear')
    expect(play([game({ localDay: '2027-01-01' })]).unlocked).toContain('newYear')
    expect(play([game({ localDay: '2027-01-02' })]).unlocked).not.toContain('newYear')
  })

  test('Partager et Noter : débloqués à la première action, jamais répétés', () => {
    const first = applyBadgeAction(emptyBadgeState(), 'share', OPEN, NOW)
    expect(first.unlocked).toEqual(['share'])
    expect(applyBadgeAction(first.state, 'share', OPEN, NOW).unlocked).toEqual([])
    expect(applyBadgeAction(first.state, 'rate', OPEN, NOW).unlocked).toEqual(['rate'])
  })
})

describe('Badges : doubles comptes', () => {
  test('même partie transmise deux fois (écran de fin rechargé) : comptée une fois', () => {
    const finished = game({}, { won: true })
    const { state } = play([finished, finished, { ...finished }])
    expect(state.counters).toMatchObject({ completed: 1, wins: 1 })
  })

  test('même code après « Changer de jeu » : autre heure de fin, deux parties', () => {
    const { state } = play([game({ gameKey: 'ABCD:100' }), game({ gameKey: 'ABCD:200' })])
    expect(state.counters.completed).toBe(2)
  })

  test('les dernières parties seulement sont gardées', () => {
    const { state } = play(losses(PROCESSED_GAMES_KEPT + 5))
    expect(state.processed).toHaveLength(PROCESSED_GAMES_KEPT)
  })
})

describe('Badges : stockage et version', () => {
  test('aller-retour JSON sans perte', () => {
    const { state } = play([...wins(6), game({ localDay: '2026-12-31' }, { fastestCorrectMs: 1500 })])
    const parsed = parseBadgeState(JSON.parse(JSON.stringify(state)))
    expect(parsed).toEqual({ state, writable: true })
  })

  test('données absentes ou illisibles : état vide, sans erreur', () => {
    expect(parseBadgeState(null)).toEqual({ state: emptyBadgeState(), writable: true })
    expect(parseBadgeState('n’importe quoi')).toEqual({ state: emptyBadgeState(), writable: true })
    const parsed = parseBadgeState({ v: 1, counters: { completed: -3, wins: 'deux', playedDays: ['2026-10-23', 'hier', 4] }, unlocked: { 'played.1': 5, inconnu: 3 } })
    expect(parsed.state.counters).toMatchObject({ completed: 0, wins: 0, playedDays: ['2026-10-23'] })
    expect(parsed.state.unlocked).toEqual({ 'played.1': 5 })
  })

  test('version plus récente (retour à une ancienne app) : lue, jamais réécrite', () => {
    const parsed = parseBadgeState({ v: BADGE_SCHEMA_VERSION + 1, counters: { completed: 7 }, unlocked: {} })
    expect(parsed.writable).toBe(false)
    expect(parsed.state.counters.completed).toBe(7)
  })
})
