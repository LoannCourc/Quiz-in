import { describe, expect, test } from 'vitest'

import { normalizeAnswer } from '../../shared/answerMatching'
import { drawGameQuestions, wordLetterCount } from '../../shared/drawGame'
import { judgeDrawGuess } from '../../shared/drawGuess'
import { DRAW_CATEGORIES, DRAW_WORDS, drawAnswers, drawCategoryId, drawWordsIn } from '../../shared/drawWords'

// Contrôle de la liste des mots de Dessine-moi (lot 4) : lancé avec tous les tests unitaires.
const MIN_LETTERS = 3
// « navette spatiale » : 15 lettres.
const MAX_LETTERS = 15
// Nombre de mots par thème : 30 ajoutés à chacun (novembre 2026), « maison » retiré du thème Maison.
const WORDS_PER_CATEGORY: Record<(typeof DRAW_CATEGORIES)[number], number> = {
  Animal: 58,
  Nourriture: 56,
  Objet: 54,
  Maison: 46,
  Nature: 47,
  Lieu: 46,
  Transport: 45,
  Métier: 42,
  Sport: 43,
  Loisir: 45,
  Vêtement: 45,
  Corps: 42,
}
// Paires d'anciens mots acceptés l'un pour l'autre (une faute tolérée dès 5 lettres), connues et laissées telles
// quelles : (essai) → (mot). Aucune nouvelle paire n'est admise.
const KNOWN_CLOSE_PAIRS = [
  'bateau → gâteau',
  'gâteau → bateau',
  'bouche → douche',
  'douche → bouche',
  'chapeau → château',
  'château → chapeau',
  'ciseaux → oiseau',
  'oiseau → ciseaux',
  'manteau → marteau',
  'marteau → manteau',
  'tête → tente',
]
// Sans casse, accents, article, tirets ni espaces, sans pluriel.
const key = (text: string) => normalizeAnswer(text).replace(/[\s-]/g, '').replace(/[sx]$/, '')

describe('Dessine-moi : liste des mots', () => {
  test('569 mots, 12 catégories, le bon nombre de mots par thème', () => {
    expect(DRAW_WORDS).toHaveLength(569)
    expect(DRAW_CATEGORIES).toHaveLength(12)
    for (const category of DRAW_CATEGORIES) {
      expect(DRAW_WORDS.filter((entry) => entry.category === category).length, category).toBe(WORDS_PER_CATEGORY[category])
    }
  })

  test('« maison » n’est plus à deviner ; le thème Maison reste', () => {
    expect(DRAW_WORDS.some(({ word }) => key(word) === 'maison')).toBe(false)
    expect(DRAW_CATEGORIES).toContain('Maison')
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

  test('pas de doublon après normalisation (casse, accents, tirets, pluriel)', () => {
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

  test('tolérance aux fautes : aucune nouvelle réponse d’un autre mot acceptée (« musée » pour « fusée »)', () => {
    const wrong: string[] = []
    for (const { word } of DRAW_WORDS) {
      for (const other of DRAW_WORDS) {
        if (other.word === word) continue
        for (const guess of drawAnswers(other.word)) {
          if (judgeDrawGuess(guess, word) === 'found') wrong.push(`${guess} → ${word}`)
        }
      }
    }
    expect(wrong.sort()).toEqual([...KNOWN_CLOSE_PAIRS].sort())
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

describe('Dessine-moi : tirage des mots', () => {
  const CODES = ['ABCD', 'K7TM', 'ZZZZ', 'QW23', 'MNPR']

  const expectValidRounds = (code: string, count: number, categories: string[]) => {
    const questions = drawGameQuestions(code, count, categories)
    expect(questions).toHaveLength(count)
    expect(new Set(questions.map(({ word }) => word)).size).toBe(count)
    for (const question of questions) {
      expect(question.word.trim(), code).not.toBe('')
      expect(DRAW_CATEGORIES).toContain(question.category)
    }
    expect(questions[0].difficulty).toBe(1)
    return questions
  }

  test.each([4, 6, 8])('mélange, %i manches : mots remplis, sans répétition, première manche facile', (count) => {
    for (const code of CODES) expectValidRounds(code, count, [])
  })

  test('chaque thème seul : aucun thème vide, mots du thème, 8 manches possibles', () => {
    for (const category of DRAW_CATEGORIES) {
      const id = drawCategoryId(category)
      expect(drawWordsIn([id]).length, category).toBeGreaterThan(0)
      for (const code of CODES) {
        for (const question of expectValidRounds(code, 8, [id])) expect(question.category).toBe(category)
      }
    }
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
    ['frigo', 'réfrigérateur', 'found'],
    ['tongs', 'tong', 'found'],
    ['navette spatiale', 'navette', 'close'],
  ])('%s : « %s » → %s', (word, guess, verdict) => {
    expect(judgeDrawGuess(guess, word)).toBe(verdict)
  })
})
