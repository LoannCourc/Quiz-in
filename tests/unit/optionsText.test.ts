import { describe, expect, test } from 'vitest'

import { OPTION_TEXT_MAX_LENGTH } from '../../shared/constants'
import { longestOptionLength, optionsTextSize } from '../../shared/optionsText'

// Seuils de la TV et du téléphone (receiver/src/lib/optionsSize.ts, ChoicePill).
const TV = { normalMax: 22, longMax: 40 }
const PHONE = { normalMax: 30, longMax: 60 }

const LONGEST = 'Melbourne, grande ville du Victoria, capitale fédérale provisoire de 1901 à 1927'
const ONE_LONG = ['Sydney', 'Canberra', LONGEST, 'Perth']

describe('Taille commune du texte des propositions', () => {
  test('la proposition de référence fait la longueur maximale autorisée', () => {
    expect(LONGEST.length).toBe(OPTION_TEXT_MAX_LENGTH)
  })

  test('une seule proposition de 80 caractères parmi trois courtes impose sa taille à toutes', () => {
    expect(longestOptionLength(ONE_LONG)).toBe(80)
    expect(optionsTextSize(ONE_LONG, TV)).toBe('veryLong')
    expect(optionsTextSize(ONE_LONG, PHONE)).toBe('veryLong')
  })

  test('taille normale si toutes les propositions sont courtes', () => {
    const options = ['Sydney', 'Canberra', 'Melbourne', 'Perth']
    expect(optionsTextSize(options, TV)).toBe('normal')
    expect(optionsTextSize(options, PHONE)).toBe('normal')
  })

  test('les seuils sont inclusifs', () => {
    expect(optionsTextSize(['a'.repeat(22)], TV)).toBe('normal')
    expect(optionsTextSize(['a'.repeat(23)], TV)).toBe('long')
    expect(optionsTextSize(['a'.repeat(40)], TV)).toBe('long')
    expect(optionsTextSize(['a'.repeat(41)], TV)).toBe('veryLong')
    expect(optionsTextSize(['a'.repeat(31), 'b'], PHONE)).toBe('long')
  })

  test('liste vide : taille normale', () => {
    expect(longestOptionLength([])).toBe(0)
    expect(optionsTextSize([], TV)).toBe('normal')
  })
})
