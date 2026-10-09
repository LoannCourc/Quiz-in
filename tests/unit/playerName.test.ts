import { describe, expect, test } from 'vitest'

import { isAllowedPlayerName, NAME_MIN_SCALE, playerNameScale } from '../../shared/playerName'

describe('Pseudo sur une seule ligne : taille selon la longueur', () => {
  test('entier jusqu’à 8 caractères, puis 6 % de moins par caractère', () => {
    expect(playerNameScale('Léa')).toBe(1)
    expect(playerNameScale('Camille8')).toBe(1)
    expect(playerNameScale('Ordinateur')).toBe(0.88)
  })

  test('jamais sous la taille minimale lisible (12 caractères, le maximum)', () => {
    expect(playerNameScale('Marie-Hélène')).toBe(NAME_MIN_SCALE)
    expect(playerNameScale('x'.repeat(30))).toBe(NAME_MIN_SCALE)
  })
})

describe('Pseudo : filtre des mots interdits (même liste que les réponses)', () => {
  test('refusé s’il contient un mot interdit, même avec accents, majuscules ou pluriel', () => {
    expect(isAllowedPlayerName('Connard')).toBe(false)
    expect(isAllowedPlayerName('Gros CONS')).toBe(false)
    expect(isAllowedPlayerName('Mr Nazi')).toBe(false)
  })

  test('accepté sinon, même si un mot interdit est caché dans un autre mot', () => {
    expect(isAllowedPlayerName('Léa')).toBe(true)
    expect(isAllowedPlayerName('Conrad')).toBe(true)
    expect(isAllowedPlayerName('Marie-Hélène')).toBe(true)
  })
})
