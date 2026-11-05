import { describe, expect, test } from 'vitest'

import { spreadConfettiPieces } from '../../shared/confettiLayout'

describe('Confettis de la bonne réponse', () => {
  const pieces = spreadConfettiPieces(5)

  test('quantité : règle des 10 à 15 confettis', () => {
    expect(pieces.length).toBeGreaterThanOrEqual(10)
    expect(pieces.length).toBeLessThanOrEqual(15)
  })

  test('toute la largeur, à intervalles réguliers : début, milieu et fin', () => {
    const lefts = pieces.map((piece) => piece.leftPercent)
    expect(lefts[0]).toBe(4)
    expect(lefts[lefts.length - 1]).toBe(96)
    const gaps = lefts.slice(1).map((left, index) => left - lefts[index])
    for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0])
    expect(lefts.filter((left) => left > 30 && left < 70).length).toBeGreaterThanOrEqual(4)
  })

  test('départs tous différents, deux voisins jamais à la suite', () => {
    const delays = pieces.map((piece) => piece.delayMs)
    expect(new Set(delays).size).toBe(pieces.length)
    for (let index = 1; index < delays.length; index++) expect(Math.abs(delays[index] - delays[index - 1])).toBeGreaterThan(110)
  })

  test('couleurs dans la palette', () => {
    for (const piece of pieces) expect(piece.colorIndex).toBeLessThan(5)
  })
})
