import { describe, expect, test } from 'vitest'

import { LEGACY_PERF_STORAGE_KEY, perfEnabledFromUrl } from '../../shared/perfFlag'

describe('Panneau de mesures de la TV : jamais allumé tout seul', () => {
  test('allumé seulement par ?perf=1 ; absent, ?perf=0 ou autre valeur : éteint', () => {
    expect(perfEnabledFromUrl('?code=ABCD&perf=1')).toBe(true)
    expect(perfEnabledFromUrl('?code=ABCD')).toBe(false)
    expect(perfEnabledFromUrl('')).toBe(false)
    expect(perfEnabledFromUrl('?perf=0')).toBe(false)
    expect(perfEnabledFromUrl('?perf=true')).toBe(false)
  })

  test('ancienne valeur mémorisée par la TV (avant la 1.2.2) : clé connue, effacée au démarrage', () => {
    expect(LEGACY_PERF_STORAGE_KEY).toBe('quizin.perf')
  })
})
