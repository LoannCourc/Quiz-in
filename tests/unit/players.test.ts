import { describe, expect, test } from 'vitest'

import { LOBBY_GHOST_GRACE_MS } from '../../shared/constants'
import { canLaunchGame, connectedPlayerIds, ghostPlayersToRemove, trackDisconnections } from '../../shared/players'

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

describe('trackDisconnections', () => {
  test('nouveau déconnecté noté maintenant ; heure conservée tant qu’il reste déconnecté', () => {
    const first = trackDisconnections({}, { a: { connected: false }, b: { connected: true } }, 1_000)
    expect(first).toEqual({ a: 1_000 })
    expect(trackDisconnections(first, { a: { connected: false } }, 9_000)).toEqual({ a: 1_000 })
  })

  test('joueur reconnecté ou retiré : sort du suivi', () => {
    expect(trackDisconnections({ a: 1_000 }, { a: { connected: true } }, 5_000)).toEqual({})
    expect(trackDisconnections({ a: 1_000 }, {}, 5_000)).toEqual({})
  })
})

describe('ghostPlayersToRemove', () => {
  const lobby = (players: Record<string, { connected: boolean }>) => ({ status: 'lobby' as const, hostUid: 'host', players })

  test('déconnecté depuis plus de 30 s en LOBBY : retiré', () => {
    expect(ghostPlayersToRemove(lobby({ a: { connected: false } }), { a: 0 }, LOBBY_GHOST_GRACE_MS + 1)).toEqual(['a'])
  })

  test('pile 30 s : encore conservé (il faut plus de 30 s)', () => {
    expect(ghostPlayersToRemove(lobby({ a: { connected: false } }), { a: 0 }, LOBBY_GHOST_GRACE_MS)).toEqual([])
  })

  test('reconnecté avant 30 s : conservé', () => {
    const since = trackDisconnections({ a: 0 }, { a: { connected: true } }, 20_000)
    expect(ghostPlayersToRemove(lobby({ a: { connected: true } }), since, 40_000)).toEqual([])
  })

  test('après le lancement : plus aucune suppression', () => {
    for (const status of ['starting', 'question', 'reveal', 'scores', 'paused', 'ended'] as const) {
      const game = { status, hostUid: 'host', players: { a: { connected: false } } }
      expect(ghostPlayersToRemove(game, { a: 0 }, 60_000)).toEqual([])
    }
  })

  test('l’hôte n’est jamais retiré ; un joueur jamais vu déconnecté non plus', () => {
    const game = lobby({ host: { connected: false }, b: { connected: false } })
    expect(ghostPlayersToRemove(game, { host: 0 }, 60_000)).toEqual([])
  })
})
