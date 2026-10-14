import { describe, expect, test } from 'vitest'

import { boundedFontSize, fittedFontSize, MIN_FITTED_FONT_SIZE } from '../../shared/fontSize'

describe('Taille de police ajustée à une largeur', () => {
  test('largeur pas encore mesurée, négative ou NaN : la taille de départ (le bug Android : -19 pour « 80s »)', () => {
    expect(fittedFontSize(26, 0, 3, 0.74)).toBe(26)
    // Tuile de 0 de large au premier rendu : (-8 - 32) de place pour « 80s ».
    expect(fittedFontSize(26, -40, 3, 0.74)).toBe(26)
    expect(fittedFontSize(26, Number.NaN, 3, 0.74)).toBe(26)
    expect(fittedFontSize(26, Number.POSITIVE_INFINITY, 3, 0.74)).toBe(26)
    expect(fittedFontSize(26, 120, 0, 0.74)).toBe(26)
  })

  test('largeur très petite : jamais sous le minimum', () => {
    expect(fittedFontSize(26, 5, 14, 0.74)).toBe(MIN_FITTED_FONT_SIZE)
  })

  test('largeur normale : la taille qui tient, jamais plus que la taille de départ', () => {
    // « Toutes époques » dans une tuile étroite : 11,96 → le minimum.
    expect(fittedFontSize(26, 124, 14, 0.74)).toBe(MIN_FITTED_FONT_SIZE)
    expect(fittedFontSize(26, 124, 7, 0.74)).toBe(23)
    expect(fittedFontSize(26, 400, 3, 0.74)).toBe(26)
  })

  test('taille déjà calculée : bornée ; départ plus petit que le minimum : gardé', () => {
    expect(boundedFontSize(-57, 26)).toBe(MIN_FITTED_FONT_SIZE)
    expect(boundedFontSize(Number.NaN, 20)).toBe(20)
    expect(boundedFontSize(40, 20)).toBe(20)
    expect(boundedFontSize(8, 10)).toBe(10)
    expect(boundedFontSize(5, 10, 7)).toBe(7)
  })
})
