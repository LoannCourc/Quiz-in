import { describe, expect, test } from 'vitest'

import { homeBlockGap, homeTileDensity, homeTileHeightNeeded, showsTileHint } from '../../shared/homeLayout'

describe('Accueil sans défilement (liens « À propos » et « Confidentialité » toujours visibles)', () => {
  test('la densité la plus confortable qui tient, sinon tuiles minimales : jamais de défilement', () => {
    expect(homeTileDensity(500, 1)).toBe('normal')
    expect(homeTileDensity(2 * homeTileHeightNeeded('medium', 1) + 16, 1)).toBe('medium')
    expect(homeTileDensity(2 * homeTileHeightNeeded('tight', 1) + 16, 1)).toBe('tight')
    // Zone trop basse (petit écran, police agrandie, ou clavier d'un autre écran) : minimale, pas null.
    expect(homeTileDensity(150, 1)).toBe('minimal')
    expect(homeTileDensity(40, 1.4)).toBe('minimal')
  })

  test('tuiles minimales : le nom seul, plus basses que les serrées', () => {
    expect(showsTileHint('minimal')).toBe(false)
    expect(showsTileHint('tight')).toBe(true)
    expect(homeTileHeightNeeded('minimal', 1)).toBeLessThan(homeTileHeightNeeded('tight', 1))
  })

  test('police agrandie : il faut plus de place ; zone pas encore dessinée : mesure ignorée', () => {
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
