import { describe, expect, test } from 'vitest'

import { canLaunchGame, connectedPlayerIds } from '../../shared/players'

describe('connectedPlayerIds', () => {
  test('seuls les joueurs connectés comptent', () => {
    expect(connectedPlayerIds({ a: { connected: true }, b: { connected: false }, c: { connected: true } })).toEqual([
      'a',
      'c',
    ])
  })
})

describe('canLaunchGame', () => {
  test('refusé à 0 ou 1 joueur connecté', () => {
    expect(canLaunchGame({})).toBe(false)
    expect(canLaunchGame({ host: { connected: true } })).toBe(false)
  })

  test('un joueur déconnecté ne compte pas', () => {
    expect(canLaunchGame({ host: { connected: true }, other: { connected: false } })).toBe(false)
  })

  test('accepté à 2 joueurs connectés, hôte compris', () => {
    expect(canLaunchGame({ host: { connected: true }, other: { connected: true } })).toBe(true)
  })
})
