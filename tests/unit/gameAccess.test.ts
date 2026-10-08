import { describe, expect, test } from 'vitest'

import { gameAccess, type GameSwitches } from '../../shared/quizCatalog'

// Navigation accueil → catalogue d'un jeu (route (host)/catalog/[gameType]) : chacun des 4 jeux s'ouvre.
// Bug corrigé : l'interrupteur du blind test pas encore lu valait « coupé », d'où un retour à l'accueil.
const ALL_ON: GameSwitches = { blindTest: true, draw: true }
const LOADING: GameSwitches = { blindTest: null, draw: null }

describe('Accès au catalogue de chaque jeu', () => {
  test.each(['quiz', 'blindTest', 'bluff', 'draw'])('%s : ouvert quand son interrupteur est ouvert', (game) => {
    expect(gameAccess(game, ALL_ON)).toBe('open')
  })

  test('interrupteurs pas encore lus : on attend, jamais de retour à l’accueil', () => {
    expect(gameAccess('blindTest', LOADING)).toBe('loading')
    expect(gameAccess('draw', LOADING)).toBe('loading')
    expect(gameAccess('quiz', LOADING)).toBe('open')
    expect(gameAccess('bluff', LOADING)).toBe('open')
  })

  test('coupé à distance ou jeu inconnu : fermé', () => {
    expect(gameAccess('blindTest', { blindTest: false, draw: true })).toBe('closed')
    expect(gameAccess('draw', { blindTest: true, draw: false })).toBe('closed')
    expect(gameAccess('poker', ALL_ON)).toBe('closed')
    expect(gameAccess(undefined, ALL_ON)).toBe('closed')
  })
})
