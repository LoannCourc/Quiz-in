import { describe, expect, test } from 'vitest'

import { NEXT_QUESTION_ANNOUNCE_MS, REVEAL_DURATION_S, SCORES_DURATION_S } from '../../shared/constants'
import { isAnnouncingNextQuestion, nextQuestionCountdown, upcomingQuestionNumber } from '../../shared/gameFlow'
import { answeredProgress } from '../../shared/players'
import type { GameStatus } from '../../shared/types'
import { makeSession } from './engineFixtures'

const NOW = 5_000_000

function at(status: GameStatus, currentIndex: number, phaseStartedAt: number, phaseEndsAt: number) {
  return makeSession({ status, currentIndex, questionCount: 10, phaseStartedAt, phaseEndsAt })
}

describe('nextQuestionCountdown', () => {
  test('REVEAL : jusqu’à la fin de la révélation + la durée du classement', () => {
    const session = at('reveal', 2, NOW, NOW + 8_000)
    expect(nextQuestionCountdown(session)).toEqual({
      startsAt: NOW,
      endsAt: NOW + 8_000 + SCORES_DURATION_S * 1000,
      isLastQuestion: false,
    })
  })

  test('SCORES : même attente, poursuivie (début = début de la révélation)', () => {
    const revealStart = NOW - REVEAL_DURATION_S.choice * 1000
    expect(nextQuestionCountdown(at('scores', 2, NOW, NOW + 6_000))).toEqual({
      startsAt: revealStart,
      endsAt: NOW + 6_000,
      isLastQuestion: false,
    })
  })

  test('dernière question : l’attente mène au classement final', () => {
    expect(nextQuestionCountdown(at('scores', 9, NOW, NOW + 6_000))?.isLastQuestion).toBe(true)
  })

  test('autres états : pas d’attente', () => {
    for (const status of ['lobby', 'starting', 'question', 'paused', 'ended'] as const) {
      expect(nextQuestionCountdown(at(status, 0, NOW, NOW + 1_000))).toBeNull()
    }
  })
})

describe('upcomingQuestionNumber et annonce', () => {
  test('après la question 3 (index 2) : annonce de la question 4', () => {
    expect(upcomingQuestionNumber(at('scores', 2, NOW, NOW + 6_000))).toBe(4)
  })

  test('après la dernière question : aucune annonce', () => {
    const last = at('scores', 9, NOW, NOW + 1_000)
    expect(upcomingQuestionNumber(last)).toBeNull()
    expect(isAnnouncingNextQuestion(last, NOW)).toBe(false)
  })

  test('annonce pendant les 2 dernières secondes du classement seulement', () => {
    const session = at('scores', 2, NOW, NOW + 6_000)
    expect(isAnnouncingNextQuestion(session, NOW + 6_000 - NEXT_QUESTION_ANNOUNCE_MS - 1)).toBe(false)
    expect(isAnnouncingNextQuestion(session, NOW + 6_000 - NEXT_QUESTION_ANNOUNCE_MS)).toBe(true)
    expect(isAnnouncingNextQuestion(session, NOW + 6_000)).toBe(true)
  })

  test('jamais pendant la révélation', () => {
    expect(isAnnouncingNextQuestion(at('reveal', 2, NOW, NOW + 1_000), NOW + 999)).toBe(false)
  })
})

describe('answeredProgress', () => {
  test('connectés ayant répondu / connectés', () => {
    const players = { a: { connected: true }, b: { connected: true }, c: { connected: false } }
    expect(answeredProgress(players, { a: true, c: true })).toEqual({ answered: 1, total: 2 })
  })

  test('personne n’a répondu', () => {
    expect(answeredProgress({ a: { connected: true } }, undefined)).toEqual({ answered: 0, total: 1 })
  })
})
