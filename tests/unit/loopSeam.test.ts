import { describe, expect, test } from 'vitest'

import { bakeLoopSeam } from '../../shared/loopSeam'

const RATE = 1000

// Son qui se répète tous les 100 échantillons, sauf la fin du fichier (fondu de sortie, à partir de 300).
function looping(length: number): Float32Array {
  const samples = new Float32Array(length)
  for (let index = 0; index < length; index++) {
    const fade = index >= 300 ? Math.max(0, 1 - (index - 300) / 50) : 1
    samples[index] = Math.sin((2 * Math.PI * index) / 100) * fade
  }
  return samples
}

describe('bakeLoopSeam', () => {
  test('boucle sur le début du fichier, avant la fin en fondu, avec un raccord sans saut', () => {
    const samples = looping(400)
    // Raccord volontairement décalé de 7 échantillons : sans fondu enchaîné, saut au raccord.
    const region = bakeLoopSeam(samples, RATE, 0.207, 0.02)
    expect(region).toEqual({ startS: 0.02, endS: 0.227 })
    const lastInLoop = samples[Math.round(region.endS * RATE) - 1]
    const firstAfterJump = samples[Math.round(region.startS * RATE)]
    const normalStep = 2 * Math.PI / 100
    expect(Math.abs(firstAfterJump - lastInLoop)).toBeLessThanOrEqual(normalStep * 1.5)
  })

  test('le fondu ne déborde jamais du fichier ni du début de la boucle', () => {
    const region = bakeLoopSeam(looping(400), RATE, 0.39, 0.05)
    expect(region.endS).toBeLessThanOrEqual(0.4)
    expect(region.startS).toBe(0.01)
  })
})
