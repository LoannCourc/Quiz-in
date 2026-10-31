import { describe, expect, test } from 'vitest'

import { breakablePieces, DISPLAY_CHAR_WIDTH, fittedLabelScale, fittedMeasuredSize, LABEL_MIN_SCALE, SINGLE_LINE_MIN_SCALE } from '../../shared/labelFit'

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

  test('une seule ligne (« Reprendre la partie ») : la police descend jusqu’à 50 % pour garder le code', () => {
    // 360 de large, police du système à 140 % : 18 × 1,4 points.
    const scale = fittedLabelScale('REPRENDRE LA PARTIE 6J2R', 276, 18 * 1.4, 1, DISPLAY_CHAR_WIDTH, SINGLE_LINE_MIN_SCALE)
    expect(scale).toBeLessThan(LABEL_MIN_SCALE)
    expect(24 * DISPLAY_CHAR_WIDTH * 18 * 1.4 * scale).toBeLessThanOrEqual(276)
  })
})

describe('Titre mesuré sur deux lignes (Mes badges)', () => {
  const pieces = (...widths: number[]) => widths.map((width, index) => ({ width, spaced: index > 0 }))
  // « Artiste (Gribouille) » en 15 : 47 et 88 px, espace de 4 px.
  const artist = pieces(47, 88)

  test('tient sur une ligne : taille gardée', () => {
    expect(fittedMeasuredSize(artist, 4, 154, 15, 2, 10)).toBe(15)
  })

  test('colonne de 84 px : réduit jusqu’à ce que le mot le plus long tienne, sur deux lignes', () => {
    const size = fittedMeasuredSize(artist, 4, 84, 15, 2, 10)
    expect((88 * size) / 15).toBeLessThanOrEqual(84)
    expect(size).toBe(14)
  })

  test('trois mots qui demandent trois lignes : réduits jusqu’à deux', () => {
    // « Rapide comme l’éclair » en 15 : 46, 58 et 49 px.
    const size = fittedMeasuredSize(pieces(46, 58, 49), 4, 84, 15, 2, 10)
    expect(size).toBeLessThan(15)
    const ratio = size / 15
    expect((46 + 4 + 58) * ratio <= 84 || (58 + 4 + 49) * ratio <= 84).toBe(true)
  })

  test('trait d’union : coupure possible après, sans espace ; « Touche-à-tout » garde sa taille sur deux lignes', () => {
    expect(breakablePieces('Touche-à-tout')).toEqual([
      { text: 'Touche-', spaced: false },
      { text: 'à-', spaced: false },
      { text: 'tout', spaced: false },
    ])
    expect(breakablePieces('Rapide comme l’éclair').map((piece) => piece.spaced)).toEqual([false, true, true])
    const touche = [{ width: 58, spaced: false }, { width: 14, spaced: false }, { width: 30, spaced: false }]
    expect(fittedMeasuredSize(touche, 4, 84, 15, 2, 10)).toBe(15)
  })

  test('jamais sous la taille minimale ; largeur inconnue : taille d’origine', () => {
    expect(fittedMeasuredSize(pieces(400), 4, 84, 15, 2, 10)).toBe(10)
    expect(fittedMeasuredSize(artist, 4, 0, 15, 2, 10)).toBe(15)
  })
})
