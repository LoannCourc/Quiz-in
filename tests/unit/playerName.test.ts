import { describe, expect, test } from 'vitest'

import { NAME_MIN_SCALE, playerNameScale } from '../../shared/playerName'

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
