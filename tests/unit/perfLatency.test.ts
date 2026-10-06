import { describe, expect, test } from 'vitest'

import { transitionLatency } from '../../shared/perfLatency'

describe('transitionLatency', () => {
  test('transition à l’heure : retards de réseau et d’affichage seulement', () => {
    expect(transitionLatency({ previousEndsAt: 10_000, writtenAt: 10_050, receivedAt: 10_250, displayedAt: 10_300 })).toEqual({
      hostMs: 50,
      networkMs: 200,
      displayMs: 50,
      tvMs: 250,
    })
  })

  test('hôte en retard de 5 s, TV rapide', () => {
    const latency = transitionLatency({ previousEndsAt: 10_000, writtenAt: 15_000, receivedAt: 15_100, displayedAt: 15_150 })
    expect(latency.hostMs).toBe(5_000)
    expect(latency.tvMs).toBe(150)
  })

  test('TV qui affiche tard (fil principal bloqué)', () => {
    expect(transitionLatency({ previousEndsAt: 10_000, writtenAt: 10_000, receivedAt: 10_100, displayedAt: 16_100 }).displayMs).toBe(6_000)
  })

  test('phase précédente sans échéance, ou passée bien avant : pas de mesure de l’hôte', () => {
    expect(transitionLatency({ previousEndsAt: 0, writtenAt: 10_000, receivedAt: 10_100, displayedAt: 10_200 }).hostMs).toBeNull()
    expect(transitionLatency({ previousEndsAt: 100_000, writtenAt: 10_000, receivedAt: 10_100, displayedAt: 10_200 }).hostMs).toBeNull()
  })

  test('hôte un peu en avance (question passée) : 0 ; horloges décalées : jamais négatif', () => {
    const latency = transitionLatency({ previousEndsAt: 10_000, writtenAt: 9_000, receivedAt: 8_900, displayedAt: 8_800 })
    expect(latency).toEqual({ hostMs: 0, networkMs: 0, displayMs: 0, tvMs: 0 })
  })
})
