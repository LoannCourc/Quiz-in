import type { QuizEntry } from './quizValidation'
import { quizLevel } from './quizCatalog'
import type { BlindTestDecade, BlindTestGenre, DifficultyLevel } from './types'

// Catalogue du Blind test (maquette BT5) : onglets Genre / Années / Difficulté en tuiles avec leur compteur,
// puis une liste filtrée. Tout est calculé dans l'app à partir des fiches (aucun compteur stocké).

export const BLIND_TEST_GENRES: readonly BlindTestGenre[] = ['pop', 'rock', 'rap', 'chanson', 'discoFunk', 'electro']
export const BLIND_TEST_DECADES: readonly BlindTestDecade[] = [1960, 1970, 1980, 1990, 2000, 2010, 2020, 'all']
export const BLIND_TEST_LEVELS: readonly DifficultyLevel[] = ['easy', 'medium', 'hard', 'impossible']

export function isBlindTestGenre(value: unknown): value is BlindTestGenre {
  return typeof value === 'string' && (BLIND_TEST_GENRES as readonly string[]).includes(value)
}

export function isBlindTestDecade(value: unknown): value is BlindTestDecade {
  return (BLIND_TEST_DECADES as readonly unknown[]).includes(value)
}

export type BlindTestTab = 'genre' | 'decade' | 'level'

// Une tuile (ou un filtre) : une valeur d'un onglet.
export type BlindTestFacet =
  | { tab: 'genre'; value: BlindTestGenre }
  | { tab: 'decade'; value: BlindTestDecade }
  | { tab: 'level'; value: DifficultyLevel }

export interface BlindTestTile {
  facet: BlindTestFacet
  count: number
  playedCount: number
}

export function matchesFacet(entry: QuizEntry, facet: BlindTestFacet): boolean {
  if (facet.tab === 'genre') return entry.genre === facet.value
  if (facet.tab === 'decade') return entry.decade === facet.value
  return quizLevel(entry) === facet.value
}

function facetsOf(tab: BlindTestTab): BlindTestFacet[] {
  if (tab === 'genre') return BLIND_TEST_GENRES.map((value) => ({ tab, value }))
  if (tab === 'decade') return BLIND_TEST_DECADES.map((value) => ({ tab, value }))
  return BLIND_TEST_LEVELS.map((value) => ({ tab, value }))
}

// Tuiles d'un onglet, dans l'ordre fixe, seulement celles qui ont au moins un blind test (« Impossible »,
// « Électro »… n'apparaissent que lorsqu'ils ont du contenu).
export function blindTestTiles(entries: readonly QuizEntry[], tab: BlindTestTab, played: ReadonlySet<string>): BlindTestTile[] {
  return facetsOf(tab)
    .map((facet) => {
      const matching = entries.filter((entry) => matchesFacet(entry, facet))
      return { facet, count: matching.length, playedCount: matching.filter((entry) => played.has(entry.id)).length }
    })
    .filter((tile) => tile.count > 0)
}

// Filtres de la liste : la tuile choisie, puis des filtres en plus (genres, niveaux), chacun en « ou »
// à l'intérieur de son groupe et en « et » entre les groupes. Un groupe vide ne filtre rien.
export interface BlindTestFilters {
  facet: BlindTestFacet
  genres: readonly BlindTestGenre[]
  levels: readonly DifficultyLevel[]
}

export function filterBlindTests(entries: readonly QuizEntry[], filters: BlindTestFilters): QuizEntry[] {
  return entries.filter(
    (entry) =>
      matchesFacet(entry, filters.facet) &&
      (filters.genres.length === 0 || (entry.genre !== undefined && filters.genres.includes(entry.genre))) &&
      (filters.levels.length === 0 || filters.levels.includes(quizLevel(entry))),
  )
}

// Choix proposés dans un filtre en plus : seulement ceux qui ont du contenu parmi la tuile choisie.
export function availableGenres(entries: readonly QuizEntry[], facet: BlindTestFacet): BlindTestGenre[] {
  const inFacet = entries.filter((entry) => matchesFacet(entry, facet))
  return BLIND_TEST_GENRES.filter((genre) => inFacet.some((entry) => entry.genre === genre))
}

export function availableLevels(entries: readonly QuizEntry[], facet: BlindTestFacet): DifficultyLevel[] {
  const inFacet = entries.filter((entry) => matchesFacet(entry, facet))
  return BLIND_TEST_LEVELS.filter((level) => inFacet.some((entry) => quizLevel(entry) === level))
}

// Points de difficulté (1 à 4) d'un niveau.
export function levelDots(level: DifficultyLevel): number {
  return BLIND_TEST_LEVELS.indexOf(level) + 1
}
