import { describe, expect, test } from 'vitest'

import { isAnswerCorrect, normalizeAnswer } from '../../shared/answerMatching'

describe('normalizeAnswer', () => {
  test('minuscules et sans accents', () => {
    expect(normalizeAnswer('ÉLÉPHANT')).toBe('elephant')
    expect(normalizeAnswer('Ça glisse')).toBe('ca glisse')
  })

  test('œ et æ écrits en deux lettres', () => {
    expect(normalizeAnswer('Cœur')).toBe('coeur')
  })

  test('ponctuation et espaces superflus retirés', () => {
    expect(normalizeAnswer('  Saint-Exupéry !  ')).toBe('saint exupery')
  })

  test('article initial retiré, y compris avec apostrophe typographique', () => {
    expect(normalizeAnswer("L'Everest")).toBe('everest')
    expect(normalizeAnswer('L’Everest')).toBe('everest')
    expect(normalizeAnswer('Les Misérables')).toBe('miserables')
    expect(normalizeAnswer("de l'eau")).toBe('eau')
    expect(normalizeAnswer('Un chat')).toBe('chat')
  })

  test("un mot qui commence comme un article n'est pas coupé", () => {
    expect(normalizeAnswer('Lune')).toBe('lune')
    expect(normalizeAnswer('Leonard')).toBe('leonard')
    expect(normalizeAnswer('de Gaulle')).toBe('de gaulle')
  })

  test("une réponse qui n'est qu'un article est gardée", () => {
    expect(normalizeAnswer('La')).toBe('la')
  })
})

describe('isAnswerCorrect', () => {
  test('« L’Everest » contre « everest »', () => {
    expect(isAnswerCorrect("L'Everest", ['everest'])).toBe(true)
  })

  test('accents et majuscules ignorés', () => {
    expect(isAnswerCorrect('MERCURE', ['mercure'])).toBe(true)
    expect(isAnswerCorrect('venus', ['Vénus'])).toBe(true)
  })

  test('réponse vide ou faite de ponctuation refusée', () => {
    expect(isAnswerCorrect('', ['mercure'])).toBe(false)
    expect(isAnswerCorrect('   ', ['mercure'])).toBe(false)
    expect(isAnswerCorrect('?!', ['mercure'])).toBe(false)
  })

  test('une faute tolérée à partir de 5 lettres', () => {
    expect(isAnswerCorrect('mercur', ['mercure'])).toBe(true)
    expect(isAnswerCorrect('mrecure', ['mercure'])).toBe(true)
    expect(isAnswerCorrect('mercuer', ['mercure'])).toBe(true)
    expect(isAnswerCorrect('paris', ['parus'])).toBe(true)
  })

  test('deux fautes refusées', () => {
    expect(isAnswerCorrect('mrecuer', ['mercure'])).toBe(false)
  })

  test('aucune faute tolérée sous 5 lettres', () => {
    expect(isAnswerCorrect('mars', ['mars'])).toBe(true)
    expect(isAnswerCorrect('mers', ['mars'])).toBe(false)
    expect(isAnswerCorrect('nil', ['nul'])).toBe(false)
  })

  test("n'importe laquelle des réponses acceptées suffit", () => {
    expect(isAnswerCorrect('Jupiter', ['mars', 'jupiter'])).toBe(true)
  })

  test('mauvaise réponse refusée', () => {
    expect(isAnswerCorrect('Vénus', ['mercure'])).toBe(false)
  })
})
