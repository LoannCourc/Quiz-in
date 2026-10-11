import { QUESTIONS_PER_GAME } from './constants'
import type { QuizEntry } from './quizValidation'
import type { QuizGameType, SessionSettings } from './types'

// Nombre de questions et tirage dans un ensemble de quiz (plan docs/plan-catalogues-et-rejouer.md, point 1).
// Quiz : un ou plusieurs thèmes (« Tout » compris), 10 / 20 / 30 questions. Bluff : « Mon mélange », une
// sélection de quiz, 10 / 15 / 20 questions. Un quiz seul (fiche) garde ses 10 premières questions.

export const QUIZ_QUESTION_COUNTS: readonly number[] = [10, 20, 30]
export const BLUFF_QUESTION_COUNTS: readonly number[] = [10, 15, 20]
export const MAX_QUESTIONS_PER_GAME = 30
// Mon mélange : nombre de quiz au plus (règle de la base).
export const MAX_MIX_QUIZZES = 20

export type QuestionPool = { kind: 'themes'; themes: readonly string[] } | { kind: 'mix'; quizIds: readonly string[] }

// Ensemble choisi pour la partie, lu dans les réglages ; null : un quiz seul (sessions/{code}/quizId).
export function poolOf(settings: SessionSettings): QuestionPool | null {
  if (settings.themes && settings.themes.length > 0) return { kind: 'themes', themes: settings.themes }
  if (settings.quizIds && settings.quizIds.length > 0) return { kind: 'mix', quizIds: settings.quizIds }
  return null
}

// Réglages d'une partie tirée dans un ensemble : l'ensemble et le nombre de questions.
export function withPool(settings: SessionSettings, pool: QuestionPool, questionCount: number): SessionSettings {
  const rest = { ...settings }
  delete rest.themes
  delete rest.quizIds
  return pool.kind === 'themes'
    ? { ...rest, themes: [...pool.themes], questionCount }
    : { ...rest, quizIds: [...pool.quizIds], questionCount }
}

// Nombre de questions de la partie : celui des réglages, sinon QUESTIONS_PER_GAME.
export function gameQuestionCount(settings: SessionSettings): number {
  return settings.questionCount ?? QUESTIONS_PER_GAME
}

// Quiz d'un ensemble, dans l'ordre du catalogue (thèmes : ceux du jeu dont le thème est choisi).
export function poolQuizzes(entries: readonly QuizEntry[], pool: QuestionPool, gameType: QuizGameType): QuizEntry[] {
  if (pool.kind === 'themes') return entries.filter((entry) => entry.gameType === gameType && pool.themes.includes(entry.theme))
  return entries.filter((entry) => pool.quizIds.includes(entry.id))
}

export function poolQuestionTotal(quizzes: readonly QuizEntry[]): number {
  return quizzes.reduce((total, quiz) => total + quiz.questionCount, 0)
}

// Options du nombre de questions possibles avec ce total (les autres sont grisées).
export function availableQuestionCounts(options: readonly number[], total: number): number[] {
  return options.filter((count) => count <= total)
}

// Identifiant d'une question dans tout le catalogue : « quizId/questionId ».
export function questionRef(quizId: string, questionId: string): string {
  return `${quizId}/${questionId}`
}

export function parseQuestionRef(ref: string): { quizId: string; questionId: string } | null {
  const slash = ref.indexOf('/')
  if (slash <= 0 || slash === ref.length - 1) return null
  return { quizId: ref.slice(0, slash), questionId: ref.slice(slash + 1) }
}

// Tirage de la partie : d'abord les questions jamais jouées sur ce téléphone (au hasard), puis, s'il en
// manque, les plus anciennement jouées. playedAt : heure du dernier lancement de chaque question jouée.
export function drawPoolQuestions(
  refs: readonly string[],
  playedAt: Readonly<Record<string, number>>,
  count: number,
  random: () => number = Math.random,
): string[] {
  const unplayed = shuffled(refs.filter((ref) => playedAt[ref] === undefined), random)
  const played = refs.filter((ref) => playedAt[ref] !== undefined).sort((a, b) => playedAt[a] - playedAt[b])
  return shuffled([...unplayed, ...played].slice(0, count), random)
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}
