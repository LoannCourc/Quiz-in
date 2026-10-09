import { describe, expect, test } from 'vitest'

import { removePlayerUpdate } from '../../shared/players'

const lobby = { status: 'lobby' as const, hostUid: 'host', players: { host: {}, lea: {}, tom: {} } }

describe('Exclure un joueur (salon)', () => {
  test('retire son entrée et garde son identifiant parmi les exclus', () => {
    expect(removePlayerUpdate(lobby, 'lea')).toEqual({ 'players/lea': null, 'banned/lea': true })
  })

  test('jamais l’hôte, jamais un absent, jamais hors du salon', () => {
    expect(removePlayerUpdate(lobby, 'host')).toBeNull()
    expect(removePlayerUpdate(lobby, 'inconnu')).toBeNull()
    expect(removePlayerUpdate({ ...lobby, status: 'question' }, 'lea')).toBeNull()
  })
})
