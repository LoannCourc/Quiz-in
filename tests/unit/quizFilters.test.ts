import { describe, expect, test } from 'vitest'

import type { QuizEntry } from '../../shared/quizValidation'
import {
  activeFilterCount,
  activeFilterKeys,
  effectiveSort,
  filterQuizzes,
  isFiltering,
  NO_QUIZ_FILTERS,
  removeFilter,
  type QuizFilters,
} from '../../shared/quizFilters'

function quiz(id: string, overrides: Partial<QuizEntry> = {}): QuizEntry {
  return {
    id,
    title: id,
    theme: 'Culture générale',
    gameType: 'quiz',
    questionCount: 10,
    difficulty: 2,
    description: '',
    audience: 'all',
    poster: 'pink',
    addedAt: '2026-09-01',
    ...overrides,
  } as QuizEntry
}

const QUIZZES = [
  quiz('Bravo', { level: 'hard', addedAt: '2026-10-01', featuredRank: 2 }),
  quiz('Alpha', { level: 'easy', addedAt: '2026-08-01', audience: 'kids' }),
  quiz('Charlie', { level: 'medium', addedAt: '2026-10-04', featuredRank: 1 }),
  quiz('Delta', { level: 'easy', addedAt: '2026-09-15', audience: 'experts' }),
]

const ids = (entries: QuizEntry[]) => entries.map((entry) => entry.id)
const with_ = (changes: Partial<QuizFilters>): QuizFilters => ({ ...NO_QUIZ_FILTERS, ...changes })

describe('Tri et filtres du catalogue Quiz (QT1)', () => {
  test('sans tri ni filtre : les rangées (pas de grille), « Filtres » sans nombre', () => {
    expect(isFiltering(NO_QUIZ_FILTERS)).toBe(false)
    expect(activeFilterCount(NO_QUIZ_FILTERS)).toBe(0)
  })

  test('Populaires : Top 10 manuel d’abord, puis les plus récents (comme le Bluff)', () => {
    expect(ids(filterQuizzes(QUIZZES, with_({ sort: 'popular' }), new Set()))).toEqual(['Charlie', 'Bravo', 'Delta', 'Alpha'])
  })

  test('Nouveautés : date d’ajout, du plus récent au plus ancien', () => {
    // Charlie 4 oct., Bravo 1er oct., Delta 15 sept., Alpha 1er août.
    expect(ids(filterQuizzes(QUIZZES, with_({ sort: 'new' }), new Set()))).toEqual(['Charlie', 'Bravo', 'Delta', 'Alpha'])
  })

  test('Plus faciles, Plus difficiles, A–Z', () => {
    expect(ids(filterQuizzes(QUIZZES, with_({ sort: 'easiest' }), new Set()))).toEqual(['Alpha', 'Delta', 'Charlie', 'Bravo'])
    expect(ids(filterQuizzes(QUIZZES, with_({ sort: 'hardest' }), new Set()))).toEqual(['Bravo', 'Charlie', 'Delta', 'Alpha'])
    expect(ids(filterQuizzes(QUIZZES, with_({ sort: 'alphabetical' }), new Set()))).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta'])
  })

  test('difficulté, public et « Cacher ceux déjà faits » se cumulent ; tri par défaut : Populaires', () => {
    const filters = with_({ level: 'easy', hidePlayed: true })
    expect(effectiveSort(filters)).toBe('popular')
    expect(ids(filterQuizzes(QUIZZES, filters, new Set(['Alpha'])))).toEqual(['Delta'])
    expect(ids(filterQuizzes(QUIZZES, with_({ audience: 'kids' }), new Set()))).toEqual(['Alpha'])
    expect(activeFilterCount(with_({ sort: 'new', level: 'easy', audience: 'all', hidePlayed: true }))).toBe(3)
  })

  test('le tri seul ouvre la grille sans compter comme filtre ; une croix retire un filtre', () => {
    expect(isFiltering(with_({ sort: 'alphabetical' }))).toBe(true)
    expect(activeFilterCount(with_({ sort: 'alphabetical' }))).toBe(0)
    const filters = with_({ level: 'hard', hidePlayed: true })
    expect(activeFilterKeys(removeFilter(filters, { kind: 'level' }))).toEqual([{ kind: 'hidePlayed' }])
    expect(activeFilterKeys(removeFilter(filters, { kind: 'hidePlayed' }))).toEqual([{ kind: 'level' }])
  })

  test('thèmes : filtrent la grille, une pastille par thème (« Tout » : une seule), retirables un à un', () => {
    const themed = [quiz('Ciné', { theme: 'Cinéma et séries' }), quiz('Sport', { theme: 'Sport' }), quiz('Histoire', { theme: 'Histoire' })]
    const filters = with_({ themes: ['Sport', 'Histoire'], sort: 'alphabetical' })
    expect(ids(filterQuizzes(themed, filters, new Set()))).toEqual(['Histoire', 'Sport'])
    expect(activeFilterCount(filters)).toBe(2)
    expect(activeFilterKeys(removeFilter(filters, { kind: 'theme', theme: 'Sport' }))).toEqual([{ kind: 'theme', theme: 'Histoire' }])

    const all = with_({ themes: 'all' })
    expect(isFiltering(all)).toBe(true)
    expect(activeFilterKeys(all)).toEqual([{ kind: 'theme', theme: null }])
    expect(filterQuizzes(themed, all, new Set())).toHaveLength(3)
    expect(isFiltering(removeFilter(all, { kind: 'theme', theme: null }))).toBe(false)
  })
})
