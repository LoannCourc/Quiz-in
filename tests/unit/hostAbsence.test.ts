import { describe, expect, test } from 'vitest'

import { HOST_DISCONNECT_TIMEOUT_S, REVEAL_GRACE_MS, STALE_PHASE_MARGIN_MS } from '../../shared/constants'
import {
  abandonedGameDeletableAt,
  canDeleteAbandonedGame,
  connectionLostPauseUpdate,
  formatMinutesSeconds,
  hostReturnUpdate,
  isHostAway,
  isPhaseStale,
  stalePhaseAt,
} from '../../shared/hostAbsence'
import { makeSession } from './engineFixtures'

const NOW = 9_000_000
const TIMEOUT_MS = HOST_DISCONNECT_TIMEOUT_S * 1000

describe('délai avant suppression', () => {
  test('5 minutes, comme la règle (300000 ms dans database.rules.json)', () => {
    expect(TIMEOUT_MS).toBe(300_000)
  })
})

describe('isHostAway', () => {
  test('hostLeftAt présent pendant la partie, en lobby ou en pause : hôte absent', () => {
    for (const status of ['lobby', 'question', 'scores', 'paused'] as const) {
      expect(isHostAway(makeSession({ status, hostLeftAt: NOW }))).toBe(true)
    }
  })

  test('en fin de partie : pas de message d’absence', () => {
    expect(isHostAway(makeSession({ status: 'ended', hostLeftAt: NOW }))).toBe(false)
  })

  test('sans hostLeftAt : hôte présent', () => {
    expect(isHostAway(makeSession({ status: 'question' }))).toBe(false)
  })
})

describe('suppression d’une partie abandonnée', () => {
  test('possible strictement après hostLeftAt + 5 min, y compris en fin de partie', () => {
    const session = makeSession({ status: 'ended', hostLeftAt: NOW })
    expect(abandonedGameDeletableAt(session)).toBe(NOW + TIMEOUT_MS)
    expect(canDeleteAbandonedGame(session, NOW + TIMEOUT_MS)).toBe(false)
    expect(canDeleteAbandonedGame(session, NOW + TIMEOUT_MS + 1)).toBe(true)
  })

  test('hôte présent (pas de hostLeftAt) : jamais', () => {
    const session = makeSession({ status: 'question' })
    expect(abandonedGameDeletableAt(session)).toBeNull()
    expect(canDeleteAbandonedGame(session, NOW + 10 * TIMEOUT_MS)).toBe(false)
  })
})

describe('hostReturnUpdate', () => {
  test('retour pendant une question : pause avec le temps qui restait au départ', () => {
    const session = makeSession({ status: 'question', phaseEndsAt: NOW + 12_000, hostLeftAt: NOW })
    expect(hostReturnUpdate(session)).toEqual({
      status: 'paused',
      pausedFrom: 'question',
      remainingMs: 12_000,
      hostLeftAt: null,
    })
  })

  test('retour pendant le classement : pause du classement', () => {
    const session = makeSession({ status: 'scores', phaseEndsAt: NOW + 3_000, hostLeftAt: NOW })
    expect(hostReturnUpdate(session)).toMatchObject({ status: 'paused', pausedFrom: 'scores', remainingMs: 3_000 })
  })

  test('phase déjà finie au moment du départ : temps restant 0, jamais négatif', () => {
    const session = makeSession({ status: 'reveal', phaseEndsAt: NOW - 2_000, hostLeftAt: NOW })
    expect(hostReturnUpdate(session)?.remainingMs).toBe(0)
  })

  test('déjà en pause, en lobby ou terminée : seulement l’effacement de hostLeftAt', () => {
    for (const status of ['paused', 'lobby', 'ended'] as const) {
      expect(hostReturnUpdate(makeSession({ status, hostLeftAt: NOW }))).toEqual({ hostLeftAt: null })
    }
  })

  test('hôte jamais parti : rien à faire', () => {
    expect(hostReturnUpdate(makeSession({ status: 'question' }))).toBeNull()
  })
})

describe('formatMinutesSeconds', () => {
  test('minutes et secondes, arrondi à la seconde supérieure, jamais négatif', () => {
    expect(formatMinutesSeconds(300_000)).toBe('5:00')
    expect(formatMinutesSeconds(245_100)).toBe('4:06')
    expect(formatMinutesSeconds(9_000)).toBe('0:09')
    expect(formatMinutesSeconds(-500)).toBe('0:00')
  })
})

describe('connectionLostPauseUpdate (perte de connexion constatée par l’hôte)', () => {
  test('pause avec le temps restant à l’instant de la perte', () => {
    const session = makeSession({ status: 'question', phaseStartedAt: NOW - 8_000, phaseEndsAt: NOW + 12_000 })
    expect(connectionLostPauseUpdate(session, NOW)).toEqual({ status: 'paused', pausedFrom: 'question', remainingMs: 12_000 })
  })

  test('temps restant borné : jamais négatif, jamais plus que la durée de la phase', () => {
    const session = makeSession({ status: 'reveal', phaseStartedAt: NOW, phaseEndsAt: NOW + 6_000 })
    expect(connectionLostPauseUpdate(session, NOW + 10_000)?.remainingMs).toBe(0)
    expect(connectionLostPauseUpdate(session, NOW - 60_000)?.remainingMs).toBe(6_000)
  })

  test('lobby, pause ou fin : rien à faire', () => {
    for (const status of ['lobby', 'paused', 'ended'] as const) {
      expect(connectionLostPauseUpdate(makeSession({ status, phaseEndsAt: NOW }), NOW)).toBeNull()
    }
  })
})

describe('phase périmée (joueurs et TV)', () => {
  test('bloquée à partir de phaseEndsAt + 5 s, pas avant', () => {
    const session = makeSession({ status: 'question', phaseEndsAt: NOW })
    expect(stalePhaseAt(session)).toBe(NOW + STALE_PHASE_MARGIN_MS)
    expect(isPhaseStale(session, NOW + STALE_PHASE_MARGIN_MS - 1)).toBe(false)
    expect(isPhaseStale(session, NOW + STALE_PHASE_MARGIN_MS)).toBe(true)
  })

  test('concerne le 3-2-1, la question, la révélation et le classement', () => {
    for (const status of ['starting', 'question', 'reveal', 'scores'] as const) {
      expect(isPhaseStale(makeSession({ status, phaseEndsAt: NOW }), NOW + 60_000)).toBe(true)
    }
  })

  test('jamais en lobby, en pause ni en fin de partie', () => {
    for (const status of ['lobby', 'paused', 'ended'] as const) {
      expect(isPhaseStale(makeSession({ status, phaseEndsAt: NOW }), NOW + 60_000)).toBe(false)
    }
  })

  test('marge plus grande que celle de la révélation (1,2 s) : pas de fausse alerte', () => {
    expect(STALE_PHASE_MARGIN_MS).toBeGreaterThan(REVEAL_GRACE_MS)
  })
})
