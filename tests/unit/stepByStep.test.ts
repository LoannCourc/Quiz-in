import { describe, expect, test } from 'vitest'

import { REVEAL_DURATION_S, SCORES_DURATION_S } from '../../shared/constants'
import { isAwaitingHost, nextPhase, nextQuestionCountdown } from '../../shared/gameFlow'
import { isPhaseStale } from '../../shared/hostAbsence'
import {
  buildReveal,
  hostControls,
  nextDeadline,
  pauseUpdate,
  resumeUpdate,
  transitionUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import type { Session } from '../../shared/types'
import { makeSession, PLAYER, QUESTIONS } from './engineFixtures'

const STEP_SETTINGS = { answerMode: 'choice' as const, speedBonus: true, control: false, teams: false, stepByStep: true }
const NOW = 2_000_000
const GAME = QUESTIONS.slice(0, 3)

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

function questionSession(stepByStep: boolean, overrides: Partial<Session> = {}): Session {
  return makeSession({
    status: 'question',
    currentIndex: 0,
    questionCount: GAME.length,
    phaseStartedAt: NOW - 10_000,
    phaseEndsAt: NOW + 10_000,
    settings: { ...STEP_SETTINGS, stepByStep },
    answers: { 0: { [PLAYER]: { value: 1, submittedAt: NOW - 4_000 } } },
    ...overrides,
  })
}

// Révélation en attente, telle que l'écrit le moteur à la fin de la question.
function awaitingReveal(overrides: Partial<Session> = {}): Session {
  const session = questionSession(true, overrides)
  const expected = { status: 'question' as const, currentIndex: session.currentIndex }
  return apply(session, transitionUpdate(session, GAME, expected, NOW))
}

describe('Pas à pas : attente après la révélation', () => {
  test('la révélation n’a pas de durée, seule l’action de l’hôte fait avancer', () => {
    expect(nextPhase('question', { answerMode: 'choice', currentIndex: 0, questionCount: 3, stepByStep: true })).toEqual({
      status: 'reveal',
      currentIndex: 0,
      durationS: null,
    })
    const reveal = awaitingReveal()
    expect(reveal).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    expect(isAwaitingHost(reveal)).toBe(true)
    expect(nextDeadline(reveal)).toBeNull()
  })

  test('réglage désactivé : comportement inchangé (révélation de 6 s, puis classement automatique)', () => {
    const session = questionSession(false)
    const reveal = apply(session, transitionUpdate(session, GAME, { status: 'question', currentIndex: 0 }, NOW))
    expect(reveal.phaseEndsAt).toBe(NOW + REVEAL_DURATION_S.choice * 1000)
    expect(isAwaitingHost(reveal)).toBe(false)
    expect(nextDeadline(reveal)).toBe(reveal.phaseEndsAt)
    expect(hostControls(reveal).awaitingNext).toBeNull()
  })

  test('ancienne partie sans le champ stepByStep : désactivé', () => {
    const { stepByStep: _stepByStep, ...oldSettings } = STEP_SETTINGS
    expect(isAwaitingHost({ status: 'reveal', settings: oldSettings })).toBe(false)
  })

  test('« Question suivante » : passage au classement de 5 s, puis question suivante automatique', () => {
    const reveal = awaitingReveal()
    const scores = apply(reveal, transitionUpdate(reveal, GAME, { status: 'reveal', currentIndex: 0 }, NOW + 60_000))
    expect(scores).toMatchObject({ status: 'scores', phaseEndsAt: NOW + 60_000 + SCORES_DURATION_S * 1000 })
    expect(nextDeadline(scores)).toBe(scores.phaseEndsAt)
  })

  test('double appui : un seul passage (le second ne correspond plus à l’état attendu)', () => {
    const reveal = awaitingReveal()
    const expected = { status: 'reveal' as const, currentIndex: 0 }
    const scores = apply(reveal, transitionUpdate(reveal, GAME, expected, NOW + 1_000))
    expect(transitionUpdate(scores, GAME, expected, NOW + 1_050)).toBeNull()
  })

  test('bouton de l’hôte : « Question suivante », puis « Voir le classement » à la dernière question', () => {
    expect(hostControls(awaitingReveal()).awaitingNext).toBe('nextQuestion')
    const last = awaitingReveal({ currentIndex: 2, answers: { 2: {} } })
    expect(hostControls(last).awaitingNext).toBe('finalRanking')
  })

  test('pause puis reprise pendant l’attente : la révélation reste en attente et ne repart pas', () => {
    const reveal = awaitingReveal()
    const paused = apply(reveal, pauseUpdate(reveal, NOW + 5_000))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'reveal', remainingMs: 0 })
    const resumed = apply(paused, resumeUpdate(paused, NOW + 600_000))
    expect(resumed).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    expect(resumed.pausedFrom).toBeUndefined()
    expect(nextDeadline(resumed)).toBeNull()
    expect(hostControls(resumed).awaitingNext).toBe('nextQuestion')
  })

  test('appui pendant la pause : aucun bouton proposé, et la transition est ignorée', () => {
    const reveal = awaitingReveal()
    const paused = apply(reveal, pauseUpdate(reveal, NOW + 5_000))
    expect(hostControls(paused)).toMatchObject({ awaitingNext: null, skip: null, canResume: true })
    expect(transitionUpdate(paused, GAME, { status: 'reveal', currentIndex: 0 }, NOW + 6_000)).toBeNull()
  })

  test('joueurs et TV : pas de « phase bloquée » pendant l’attente, pas de compte à rebours', () => {
    const reveal = awaitingReveal()
    expect(isPhaseStale(reveal, NOW + 3_600_000)).toBe(false)
    expect(nextQuestionCountdown(reveal)).toBeNull()
  })

  test('classement après l’attente : compte à rebours de ses seules 5 s', () => {
    const reveal = awaitingReveal()
    const scores = apply(reveal, transitionUpdate(reveal, GAME, { status: 'reveal', currentIndex: 0 }, NOW + 60_000))
    expect(nextQuestionCountdown(scores)).toMatchObject({ startsAt: scores.phaseStartedAt, endsAt: scores.phaseEndsAt })
  })

  test('bonus de rapidité inchangé : calculé à la fin de la question, pas pendant l’attente', () => {
    const withStep = buildReveal(GAME[0], questionSession(true)).results[PLAYER]
    const without = buildReveal(GAME[0], questionSession(false)).results[PLAYER]
    expect(withStep).toEqual(without)
    expect(withStep.points).toBeGreaterThan(100)
  })
})
