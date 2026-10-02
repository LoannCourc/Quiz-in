import { describe, expect, test } from 'vitest'

import { computeRanks } from '../../shared/ranking'
import { computePoints } from '../../shared/scoring'

describe('computePoints', () => {
  const base = { correct: true, speedBonus: true, durationMs: 20_000 }

  test('mauvaise réponse : 0 point, même avec Rapidité', () => {
    expect(computePoints({ ...base, correct: false, remainingMs: 15_000 })).toBe(0)
  })

  test('sans Rapidité : 100 points quel que soit le temps', () => {
    expect(computePoints({ ...base, speedBonus: false, remainingMs: 19_000 })).toBe(100)
  })

  test('Rapidité : bonus proportionnel au temps restant, arrondi', () => {
    expect(computePoints({ ...base, remainingMs: 20_000 })).toBe(200)
    expect(computePoints({ ...base, remainingMs: 10_000 })).toBe(150)
    expect(computePoints({ ...base, remainingMs: 13_333 })).toBe(167)
  })

  test('temps restant nul : 100 points', () => {
    expect(computePoints({ ...base, remainingMs: 0 })).toBe(100)
  })

  test('réponse reçue dans la tolérance après la fin : bonus nul, pas négatif', () => {
    expect(computePoints({ ...base, remainingMs: -800 })).toBe(100)
  })

  test('temps restant supérieur à la durée : bonus plafonné à 100', () => {
    expect(computePoints({ ...base, remainingMs: 25_000 })).toBe(200)
  })
})

describe('computeRanks', () => {
  test('égalité à trois en tête : 1, 1, 1, puis 4', () => {
    expect(computeRanks({ a: 300, b: 300, c: 300, d: 100 })).toEqual({ a: 1, b: 1, c: 1, d: 4 })
  })

  test('égalité au milieu : 1, 2, 2, 4', () => {
    expect(computeRanks({ lea: 280, tom: 150, jo: 150, papa: 0 })).toEqual({ lea: 1, tom: 2, jo: 2, papa: 4 })
  })

  test('égalité 1, 1, 3', () => {
    expect(computeRanks({ a: 200, b: 200, c: 100 })).toEqual({ a: 1, b: 1, c: 3 })
  })

  test('tout le monde à 0 : tous premiers', () => {
    expect(computeRanks({ a: 0, b: 0 })).toEqual({ a: 1, b: 1 })
  })

  test('aucun joueur', () => {
    expect(computeRanks({})).toEqual({})
  })
})
