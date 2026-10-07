import { describe, expect, test } from 'vitest'

import { normalizeAnswer } from '../../shared/answerMatching'
import { wordLetterCount } from '../../shared/drawGame'
import { judgeDrawGuess } from '../../shared/drawGuess'
import { DRAW_CATEGORIES, DRAW_WORDS } from '../../shared/drawWords'

// Contrôle de la liste des mots de Dessine-moi (lot 4) : lancé avec tous les tests unitaires.
const MIN_LETTERS = 3
const MAX_LETTERS = 14
const key = (text: string) => normalizeAnswer(text).replace(/[\s-]/g, '')

describe('Dessine-moi : liste des mots', () => {
  test('environ 200 mots, 12 catégories toutes représentées', () => {
    expect(DRAW_WORDS.length).toBeGreaterThanOrEqual(190)
    expect(DRAW_WORDS.length).toBeLessThanOrEqual(215)
    for (const category of DRAW_CATEGORIES) expect(DRAW_WORDS.some((entry) => entry.category === category)).toBe(true)
  })

  test('chaque mot a sa catégorie et son niveau ; 3 à 14 lettres (sans tirets ni espaces)', () => {
    for (const entry of DRAW_WORDS) {
      expect(DRAW_CATEGORIES, entry.word).toContain(entry.category)
      expect([1, 2, 3], entry.word).toContain(entry.difficulty)
      const letters = wordLetterCount(entry.word)
      expect(letters >= MIN_LETTERS && letters <= MAX_LETTERS, `${entry.word} : ${letters} lettres`).toBe(true)
      expect(entry.word, 'pas de « œ »').not.toMatch(/[œŒ]/)
    }
  })

  test('pas de doublon après normalisation (casse, accents, tirets)', () => {
    const seen = new Map<string, string>()
    for (const { word } of DRAW_WORDS) {
      expect(seen.get(key(word)), `${word} en double`).toBeUndefined()
      seen.set(key(word), word)
    }
  })

  test('aucune réponse acceptée n’est le mot d’une autre entrée (ni répétée)', () => {
    const words = new Set(DRAW_WORDS.map(({ word }) => key(word)))
    const accepted = new Set<string>()
    for (const entry of DRAW_WORDS) {
      for (const answer of entry.accepts ?? []) {
        expect(words.has(key(answer)), `${entry.word} accepte ${answer}`).toBe(false)
        expect(accepted.has(key(answer)), `${answer} accepté deux fois`).toBe(false)
        accepted.add(key(answer))
      }
    }
  })

  test('répartition des niveaux : environ 60 % faciles, 30 % moyens, 10 % difficiles', () => {
    const share = (level: number) => DRAW_WORDS.filter((entry) => entry.difficulty === level).length / DRAW_WORDS.length
    expect(share(1)).toBeGreaterThan(0.5)
    expect(share(1)).toBeLessThan(0.7)
    expect(share(2)).toBeGreaterThan(0.2)
    expect(share(2)).toBeLessThan(0.4)
    expect(share(3)).toBeGreaterThan(0.05)
    expect(share(3)).toBeLessThan(0.15)
  })

  test('mots composés : les lettres, pas les tirets ni les espaces', () => {
    expect(wordLetterCount('arc-en-ciel')).toBe(9)
    expect(wordLetterCount('brosse à dents')).toBe(12)
    expect(wordLetterCount('château de sable')).toBe(14)
  })
})

describe('Dessine-moi : jugement sur 10 mots de la liste', () => {
  test.each([
    ['voiture', 'voitures', 'found'],
    ['voiture', 'bagnole', 'found'],
    ['vélo', 'bicyclette', 'found'],
    ['éléphant', 'elephent', 'found'],
    ['éléphant', 'elefant', 'close'],
    ['pieuvre', 'poulpe', 'found'],
    ['télévision', 'téléviseur', 'found'],
    ['ciseaux', 'ciseau', 'found'],
    ['arc-en-ciel', 'arc en ciel', 'found'],
    ['hélicoptère', 'helico', 'found'],
    ['cheval', 'chevaux', 'found'],
    ['parapluie', 'paraplouje', 'close'],
    ['chat', 'chien', 'wrong'],
    ['pingouin', 'pin', 'close'],
  ])('%s : « %s » → %s', (word, guess, verdict) => {
    expect(judgeDrawGuess(guess, word)).toBe(verdict)
  })
})
