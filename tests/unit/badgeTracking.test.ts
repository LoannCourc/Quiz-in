import { describe, expect, test } from 'vitest'

import {
  createAnswerClock,
  finishedGameOf,
  halfIndex,
  isLastAtHalf,
  parseTrackedGame,
  trackSession,
  type TrackContext,
  type TrackedGame,
} from '../../shared/badgeTracking'
import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import type { GameStatus, PlayerResult, PublicSession, Reveal, SessionSettings } from '../../shared/types'

const ME = 'moi'
const DAY = '2026-10-23'

type Scores = Record<string, number>

function players(scores: Scores, teams?: Record<string, 'pink' | 'cyan'>): PublicSession['players'] {
  return Object.fromEntries(
    Object.entries(scores).map(([id, score]) => [id, { name: id, avatar: '🦊', score, rank: 1, connected: true, ...(teams?.[id] && { team: teams[id] }) }]),
  )
}

function session(overrides: Partial<PublicSession> & { status: GameStatus }): PublicSession {
  return {
    hostUid: 'hote',
    quizId: 'quiz-1',
    settings: DEFAULT_SESSION_SETTINGS,
    currentIndex: 0,
    questionCount: 10,
    phaseStartedAt: 5_000,
    phaseEndsAt: 0,
    players: players({ [ME]: 0, b: 0, c: 0 }),
    ...overrides,
  }
}

function reveal(results: Record<string, PlayerResult>, extra: Partial<Reveal> = {}): Reveal {
  return { correctAnswer: 'x', stats: {}, results, ...extra }
}

const context = (overrides: Partial<TrackContext> = {}): TrackContext => ({ code: 'ABCD', uid: ME, role: 'player', answerMs: () => null, ...overrides })

// Partie jouée question par question : pour chaque question, état QUESTION puis révélation.
interface Step {
  results?: Record<string, PlayerResult>
  scores?: Scores
  extra?: Partial<Reveal>
  base?: Partial<PublicSession>
}

function playGame(steps: Step[], options: { ctx?: TrackContext; questionCount?: number; base?: Partial<PublicSession>; start?: TrackedGame | null } = {}) {
  const ctx = options.ctx ?? context()
  const questionCount = options.questionCount ?? steps.length
  let tracked: TrackedGame | null = options.start ?? null
  steps.forEach((step, index) => {
    const common = { currentIndex: index, questionCount, ...options.base, ...step.base }
    tracked = trackSession(tracked, session({ status: 'question', ...common }), ctx)
    tracked = trackSession(
      tracked,
      session({ status: 'reveal', reveal: reveal(step.results ?? {}, step.extra), ...(step.scores && { players: players(step.scores) }), ...common }),
      ctx,
    )
  })
  return tracked as TrackedGame | null
}

const right = { correct: true, points: 100 }
const wrong = { correct: false, points: 0 }
const allRight = (n: number): Step[] => Array.from({ length: n }, () => ({ results: { [ME]: right } }))

function end(tracked: TrackedGame | null, overrides: Partial<PublicSession> = {}, ctx = context()) {
  return finishedGameOf(tracked, session({ status: 'ended', phaseStartedAt: 9_000, ...overrides }), { code: ctx.code, uid: ctx.uid, localDay: DAY })
}

describe('Suivi : partie terminée ou non', () => {
  test('dernière révélation vue puis écran de fin : partie terminée', () => {
    const finished = end(playGame(allRight(10)), { players: players({ [ME]: 1000, b: 200, c: 0 }) })
    expect(finished).toMatchObject({ gameKey: 'ABCD:9000', role: 'player', game: 'quiz', playerCount: 3, questionCount: 10, localDay: DAY })
    expect(finished?.outcome).toMatchObject({ won: true, perfect: true })
  })

  test('« Terminer la partie » avant la dernière révélation : rien (abandon)', () => {
    expect(end(playGame(allRight(7), { questionCount: 10 }))).toBeNull()
  })

  test('« Terminer la partie » pendant la dernière révélation : comptée (toutes les questions jouées)', () => {
    expect(end(playGame(allRight(10)))).not.toBeNull()
  })

  test('arrivé seulement sur l’écran de fin (aucune partie suivie) : rien', () => {
    expect(end(null)).toBeNull()
    expect(trackSession(null, session({ status: 'ended' }), context())).toBeNull()
  })

  test('retour au salon (Changer de jeu) : plus de partie suivie', () => {
    expect(trackSession(playGame(allRight(3)), session({ status: 'lobby' }), context())).toBeNull()
  })

  test('nouvelle partie avec le même code, app relancée sans voir le salon : repart de zéro', () => {
    const old = playGame(allRight(10))
    const next = trackSession(old, session({ status: 'question', currentIndex: 0 }), context())
    expect(next?.revealed).toEqual([])
  })

  test('aucun changement : même objet (rien à écrire)', () => {
    const tracked = playGame(allRight(2), { questionCount: 10 })
    const same = session({ status: 'reveal', currentIndex: 1, reveal: reveal({ [ME]: right }) })
    expect(trackSession(tracked, same, context())).toBe(tracked)
  })

  test('joueur absent de la partie à la fin : rien', () => {
    expect(end(playGame(allRight(10)), { players: players({ b: 0, c: 0 }) })).toBeNull()
  })

  test('autre code : rien', () => {
    expect(end(playGame(allRight(10)), {}, context({ code: 'ZZZZ' }))).toBeNull()
  })
})

describe('Suivi : victoire', () => {
  test('égalité au premier rang : victoire ; deuxième : défaite', () => {
    const tracked = playGame(allRight(10))
    expect(end(tracked, { players: players({ [ME]: 500, b: 500, c: 0 }) })?.outcome?.won).toBe(true)
    expect(end(tracked, { players: players({ [ME]: 400, b: 500, c: 0 }) })?.outcome?.won).toBe(false)
  })

  test('Groupe : mon équipe première (égalité comprise)', () => {
    const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, teams: true }
    const tracked = playGame(allRight(10), { base: { settings } })
    const teamPlayers = players({ [ME]: 0, b: 900, c: 0 }, { [ME]: 'pink', b: 'cyan', c: 'pink' })
    expect(end(tracked, { settings, players: teamPlayers, teams: { pink: { score: 10, rank: 1 }, cyan: { score: 10, rank: 1 } } })?.outcome?.won).toBe(true)
    expect(end(tracked, { settings, players: teamPlayers, teams: { pink: { score: 5, rank: 2 }, cyan: { score: 10, rank: 1 } } })?.outcome?.won).toBe(false)
  })
})

describe('Suivi : Sans faute', () => {
  test('Quiz de 10 questions toutes justes : oui ; une fausse : non', () => {
    expect(end(playGame(allRight(10)))?.outcome?.perfect).toBe(true)
    const oneWrong = allRight(10)
    oneWrong[4] = { results: { [ME]: wrong } }
    expect(end(playGame(oneWrong))?.outcome?.perfect).toBe(false)
  })

  test('moins de 10 questions, réponse à moitié juste, question sans réponse : non', () => {
    expect(end(playGame(allRight(9)))?.outcome?.perfect).toBe(false)
    const partial = allRight(10)
    partial[0] = { results: { [ME]: { correct: true, points: 50, partial: true } } }
    expect(end(playGame(partial))?.outcome?.perfect).toBe(false)
    const missing = allRight(10)
    missing[2] = { results: {} }
    expect(end(playGame(missing))?.outcome?.perfect).toBe(false)
  })

  test('révélation manquée (app tuée) : non, même si tout le reste est juste', () => {
    const steps = allRight(10)
    const before = playGame(steps.slice(0, 4), { questionCount: 10 })
    const after = steps.slice(5).reduce<TrackedGame | null>((tracked, step, offset) => {
      const index = 5 + offset
      return trackSession(tracked, session({ status: 'reveal', currentIndex: index, reveal: reveal(step.results ?? {}) }), context())
    }, before)
    expect(end(after)?.outcome?.perfect).toBe(false)
  })

  test('Blind test (extrait publié) : jamais Sans faute ni Marathon', () => {
    const steps = allRight(10).map((step) => ({ ...step, extra: { music: { title: 't', artist: 'a', source: 'deezer' as const } } }))
    const finished = end(playGame(steps))
    expect(finished?.game).toBe('blindTest')
    expect(finished?.outcome?.perfect).toBe(false)
  })
})

describe('Suivi : Comeback', () => {
  test('moitié = 5e question sur 10, 4e manche sur 8', () => {
    expect(halfIndex(10)).toBe(4)
    expect(halfIndex(8)).toBe(3)
    expect(halfIndex(7)).toBe(3)
  })

  test('dernier : score le plus bas, égalité comprise, sauf si tout le monde est à égalité', () => {
    expect(isLastAtHalf(players({ [ME]: 0, b: 0, c: 300 }), ME)).toBe(true)
    expect(isLastAtHalf(players({ [ME]: 0, b: 0, c: 0 }), ME)).toBe(false)
    expect(isLastAtHalf(players({ [ME]: 100, b: 0, c: 300 }), ME)).toBe(false)
    expect(isLastAtHalf(players({ [ME]: 0, b: 300 }), ME)).toBe(false)
  })

  function comebackGame(halfScores: Scores) {
    const steps: Step[] = allRight(10)
    steps[4] = { results: { [ME]: wrong }, scores: halfScores }
    return playGame(steps)
  }

  test('dernier à la moitié puis premier : Comeback', () => {
    const finished = end(comebackGame({ [ME]: 0, b: 400, c: 300 }), { players: players({ [ME]: 900, b: 800, c: 300 }) })
    expect(finished?.outcome).toMatchObject({ won: true, comeback: true })
  })

  test('dernier à la moitié mais pas premier, ou pas dernier : non', () => {
    expect(end(comebackGame({ [ME]: 0, b: 400, c: 300 }), { players: players({ [ME]: 700, b: 800, c: 300 }) })?.outcome?.comeback).toBe(false)
    expect(end(comebackGame({ [ME]: 350, b: 400, c: 300 }), { players: players({ [ME]: 900, b: 800, c: 300 }) })?.outcome?.comeback).toBe(false)
  })

  test('Groupe : jamais', () => {
    const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, teams: true }
    const steps: Step[] = allRight(10)
    steps[4] = { results: {}, scores: { [ME]: 0, b: 400, c: 300 } }
    const tracked = playGame(steps, { base: { settings } })
    const teamPlayers = players({ [ME]: 0, b: 0, c: 0 }, { [ME]: 'pink', b: 'cyan', c: 'cyan' })
    expect(end(tracked, { settings, players: teamPlayers, teams: { pink: { score: 9, rank: 1 }, cyan: { score: 1, rank: 2 } } })?.outcome?.comeback).toBe(false)
  })
})

describe('Suivi : réponse rapide, Bluff, Dessine-moi', () => {
  test('meilleur temps des bonnes réponses seulement, mesuré sur le téléphone', () => {
    const times: Record<number, number> = { 0: 1500, 1: 2500, 2: 4000 }
    const steps: Step[] = [{ results: { [ME]: wrong } }, { results: { [ME]: right } }, { results: { [ME]: right } }]
    const finished = end(playGame(steps, { ctx: context({ answerMs: (index) => times[index] ?? null }) }))
    expect(finished?.outcome?.fastestCorrectMs).toBe(2500)
  })

  test('Bluff et Dessine-moi : pas de réponse rapide', () => {
    const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, answerMode: 'bluff' }
    const finished = end(playGame([{ results: { [ME]: right } }], { base: { settings }, ctx: context({ answerMs: () => 100 }) }))
    expect(finished?.game).toBe('bluff')
    expect(finished?.outcome?.fastestCorrectMs).toBeNull()
  })

  test('Bluff : votants de ma fausse réponse, moi exclu, plusieurs auteurs', () => {
    const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, answerMode: 'bluff' }
    const bluffChoices = [
      { text: 'vraie', kind: 'truth', voters: ['b'] },
      { text: 'la mienne', kind: 'player', authors: [ME, 'c'], voters: ['b', 'd'] },
      { text: 'leurre', kind: 'decoy', voters: [ME] },
    ]
    const step: Step = { results: {}, extra: { stats: { bluffChoices } } as unknown as Partial<Reveal> }
    expect(end(playGame([step, step], { base: { settings } }))?.outcome?.bluffFooled).toBe(4)
  })

  test('Dessine-moi : devineurs qui ont trouvé mon dessin ; manche annulée ou dessin d’un autre : 0', () => {
    const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, answerMode: 'draw' }
    const turn = (drawer: string) => ({ drawTurn: { drawer, round: 0, wordLength: 4, category: 'animal' } })
    const steps: Step[] = [
      { base: turn(ME), results: { [ME]: right, b: right, c: right, d: wrong } },
      { base: turn('b'), results: { b: right, [ME]: right } },
      { base: turn(ME), results: {}, extra: { stats: { drawCancelled: true } } },
    ]
    const finished = end(playGame(steps, { base: { settings } }))
    expect(finished?.game).toBe('draw')
    expect(finished?.outcome?.drawGuessed).toBe(2)
  })
})

describe('Suivi : hôte qui ne joue pas (organisateur)', () => {
  test('partie terminée sans résultat de joueur', () => {
    const ctx = context({ uid: 'hote', role: 'organizer' })
    const finished = end(playGame(allRight(10), { ctx }), {}, ctx)
    expect(finished).toMatchObject({ role: 'organizer', playerCount: 3 })
    expect(finished?.outcome).toBeUndefined()
  })

  test('changement de rôle (« Je joue aussi » au salon de la partie suivante) : nouvelle partie suivie', () => {
    const asOrganizer = playGame(allRight(3), { ctx: context({ role: 'organizer' }), questionCount: 10 })
    const asPlayer = trackSession(asOrganizer, session({ status: 'question', currentIndex: 3 }), context())
    expect(asPlayer?.role).toBe('player')
    expect(asPlayer?.revealed).toEqual([])
  })
})

describe('Suivi : stockage et chronomètre', () => {
  test('aller-retour JSON ; données illisibles ou autre version : null', () => {
    const tracked = playGame(allRight(4), { questionCount: 10 })
    expect(parseTrackedGame(JSON.parse(JSON.stringify(tracked)))).toEqual(tracked)
    expect(parseTrackedGame({ ...tracked, v: 99 })).toBeNull()
    expect(parseTrackedGame({ ...tracked, revealed: 'tout' })).toBeNull()
    expect(parseTrackedGame(null)).toBeNull()
  })

  test('chronomètre : premier affichage, dernier appui', () => {
    let now = 0
    const clock = createAnswerClock(() => now)
    expect(clock.answerMs('ABCD', 0)).toBeNull()
    clock.questionShown('ABCD', 0)
    now = 800
    clock.questionShown('ABCD', 0)
    now = 1200
    clock.answerGiven('ABCD', 0)
    expect(clock.answerMs('ABCD', 0)).toBe(1200)
    now = 3000
    clock.answerGiven('ABCD', 0)
    expect(clock.answerMs('ABCD', 0)).toBe(3000)
    expect(clock.answerMs('WXYZ', 0)).toBeNull()
  })

  test('chronomètre : appui sans affichage noté (app relancée en pleine question) : rien', () => {
    const clock = createAnswerClock(() => 0)
    clock.answerGiven('ABCD', 3)
    expect(clock.answerMs('ABCD', 3)).toBeNull()
  })
})
