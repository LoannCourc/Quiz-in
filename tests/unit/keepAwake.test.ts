import { describe, expect, test } from 'vitest'

import { END_KEEP_AWAKE_MS, keepAwakeDeadline, shouldKeepAwake } from '../../shared/keepAwake'

const ENDED_AT = 1_000_000

describe('Anti-veille de la TV', () => {
  test('pendant la partie : toujours éveillée', () => {
    for (const status of ['lobby', 'starting', 'question', 'reveal', 'scores', 'paused'] as const) {
      expect(shouldKeepAwake({ status, phaseStartedAt: 0 }, ENDED_AT + 10 * END_KEEP_AWAKE_MS)).toBe(true)
    }
  })

  test('écran de fin : éveillée 15 min (podium, Changer de jeu), puis la box peut se mettre en veille', () => {
    const ended = { status: 'ended' as const, phaseStartedAt: ENDED_AT }
    expect(keepAwakeDeadline(ended)).toBe(ENDED_AT + END_KEEP_AWAKE_MS)
    expect(shouldKeepAwake(ended, ENDED_AT + 1_000)).toBe(true)
    expect(shouldKeepAwake(ended, ENDED_AT + END_KEEP_AWAKE_MS - 1)).toBe(true)
    expect(shouldKeepAwake(ended, ENDED_AT + END_KEEP_AWAKE_MS)).toBe(false)
  })

  test('choix du prochain jeu : éveillée sans limite', () => {
    const choosing = { status: 'ended' as const, phaseStartedAt: ENDED_AT, nextGameAt: ENDED_AT + 60_000 }
    expect(keepAwakeDeadline(choosing)).toBeNull()
    expect(shouldKeepAwake(choosing, ENDED_AT + 2 * END_KEEP_AWAKE_MS)).toBe(true)
  })
})
