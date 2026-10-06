import { describe, expect, test } from 'vitest'

import { STARTING_DURATION_S } from '../../shared/constants'
import { GO_DISPLAY_MS, msUntilNextStartingStep, STARTING_DIGIT_MS, startingStep, startingTimeline } from '../../shared/startingCountdown'

describe('3-2-1 puis « GO ! »', () => {
  test('dans la durée de la phase : la première question n’est pas décalée', () => {
    expect(3 * STARTING_DIGIT_MS + GO_DISPLAY_MS).toBe(STARTING_DURATION_S * 1000)
  })

  test('étape affichée selon le temps restant', () => {
    expect(startingStep(3_000)).toBe(3)
    expect(startingStep(2_201)).toBe(3)
    expect(startingStep(2_200)).toBe(2)
    expect(startingStep(1_401)).toBe(2)
    expect(startingStep(1_400)).toBe(1)
    expect(startingStep(601)).toBe(1)
    expect(startingStep(600)).toBe('go')
    expect(startingStep(0)).toBe('go')
    // Reprise après une pause avec plus de temps qu'une phase : jamais au-delà de 3.
    expect(startingStep(10_000)).toBe(3)
  })

  test('prochain changement', () => {
    expect(msUntilNextStartingStep(3_000)).toBe(STARTING_DIGIT_MS)
    expect(msUntilNextStartingStep(2_000)).toBe(600)
    expect(msUntilNextStartingStep(500)).toBe(500)
    expect(msUntilNextStartingStep(0)).toBe(0)
  })

  test('calendrier depuis la fin de la phase', () => {
    expect(startingTimeline(10_000)).toEqual({ digitsAt: [7_000, 7_800, 8_600], goAt: 9_400 })
  })
})
