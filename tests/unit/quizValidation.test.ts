import { describe, expect, test } from 'vitest'

import { parseQuestion, parseQuestions, parseQuizCatalog, parseQuizSummary } from '../../shared/quizValidation'

const summary = {
  title: 'Culture générale 1',
  theme: 'Culture générale',
  gameType: 'quiz',
  language: 'fr',
  difficulty: 1.8,
  difficultyLabel: 'Moyen',
  questionCount: 10,
  estimatedMinutes: 8,
}

const question = {
  id: 'q-0001',
  text: 'Quelle planète est la plus proche du Soleil ?',
  options: ['Mars', 'Mercure', 'Vénus', 'La Terre'],
  correctIndex: 1,
  acceptedAnswers: ['mercure'],
  difficulty: 1,
}

describe('parseQuizSummary', () => {
  test('fiche complète acceptée, sans champ inconnu', () => {
    expect(parseQuizSummary({ ...summary, extra: 'x' })).toEqual(summary)
  })

  test('fiche sans titre, avec un mauvais type ou qui n’est pas un objet : refusée', () => {
    const { title: _title, ...withoutTitle } = summary
    expect(parseQuizSummary(withoutTitle)).toBeNull()
    expect(parseQuizSummary({ ...summary, title: '' })).toBeNull()
    expect(parseQuizSummary({ ...summary, difficulty: '2' })).toBeNull()
    expect(parseQuizSummary({ ...summary, gameType: 'blindtest' })).toBeNull()
    expect(parseQuizSummary('quiz')).toBeNull()
    expect(parseQuizSummary(null)).toBeNull()
  })
})

describe('parseQuizCatalog', () => {
  test('garde les fiches valides et compte les autres', () => {
    const { title: _title, ...withoutTitle } = summary
    const result = parseQuizCatalog({ 'quiz-a': summary, 'quiz-b': withoutTitle, 'quiz-c': 42 })
    expect(result.valid).toEqual([{ id: 'quiz-a', ...summary }])
    expect(result.ignoredCount).toBe(2)
  })

  test('identifiant de quiz invalide ignoré', () => {
    expect(parseQuizCatalog({ 'Quiz A': summary })).toEqual({ valid: [], ignoredCount: 1 })
  })

  test('nœud absent : liste vide, rien d’ignoré', () => {
    expect(parseQuizCatalog(null)).toEqual({ valid: [], ignoredCount: 0 })
  })

  test('nœud qui est une chaîne ou un nombre : liste vide, une entrée ignorée', () => {
    expect(parseQuizCatalog('quizzes')).toEqual({ valid: [], ignoredCount: 1 })
    expect(parseQuizCatalog(3)).toEqual({ valid: [], ignoredCount: 1 })
  })
})

describe('parseQuestion', () => {
  test('question complète acceptée, champs optionnels conservés', () => {
    expect(parseQuestion(question)).toEqual(question)
    const full = { ...question, explanation: 'Environ 58 millions de km.', timeLimit: 15 }
    expect(parseQuestion(full)).toEqual(full)
  })

  test('question mal formée refusée', () => {
    expect(parseQuestion({ ...question, text: undefined })).toBeNull()
    expect(parseQuestion({ ...question, options: ['a', 'b', 'c'] })).toBeNull()
    expect(parseQuestion({ ...question, options: ['a', 'b', 'c', ''] })).toBeNull()
    expect(parseQuestion({ ...question, correctIndex: 4 })).toBeNull()
    expect(parseQuestion({ ...question, correctIndex: 1.5 })).toBeNull()
    expect(parseQuestion({ ...question, acceptedAnswers: [] })).toBeNull()
    expect(parseQuestion({ ...question, difficulty: 4 })).toBeNull()
    expect(parseQuestion({ ...question, timeLimit: 0 })).toBeNull()
    expect(parseQuestion({ ...question, explanation: 12 })).toBeNull()
    expect(parseQuestion('question')).toBeNull()
  })
})

describe('parseQuestions', () => {
  test('tableau : questions valides dans l’ordre, invalides comptées', () => {
    const second = { ...question, id: 'q-0002' }
    const result = parseQuestions([question, { id: 'cassée' }, second])
    expect(result.valid.map((q) => q.id)).toEqual(['q-0001', 'q-0002'])
    expect(result.ignoredCount).toBe(1)
  })

  test('objet à clés numériques (tableau à trous) : remis dans l’ordre des index', () => {
    const result = parseQuestions({ 10: { ...question, id: 'q-10' }, 2: { ...question, id: 'q-2' } })
    expect(result.valid.map((q) => q.id)).toEqual(['q-2', 'q-10'])
    expect(result.ignoredCount).toBe(0)
  })

  test('clé non numérique ignorée', () => {
    expect(parseQuestions({ intro: question }).ignoredCount).toBe(1)
  })

  test('nœud absent ou chaîne', () => {
    expect(parseQuestions(null)).toEqual({ valid: [], ignoredCount: 0 })
    expect(parseQuestions('questions')).toEqual({ valid: [], ignoredCount: 1 })
  })
})
