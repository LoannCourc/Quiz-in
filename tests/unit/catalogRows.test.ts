import { describe, expect, test } from 'vitest'

import {
  catalogRows,
  catalogThemes,
  easyQuizzes,
  expertQuizzes,
  featuredQuizzes,
  newestQuizzes,
  searchByTitle,
} from '../../shared/catalogRows'
import type { QuizEntry } from '../../shared/quizValidation'

function quiz(id: string, fields: Partial<QuizEntry> = {}): QuizEntry {
  return {
    id,
    title: id,
    theme: 'Culture générale',
    gameType: 'quiz',
    language: 'fr',
    difficulty: 2,
    difficultyLabel: 'Moyen',
    questionCount: 10,
    estimatedMinutes: 6,
    description: '',
    audience: 'all',
    poster: 'violet',
    addedAt: '',
    ...fields,
  }
}

const ids = (entries: QuizEntry[]) => entries.map((entry) => entry.id)

describe('catalogue', () => {
  test('thèmes distincts, triés', () => {
    const entries = [quiz('a', { theme: 'Sport' }), quiz('b', { theme: 'Cinéma' }), quiz('c', { theme: 'Sport' })]
    expect(catalogThemes(entries)).toEqual(['Cinéma', 'Sport'])
  })

  test('recherche sans majuscules ni accents', () => {
    const entries = [quiz('a', { title: 'Cinéma des années 90' }), quiz('b', { title: 'Géographie' })]
    expect(ids(searchByTitle(entries, 'CINEMA'))).toEqual(['a'])
    expect(ids(searchByTitle(entries, 'géo'))).toEqual(['b'])
  })

  test('Top 10 : ordre de featuredRank, sans les quiz non classés', () => {
    const entries = [quiz('a', { featuredRank: 3 }), quiz('b'), quiz('c', { featuredRank: 1 })]
    expect(ids(featuredQuizzes(entries))).toEqual(['c', 'a'])
  })

  test('Nouveautés : plus récents d’abord, sans les fiches non datées', () => {
    const entries = [quiz('a', { addedAt: '2026-09-01' }), quiz('b'), quiz('c', { addedAt: '2026-10-01' })]
    expect(ids(newestQuizzes(entries))).toEqual(['c', 'a'])
  })

  test('Faciles et Pour les experts', () => {
    const entries = [
      quiz('facile', { difficulty: 1.2 }),
      quiz('difficile', { difficulty: 2.6 }),
      quiz('experts', { difficulty: 2, audience: 'experts' }),
    ]
    expect(ids(easyQuizzes(entries))).toEqual(['facile'])
    expect(ids(expertQuizzes(entries))).toEqual(['difficile', 'experts'])
  })

  test('rangées filtrées par thème, rangées vides retirées', () => {
    const entries = [
      quiz('a', { theme: 'Sport', difficulty: 1, featuredRank: 1 }),
      quiz('b', { theme: 'Cinéma', difficulty: 3, addedAt: '2026-10-01' }),
    ]
    expect(catalogRows(entries, 'Sport').map((row) => row.id)).toEqual(['featured', 'easy'])
    expect(catalogRows(entries, null).map((row) => row.id)).toEqual(['featured', 'new', 'easy', 'experts'])
    expect(catalogRows(entries, 'Géo')).toEqual([])
  })
})
