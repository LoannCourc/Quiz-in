import { byEasiest, byNewest, byPopular, byTitle, NO_THEME, toggleTheme, type ThemeSelection } from './catalogRows'
import { quizLevel } from './quizCatalog'
import type { QuizEntry } from './quizValidation'
import type { DifficultyLevel, QuizAudience } from './types'

// Tri et filtres du catalogue Quiz (maquette QT1), réglés dans la feuille « Trier et filtrer ». Sans tri ni
// filtre, l'écran garde les rangées (S2) ; sinon, une grille dans l'ordre du tri. Les thèmes choisis servent
// aussi au mélange de thèmes (barre « Nombre de questions »).

// Même vocabulaire que le Bluff (Populaires, Nouveautés, A–Z). « Plus courts » : absent tant que tous les
// quiz font 10 questions.
export type QuizSortId = 'popular' | 'new' | 'easiest' | 'hardest' | 'alphabetical'

export const QUIZ_SORTS: readonly QuizSortId[] = ['popular', 'new', 'easiest', 'hardest', 'alphabetical']

// Tri de la grille quand seul un filtre est choisi.
export const DEFAULT_QUIZ_SORT: QuizSortId = 'popular'

// Niveaux d'un quiz classique (« Impossible » : blind tests seulement).
export type QuizLevel = Extract<DifficultyLevel, 'easy' | 'medium' | 'hard'>

export const QUIZ_LEVELS: readonly QuizLevel[] = ['easy', 'medium', 'hard']

export const QUIZ_AUDIENCES: readonly QuizAudience[] = ['all', 'kids', 'experts']

export interface QuizFilters {
  // null : aucun tri choisi.
  sort: QuizSortId | null
  level: QuizLevel | null
  audience: QuizAudience | null
  hidePlayed: boolean
  // Thèmes choisis (« Tout » : tous) ; aucun : pas de filtre.
  themes: ThemeSelection
}

export const NO_QUIZ_FILTERS: QuizFilters = { sort: null, level: null, audience: null, hidePlayed: false, themes: NO_THEME }

// Filtre retirable d'un appui (pastille avec une croix) ; le tri n'en est pas un. Un thème choisi a sa propre
// pastille (theme null : « Tout »).
export type QuizFilterKey = { kind: 'level' } | { kind: 'audience' } | { kind: 'hidePlayed' } | { kind: 'theme'; theme: string | null }

export function activeFilterKeys(filters: QuizFilters): QuizFilterKey[] {
  const keys: QuizFilterKey[] = []
  if (filters.themes === 'all') keys.push({ kind: 'theme', theme: null })
  else keys.push(...filters.themes.map((theme) => ({ kind: 'theme' as const, theme })))
  if (filters.level !== null) keys.push({ kind: 'level' })
  if (filters.audience !== null) keys.push({ kind: 'audience' })
  if (filters.hidePlayed) keys.push({ kind: 'hidePlayed' })
  return keys
}

// Bouton « Filtres · N » : une unité par pastille.
export function activeFilterCount(filters: QuizFilters): number {
  return activeFilterKeys(filters).length
}

// Grille à la place des rangées : un tri ou au moins un filtre.
export function isFiltering(filters: QuizFilters): boolean {
  return filters.sort !== null || activeFilterCount(filters) > 0
}

export function removeFilter(filters: QuizFilters, key: QuizFilterKey): QuizFilters {
  switch (key.kind) {
    case 'theme':
      return { ...filters, themes: toggleTheme(filters.themes, key.theme) }
    case 'hidePlayed':
      return { ...filters, hidePlayed: false }
    default:
      return { ...filters, [key.kind]: null }
  }
}

// Tri affiché (« X quiz · triés par Y ») : le choisi, sinon Populaires.
export function effectiveSort(filters: QuizFilters): QuizSortId {
  return filters.sort ?? DEFAULT_QUIZ_SORT
}

const COMPARATORS: Record<QuizSortId, (a: QuizEntry, b: QuizEntry) => number> = {
  popular: byPopular,
  new: byNewest,
  easiest: byEasiest,
  hardest: (a, b) => byEasiest(b, a),
  alphabetical: byTitle,
}

// Quiz de la grille : filtres, puis tri. played : quiz déjà lancés sur ce téléphone.
export function filterQuizzes(entries: readonly QuizEntry[], filters: QuizFilters, played: ReadonlySet<string>): QuizEntry[] {
  const themes = filters.themes
  return entries
    .filter((entry) => themes === 'all' || themes.length === 0 || themes.includes(entry.theme))
    .filter((entry) => filters.level === null || quizLevel(entry) === filters.level)
    .filter((entry) => filters.audience === null || entry.audience === filters.audience)
    .filter((entry) => !filters.hidePlayed || !played.has(entry.id))
    .sort(COMPARATORS[effectiveSort(filters)])
}
