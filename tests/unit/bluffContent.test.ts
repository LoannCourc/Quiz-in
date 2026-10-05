import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { bluffQuestionErrors, bluffQuestionWarnings, toBluffQuestion } from '../../content/scripts/bluffContent'
import { checkBluff } from '../../shared/bluff'
import { parseBluffQuestion, parseBluffQuestions, parseQuizSummary } from '../../shared/quizValidation'
import type { BluffQuestion } from '../../shared/types'
import { makeBluffQuestion } from './engineFixtures'

const BLUFF_QUIZZES = ['bluff-culture-generale', 'bluff-sciences-nature']

function contentQuestions(quizId: string): BluffQuestion[] {
  const file = JSON.parse(readFileSync(new URL(`../../content/quizzes/${quizId}.json`, import.meta.url), 'utf8'))
  expect(file.gameType).toBe('bluff')
  return file.questions as BluffQuestion[]
}

describe('Bluff : contrôles du contenu (build)', () => {
  test('question valide : aucune erreur', () => {
    expect(bluffQuestionErrors(makeBluffQuestion(0))).toEqual([])
  })

  test('2 ou 3 leurres, 100 caractères au plus, pas de champ des questions classiques', () => {
    expect(bluffQuestionErrors(makeBluffQuestion(0, { decoys: ['Seul'] }))).toContain('decoys : de 2 à 3 leurres')
    expect(bluffQuestionErrors(makeBluffQuestion(0, { decoys: ['A', 'B', 'C', 'D'] }))).toContain('decoys : de 2 à 3 leurres')
    expect(bluffQuestionErrors(makeBluffQuestion(0, { answer: 'x'.repeat(101) }))).toContain('answer vide ou > 100 caractères')
    const withOptions = { ...makeBluffQuestion(0), options: ['a', 'b', 'c', 'd'] } as unknown as BluffQuestion
    expect(bluffQuestionErrors(withOptions)).toContain("options : champ des questions classiques, absent d'un Bluff")
  })

  test('leurre qui vaut la vraie réponse, leurre en double ou mot interdit : refusés', () => {
    const errors = bluffQuestionErrors(makeBluffQuestion(0, { decoys: ['landlords gaem', 'Merde alors', 'merde alors !'] }))
    expect(errors).toContain('le leurre « landlords gaem » vaut la vraie réponse')
    expect(errors).toContain('le leurre « Merde alors » contient un mot interdit')
    expect(errors).toContain('leurre en double : « merde alors ! »')
  })

  test('leurre très ressemblant : simple avertissement', () => {
    expect(bluffQuestionWarnings(makeBluffQuestion(0, { decoys: ['Landlord', 'Capital Express'] }))).toHaveLength(1)
  })

  test('question importée : seulement les champs connus', () => {
    const imported = toBluffQuestion({ ...makeBluffQuestion(0), reviewNote: 'x' } as unknown as BluffQuestion)
    expect(Object.keys(imported).sort()).toEqual(['acceptedAnswers', 'answer', 'decoys', 'difficulty', 'explanation', 'id', 'text'])
  })
})

describe('Bluff : lecture depuis la base', () => {
  test('question valide lue ; liste vide d’écritures acceptées absente de la base', () => {
    const { acceptedAnswers: _accepted, ...stored } = makeBluffQuestion(0)
    expect(parseBluffQuestion(stored)).toEqual({ ...makeBluffQuestion(0), acceptedAnswers: [] })
  })

  test('mal formée (leurres manquants ou trop nombreux, réponse trop longue) : ignorée', () => {
    expect(parseBluffQuestion({ ...makeBluffQuestion(0), decoys: ['Seul'] })).toBeNull()
    expect(parseBluffQuestion({ ...makeBluffQuestion(0), answer: 'x'.repeat(101) })).toBeNull()
    expect(parseBluffQuestions([makeBluffQuestion(0), { text: 'incomplète' }])).toEqual({ valid: [makeBluffQuestion(0)], ignoredCount: 1 })
  })

  test('fiche d’un quiz Bluff acceptée dans le catalogue', () => {
    const summary = { title: 'Bluff', theme: 'Culture générale', gameType: 'bluff', language: 'fr', difficulty: 2, difficultyLabel: 'Moyen', questionCount: 10, estimatedMinutes: 15 }
    expect(parseQuizSummary(summary)?.gameType).toBe('bluff')
  })
})

describe('Bluff : quiz du contenu', () => {
  test.each(BLUFF_QUIZZES)('%s : 10 questions valides, dont chaque leurre est une proposition acceptable', (quizId) => {
    const questions = contentQuestions(quizId)
    expect(questions).toHaveLength(10)
    for (const question of questions) {
      expect(bluffQuestionErrors(question)).toEqual([])
      expect(checkBluff(question.answer, question)).toBe('truth')
      for (const decoy of question.decoys) expect(checkBluff(decoy, question)).toBe('ok')
    }
  })
})
