import { describe, expect, test } from 'vitest'

import { blindTestSwitch, gameAccess, gameTileState } from '../../shared/quizCatalog'

describe('Interrupteur du blind test : jamais « Bientôt » sans valeur confirmée', () => {
  test('valeur lue : ouverte seulement si elle vaut true', () => {
    expect(blindTestSwitch({ kind: 'ready', value: true }, null)).toBe(true)
    expect(blindTestSwitch({ kind: 'ready', value: false }, true)).toBe(false)
    expect(blindTestSwitch({ kind: 'ready', value: null }, true)).toBe(false)
  })

  test('relecture après une coupure, ou lecture impossible : le dernier état connu', () => {
    expect(blindTestSwitch({ kind: 'loading' }, true)).toBe(true)
    expect(blindTestSwitch({ kind: 'error' }, true)).toBe(true)
    expect(blindTestSwitch({ kind: 'loading' }, false)).toBe(false)
  })

  test('aucun état connu : en attente, pas coupé', () => {
    expect(blindTestSwitch({ kind: 'loading' }, null)).toBeNull()
    expect(blindTestSwitch({ kind: 'error' }, null)).toBeNull()
  })

  test('tuile : grisée sans « Bientôt » en attente, « Bientôt » seulement si confirmé coupé', () => {
    const tile = (blindTest: boolean | null) => gameTileState('blindTest', { blindTest, draw: true })
    expect(tile(null)).toBe('pending')
    expect(tile(false)).toBe('soon')
    expect(tile(true)).toBe('open')
    expect(gameTileState('quiz', { blindTest: null, draw: null })).toBe('open')
    expect(gameTileState('draw', { blindTest: true, draw: false })).toBe('soon')
  })

  test('catalogue : en attente, il patiente au lieu de renvoyer à l’accueil', () => {
    expect(gameAccess('blindTest', { blindTest: null, draw: true })).toBe('loading')
  })
})
