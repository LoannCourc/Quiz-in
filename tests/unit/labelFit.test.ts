import { describe, expect, test } from 'vitest'

import { DISPLAY_CHAR_WIDTH, fittedLabelScale, LABEL_MIN_SCALE } from '../../shared/labelFit'

describe('Libellé de bouton ajusté (iOS)', () => {
  test('un libellé qui tient garde sa taille', () => {
    expect(fittedLabelScale('CONTINUER', 280, 24, 2, DISPLAY_CHAR_WIDTH)).toBe(1)
  })

  test('« Reprendre la partie 746N » sur une ligne (bouton compact, écran de 320) : réduit jusqu’à tenir', () => {
    const label = 'REPRENDRE LA PARTIE 746N'
    const scale = fittedLabelScale(label, 240, 16, 1, DISPLAY_CHAR_WIDTH)
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThanOrEqual(LABEL_MIN_SCALE)
    // À cette échelle, la largeur estimée tient.
    expect(label.length * 16 * scale * DISPLAY_CHAR_WIDTH).toBeLessThanOrEqual(240)
  })

  test('sur deux lignes, il tient sans réduction', () => {
    expect(fittedLabelScale('REPRENDRE LA PARTIE 746N', 288, 24, 2, DISPLAY_CHAR_WIDTH)).toBe(1)
  })

  test('jamais sous le minimum, largeur inconnue : taille d’origine', () => {
    expect(fittedLabelScale('UN TRÈS TRÈS LONG LIBELLÉ DE BOUTON QUI NE TIENDRA JAMAIS', 100, 24, 1, DISPLAY_CHAR_WIDTH)).toBe(LABEL_MIN_SCALE)
    expect(fittedLabelScale('CONTINUER', 0, 24, 1, DISPLAY_CHAR_WIDTH)).toBe(1)
  })
})
