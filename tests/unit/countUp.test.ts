import { describe, expect, test } from 'vitest'

import { countUpValue, easeOutCubic } from '../../shared/countUp'

describe('Compteur animé des points', () => {
  test('part de la valeur de départ, finit exactement sur la valeur finale', () => {
    expect(countUpValue(0, 178, 0, 1300)).toBe(0)
    expect(countUpValue(0, 178, 1300, 1300)).toBe(178)
    expect(countUpValue(0, 178, 5000, 1300)).toBe(178)
    expect(countUpValue(1000, 1180, 1200, 1200)).toBe(1180)
  })

  test('ralentit à la fin : plus de la moitié du chemin à mi-temps', () => {
    expect(countUpValue(0, 100, 650, 1300)).toBe(88)
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875)
  })

  test('durée nulle (animations coupées) : tout de suite la valeur finale', () => {
    expect(countUpValue(0, 178, 0, 0)).toBe(178)
  })
})
