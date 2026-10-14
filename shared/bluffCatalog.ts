import { catalogThemes, filterByGameType, searchByTitle } from './catalogRows'
import type { QuizEntry } from './quizValidation'

// Catalogue du Bluff (maquette BL4) : recherche, « Surprends-moi », catégories (les thèmes qui ont du
// contenu), liste « Populaires » triable, et « Mon mélange » (quiz cochés, résumé dans la barre du bas).

export type BluffSortId = 'popular' | 'new' | 'alphabetical' | 'questionCount'

export const BLUFF_SORTS: readonly BluffSortId[] = ['popular', 'new', 'alphabetical', 'questionCount']

// « Surprends-moi » : nombre de quiz tirés.
export const SURPRISE_QUIZ_COUNT = 3

export function bluffEntries(entries: readonly QuizEntry[]): QuizEntry[] {
  return filterByGameType(entries, 'bluff')
}

// Catégories affichées : seulement les thèmes qui ont au moins un quiz de Bluff.
export function bluffCategories(entries: readonly QuizEntry[]): string[] {
  return catalogThemes(entries)
}

function byTitle(a: QuizEntry, b: QuizEntry): number {
  return a.title.localeCompare(b.title, 'fr')
}

function byNewest(a: QuizEntry, b: QuizEntry): number {
  return b.addedAt.localeCompare(a.addedAt) || byTitle(a, b)
}

// Populaires : le Top 10 manuel (featuredRank) d'abord, puis les plus récents.
function byPopular(a: QuizEntry, b: QuizEntry): number {
  const rankA = a.featuredRank ?? Number.POSITIVE_INFINITY
  const rankB = b.featuredRank ?? Number.POSITIVE_INFINITY
  return rankA - rankB || byNewest(a, b)
}

const COMPARATORS: Record<BluffSortId, (a: QuizEntry, b: QuizEntry) => number> = {
  popular: byPopular,
  new: byNewest,
  alphabetical: byTitle,
  // Du plus petit au plus grand nombre de questions, puis populaires.
  questionCount: (a, b) => a.questionCount - b.questionCount || byPopular(a, b),
}

// Liste affichée : catégorie (null : toutes), recherche par titre, puis tri.
export function bluffList(entries: readonly QuizEntry[], category: string | null, query: string, sort: BluffSortId): QuizEntry[] {
  const inCategory = category === null ? [...entries] : entries.filter((entry) => entry.theme === category)
  const searched = query.trim() === '' ? inCategory : searchByTitle(inCategory, query)
  return [...searched].sort(COMPARATORS[sort])
}

// Ajoute ou retire un quiz du mélange.
export function toggleMix(mix: readonly string[], quizId: string): string[] {
  return mix.includes(quizId) ? mix.filter((id) => id !== quizId) : [...mix, quizId]
}

// Résumé du mélange : nombre de quiz et de questions (quiz disparus du catalogue ignorés).
export function mixSummary(entries: readonly QuizEntry[], mix: readonly string[]): { quizzes: QuizEntry[]; questionCount: number } {
  const quizzes = mix.flatMap((id) => entries.filter((entry) => entry.id === id))
  return { quizzes, questionCount: quizzes.reduce((total, quiz) => total + quiz.questionCount, 0) }
}

// « Surprends-moi » : SURPRISE_QUIZ_COUNT quiz au hasard, d'abord parmi ceux pas encore joués sur ce téléphone.
export function surpriseMix(entries: readonly QuizEntry[], played: ReadonlySet<string>, random: () => number = Math.random): string[] {
  const shuffle = (list: QuizEntry[]) => list.map((entry) => ({ entry, key: random() })).sort((a, b) => a.key - b.key).map(({ entry }) => entry)
  const fresh = shuffle(entries.filter((entry) => !played.has(entry.id)))
  const playedOnes = shuffle(entries.filter((entry) => played.has(entry.id)))
  return [...fresh, ...playedOnes].slice(0, SURPRISE_QUIZ_COUNT).map((entry) => entry.id)
}
