import { describe, expect, test } from 'vitest'

import { isTvPresent } from '../../shared/tvPresence'

describe('isTvPresent', () => {
  test('champ absent (aucune TV, partie ancienne, connexion en cours) : pas de TV', () => {
    expect(isTvPresent({})).toBe(false)
    expect(isTvPresent({ tvPresence: undefined })).toBe(false)
    expect(isTvPresent({ tvPresence: {} })).toBe(false)
  })

  test('une ou plusieurs TV ouvertes', () => {
    expect(isTvPresent({ tvPresence: { 'tv-1': true } })).toBe(true)
    expect(isTvPresent({ tvPresence: { 'tv-1': true, 'tv-2': true } })).toBe(true)
  })
})
