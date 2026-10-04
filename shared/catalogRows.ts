import { normalizeAnswer } from './answerMatching'
import { FEATURED_QUIZ_COUNT, NEW_QUIZ_COUNT } from './constants'
import { difficultyLevel } from './quizCatalog'
import type { QuizEntry } from './quizValidation'
import type { QuizGameType } from './types'

// Rangées et filtres du catalogue de l'hôte (spec 4.1). Logique pure : l'écran ne fait qu'afficher.

export type CatalogRowId = 'featured' | 'new' | 'easy' | 'experts'

export interface CatalogRow {
  id: CatalogRowId
  quizzes: QuizEntry[]
}

function byTitle(a: QuizEntry, b: QuizEntry): number {
  return a.title.localeCompare(b.title, 'fr')
}

// Thèmes présents, triés par ordre alphabétique : une puce par thème.
export function catalogThemes(entries: readonly QuizEntry[]): string[] {
  return [...new Set(entries.map((entry) => entry.theme))].sort((a, b) => a.localeCompare(b, 'fr'))
}

// Onglet du catalogue : quiz classiques ou blind tests.
export function filterByGameType(entries: readonly QuizEntry[], gameType: QuizGameType): QuizEntry[] {
  return entries.filter((entry) => entry.gameType === gameType)
}

// theme null : tous les thèmes.
export function filterByTheme(entries: readonly QuizEntry[], theme: string | null): QuizEntry[] {
  return entries.filter((entry) => theme === null || entry.theme === theme)
}

// Recherche par titre, sans tenir compte des majuscules, des accents ni de la ponctuation.
export function searchByTitle(entries: readonly QuizEntry[], query: string): QuizEntry[] {
  const needle = normalizeAnswer(query)
  return entries.filter((entry) => normalizeAnswer(entry.title).includes(needle)).sort(byTitle)
}

// Top 10 choisi à la main (featuredRank), du 1er au 10e.
export function featuredQuizzes(entries: readonly QuizEntry[]): QuizEntry[] {
  return entries
    .filter((entry) => entry.featuredRank !== undefined)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
    .slice(0, FEATURED_QUIZ_COUNT)
}

// Les plus récents d'abord ; une fiche sans date n'y figure pas.
export function newestQuizzes(entries: readonly QuizEntry[]): QuizEntry[] {
  return entries
    .filter((entry) => entry.addedAt !== '')
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || byTitle(a, b))
    .slice(0, NEW_QUIZ_COUNT)
}

export function easyQuizzes(entries: readonly QuizEntry[]): QuizEntry[] {
  return entries.filter((entry) => difficultyLevel(entry.difficulty) === 'easy').sort(byTitle)
}

// Difficiles, ou destinés aux experts.
export function expertQuizzes(entries: readonly QuizEntry[]): QuizEntry[] {
  return entries
    .filter((entry) => difficultyLevel(entry.difficulty) === 'hard' || entry.audience === 'experts')
    .sort(byTitle)
}

// Rangées affichées pour un thème, dans l'ordre de l'écran ; les rangées vides sont retirées.
export function catalogRows(entries: readonly QuizEntry[], theme: string | null): CatalogRow[] {
  const visible = filterByTheme(entries, theme)
  const rows: CatalogRow[] = [
    { id: 'featured', quizzes: featuredQuizzes(visible) },
    { id: 'new', quizzes: newestQuizzes(visible) },
    { id: 'easy', quizzes: easyQuizzes(visible) },
    { id: 'experts', quizzes: expertQuizzes(visible) },
  ]
  return rows.filter((row) => row.quizzes.length > 0)
}
