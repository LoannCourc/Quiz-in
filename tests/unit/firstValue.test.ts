import { describe, expect, test, vi } from 'vitest'

import { firstValue } from '../../shared/firstValue'

describe('Première valeur d’un abonnement', () => {
  test('rappel immédiat (valeur en cache) : pas de plantage, désabonné tout de suite', async () => {
    const unsubscribe = vi.fn()
    const value = await firstValue<number>((onValue) => {
      onValue(42)
      return unsubscribe
    }, 1000, 0)
    expect(value).toBe(42)
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  test('rappel plus tard : la valeur, puis désabonnement', async () => {
    const unsubscribe = vi.fn()
    const value = await firstValue<number>((onValue) => {
      setTimeout(() => onValue(7), 5)
      return unsubscribe
    }, 1000, 0)
    expect(value).toBe(7)
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  test('aucune valeur : repli après le délai ; abonnement qui plante : repli tout de suite', async () => {
    expect(await firstValue<number>(() => () => undefined, 10, -1)).toBe(-1)
    expect(
      await firstValue<number>(() => {
        throw new Error('hors ligne')
      }, 1000, -2),
    ).toBe(-2)
  })
})
