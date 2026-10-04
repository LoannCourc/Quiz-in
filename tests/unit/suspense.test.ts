import { describe, expect, test } from 'vitest'

import { DEFAULT_SESSION_SETTINGS, QUESTIONS_PER_GAME } from '../../shared/constants'
import { isAwaitingHost, nextPhase, nextQuestionCountdown } from '../../shared/gameFlow'
import {
  hostControls,
  nextDeadline,
  pauseUpdate,
  resumeUpdate,
  transitionUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import { estimateGameMinutes, estimateQuizMinutes } from '../../shared/quizCatalog'
import type { Session, SessionSettings } from '../../shared/types'
import { makeSession, QUESTIONS } from './engineFixtures'

const NOW = 2_000_000
const GAME = QUESTIONS.slice(0, 3)

function settings(overrides: Partial<SessionSettings>): SessionSettings {
  return { ...DEFAULT_SESSION_SETTINGS, ...overrides }
}

// Applique un update à plat (chemins de premier niveau seulement) : suffisant pour enchaîner les phases.
function apply(session: Session, update: SessionUpdate | null): Session {
  expect(update).not.toBeNull()
  const next: Record<string, unknown> = { ...session }
  for (const [path, value] of Object.entries(update as SessionUpdate)) {
    if (path.includes('/')) continue
    if (value === null) delete next[path]
    else next[path] = value
  }
  return next as unknown as Session
}

// Révélation de la question index, avec les réglages donnés.
function reveal(index: number, overrides: Partial<SessionSettings>): Session {
  const question = makeSession({
    status: 'question',
    currentIndex: index,
    questionCount: GAME.length,
    phaseStartedAt: NOW - 10_000,
    phaseEndsAt: NOW + 10_000,
    settings: settings(overrides),
    answers: { [index]: {} },
  })
  return apply(question, transitionUpdate(question, GAME, { status: 'question', currentIndex: index }, NOW))
}

function advance(session: Session, nowServer: number): Session {
  const expected = { status: session.status, currentIndex: session.currentIndex }
  return apply(session, transitionUpdate(session, GAME, expected, nowServer))
}

describe('Suspense : pas de classement en cours de partie', () => {
  test('la révélation mène directement à la question suivante, avec son timer', () => {
    expect(
      nextPhase('reveal', { answerMode: 'choice', currentIndex: 0, questionCount: 3, suspense: true }),
    ).toMatchObject({ status: 'question', currentIndex: 1 })
    const next = advance(reveal(0, { suspense: true }), NOW + 6_000)
    expect(next).toMatchObject({ status: 'question', currentIndex: 1 })
    expect(next.currentQuestion?.text).toBe(GAME[1].text)
    expect(next.phaseEndsAt).toBeGreaterThan(NOW + 6_000)
  })

  test('dernière question, Suspense seul : révélation, puis podium (fin de partie)', () => {
    expect(advance(reveal(2, { suspense: true }), NOW + 6_000).status).toBe('ended')
  })

  test('réglage désactivé : la révélation mène toujours au classement', () => {
    expect(advance(reveal(0, {}), NOW + 6_000).status).toBe('scores')
  })

  test('compte à rebours de la révélation : jusqu’à la question suivante (sans les 5 s du classement)', () => {
    const revealed = reveal(0, { suspense: true })
    expect(nextQuestionCountdown(revealed)).toMatchObject({ endsAt: revealed.phaseEndsAt })
  })

  test('« Passer » depuis la révélation : question suivante, ou classement final à la dernière', () => {
    expect(hostControls(reveal(0, { suspense: true })).skip).toBe('nextQuestion')
    expect(hostControls(reveal(2, { suspense: true })).skip).toBe('finalRanking')
  })
})

describe('Suspense + Pas à pas', () => {
  const both = { suspense: true, stepByStep: true }

  test('révélation en attente, bouton « Question suivante » qui mène à la question (sans classement)', () => {
    const revealed = reveal(0, both)
    expect(isAwaitingHost(revealed)).toBe(true)
    expect(nextDeadline(revealed)).toBeNull()
    expect(hostControls(revealed).awaitingNext).toBe('nextQuestion')
    expect(advance(revealed, NOW + 60_000)).toMatchObject({ status: 'question', currentIndex: 1 })
  })

  test('dernière question : « Classement final », puis fin de partie', () => {
    const revealed = reveal(2, both)
    expect(hostControls(revealed).awaitingNext).toBe('finalRanking')
    expect(advance(revealed, NOW + 60_000).status).toBe('ended')
  })

  test('pause puis reprise pendant l’attente : la révélation reste en attente', () => {
    const revealed = reveal(0, both)
    const paused = apply(revealed, pauseUpdate(revealed, NOW + 5_000))
    const resumed = apply(paused, resumeUpdate(paused, NOW + 600_000))
    expect(resumed).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    expect(nextDeadline(resumed)).toBeNull()
  })

  test('double appui : un seul passage', () => {
    const revealed = reveal(0, both)
    const expected = { status: 'reveal' as const, currentIndex: 0 }
    const next = apply(revealed, transitionUpdate(revealed, GAME, expected, NOW + 1_000))
    expect(transitionUpdate(next, GAME, expected, NOW + 1_050)).toBeNull()
  })
})

describe('durée estimée sur la fiche', () => {
  test('réglages par défaut : même durée qu’avant (6 min pour 10 questions)', () => {
    expect(estimateGameMinutes(QUESTIONS_PER_GAME, DEFAULT_SESSION_SETTINGS)).toBe(estimateQuizMinutes(QUESTIONS_PER_GAME))
    expect(estimateGameMinutes(QUESTIONS_PER_GAME, DEFAULT_SESSION_SETTINGS)).toBe(6)
  })

  test('Suspense : sans les classements, 5 min', () => {
    // 3 + 10 × (20 + 6) = 263 s, arrondi à 5 minutes.
    expect(estimateGameMinutes(QUESTIONS_PER_GAME, settings({ suspense: true }))).toBe(5)
  })

  test('Pas à pas : pas d’estimation (« à votre rythme »)', () => {
    expect(estimateGameMinutes(QUESTIONS_PER_GAME, settings({ stepByStep: true }))).toBeNull()
    expect(estimateGameMinutes(QUESTIONS_PER_GAME, settings({ stepByStep: true, suspense: true }))).toBeNull()
  })
})
