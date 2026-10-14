import { describe, expect, test } from 'vitest'

import { homeBlockGap, homeTileDensity, homeTileHeightNeeded } from '../../shared/homeLayout'

describe('Accueil sans défilement', () => {
  test('la densité la plus confortable qui tient, sinon défilement', () => {
    expect(homeTileDensity(500, 1)).toBe('normal')
    expect(homeTileDensity(2 * homeTileHeightNeeded('medium', 1) + 16, 1)).toBe('medium')
    expect(homeTileDensity(2 * homeTileHeightNeeded('tight', 1) + 16, 1)).toBe('tight')
    expect(homeTileDensity(150, 1)).toBeNull()
  })

  test('police agrandie : il faut plus de place ; zone inconnue : défilement', () => {
    expect(homeTileHeightNeeded('tight', 1.4)).toBeGreaterThan(homeTileHeightNeeded('tight', 1))
    // Au-delà de 1,4 (plafond des libellés), plus rien ne change.
    expect(homeTileHeightNeeded('tight', 2)).toBe(homeTileHeightNeeded('tight', 1.4))
    expect(homeTileDensity(0, 1)).toBeNull()
    expect(homeTileDensity(Number.NaN, 1)).toBeNull()
  })

  test('marges par paliers', () => {
    expect([homeBlockGap(932), homeBlockGap(700), homeBlockGap(568)]).toEqual([24, 12, 8])
  })
})
