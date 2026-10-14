import { describe, expect, test } from 'vitest'

import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import { launchUpdate, selectGameQuestions } from '../../shared/hostEngine'
import {
  availableQuestionCounts,
  BLUFF_QUESTION_COUNTS,
  drawPoolQuestions,
  gameQuestionCount,
  isValidQuestionId,
  parseQuestionRef,
  poolOf,
  poolQuestionTotal,
  poolQuizzes,
  QUIZ_QUESTION_COUNTS,
  questionRef,
  withPool,
} from '../../shared/questionPool'
import { PUBLIC_SESSION_FIELDS } from '../../shared/publicFields'
import type { QuizEntry } from '../../shared/quizValidation'
import { makeSession, player, QUESTIONS } from './engineFixtures'

function entry(id: string, theme: string, gameType: QuizEntry['gameType'] = 'quiz', questionCount = 10): QuizEntry {
  return {
    id,
    title: id,
    theme,
    gameType,
    language: 'fr',
    difficulty: 1,
    difficultyLabel: 'Facile',
    questionCount,
    estimatedMinutes: 6,
    description: '',
    audience: 'all',
    poster: 'pink',
    addedAt: '',
  }
}

const CATALOG = [
  entry('cg-1', 'Culture générale'),
  entry('cg-2', 'Culture générale'),
  entry('histoire', 'Histoire'),
  entry('bluff-histoire', 'Histoire', 'bluff'),
  entry('bluff-betes', 'Sciences et nature', 'bluff'),
]

describe('Ensemble de questions', () => {
  test('réglages : thèmes ou mélange, et nombre de questions ; rien : un quiz seul, 10 questions', () => {
    expect(poolOf(DEFAULT_SESSION_SETTINGS)).toBeNull()
    expect(gameQuestionCount(DEFAULT_SESSION_SETTINGS)).toBe(10)
    const themes = withPool(DEFAULT_SESSION_SETTINGS, { kind: 'themes', themes: ['Histoire'] }, 20)
    expect(poolOf(themes)).toEqual({ kind: 'themes', themes: ['Histoire'] })
    expect(gameQuestionCount(themes)).toBe(20)
    // Passer d'un ensemble à l'autre ne garde pas l'ancien.
    const mix = withPool(themes, { kind: 'mix', quizIds: ['bluff-betes'] }, 15)
    expect(mix).not.toHaveProperty('themes')
    expect(poolOf(mix)).toEqual({ kind: 'mix', quizIds: ['bluff-betes'] })
  })

  test('quiz d’un ensemble : thèmes du même jeu seulement, ou quiz choisis', () => {
    expect(poolQuizzes(CATALOG, { kind: 'themes', themes: ['Histoire'] }, 'quiz').map((quiz) => quiz.id)).toEqual(['histoire'])
    expect(poolQuizzes(CATALOG, { kind: 'mix', quizIds: ['bluff-betes', 'bluff-histoire'] }, 'bluff').map((quiz) => quiz.id)).toEqual([
      'bluff-histoire',
      'bluff-betes',
    ])
  })

  test('options impossibles grisées selon le total', () => {
    const culture = poolQuizzes(CATALOG, { kind: 'themes', themes: ['Culture générale'] }, 'quiz')
    expect(poolQuestionTotal(culture)).toBe(20)
    expect(availableQuestionCounts(QUIZ_QUESTION_COUNTS, 20)).toEqual([10, 20])
    expect(availableQuestionCounts(BLUFF_QUESTION_COUNTS, 10)).toEqual([10])
  })

  test('identifiant d’une question : « quizId/questionId »', () => {
    expect(questionRef('cg-1', 'q3')).toBe('cg-1/q3')
    expect(parseQuestionRef('cg-1/q3')).toEqual({ quizId: 'cg-1', questionId: 'q3' })
    expect(parseQuestionRef('sans-question/')).toBeNull()
  })
})

describe('questionRefs : des identifiants seulement', () => {
  test('format des identifiants de questions du contenu', () => {
    expect(isValidQuestionId('hf2-01')).toBe(true)
    expect(isValidQuestionId('Mercure')).toBe(false)
    expect(isValidQuestionId('la planète Mercure')).toBe(false)
    expect(isValidQuestionId('q1/0')).toBe(false)
  })

  test('un tirage ne contient que des « quizId/questionId » pris dans l’ensemble', () => {
    const candidates = ['cg-1', 'cg-2'].flatMap((quizId) => ['q1', 'q2', 'q3'].map((id) => questionRef(quizId, id)))
    const drawn = drawPoolQuestions(candidates, {}, 4)
    for (const ref of drawn) {
      expect(candidates).toContain(ref)
      expect(ref).toMatch(/^[a-z0-9-]{1,64}\/[a-z0-9-]{1,32}$/)
    }
  })

  test('jamais un champ public de la session', () => {
    expect(PUBLIC_SESSION_FIELDS).not.toContain('questionRefs')
  })
})

describe('Tirage', () => {
  const refs = ['a/1', 'a/2', 'a/3', 'b/1', 'b/2']

  test('jamais jouées d’abord', () => {
    const drawn = drawPoolQuestions(refs, { 'a/1': 100, 'a/2': 200 }, 3)
    expect(drawn.sort()).toEqual(['a/3', 'b/1', 'b/2'])
  })

  test('s’il en manque : les plus anciennement jouées', () => {
    const drawn = drawPoolQuestions(refs, { 'a/1': 300, 'a/2': 100, 'a/3': 200, 'b/1': 400 }, 3)
    expect(drawn.sort()).toEqual(['a/2', 'a/3', 'b/2'])
  })

  test('jamais plus que l’ensemble, sans doublon', () => {
    const drawn = drawPoolQuestions(refs, {}, 30)
    expect(drawn).toHaveLength(5)
    expect(new Set(drawn).size).toBe(5)
  })
})

describe('Nombre de questions au lancement', () => {
  test('le nombre choisi est lancé, au plus 30', () => {
    const many = Array.from({ length: 40 }, (_, index) => ({ ...QUESTIONS[0], id: `q${index}` }))
    expect(selectGameQuestions(many, 30)).toHaveLength(30)
    expect(selectGameQuestions(many, 50)).toHaveLength(30)
    const session = makeSession({
      players: { host: player('Hôte'), p2: player('Léa') },
      settings: withPool(makeSession().settings, { kind: 'themes', themes: ['Histoire'] }, 20),
    })
    const launch = launchUpdate(session, many, 0)
    expect(launch.ok && launch.update.questionCount).toBe(20)
  })
})
