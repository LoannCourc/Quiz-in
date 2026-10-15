import { DEFAULT_SESSION_SETTINGS } from './constants'
import { quizLevel, estimateGameMinutes } from './quizCatalog'
import type { QuizEntry } from './quizValidation'
import type { Difficulty, QuestionLevel, QuestionLevelCounts, SessionSettings } from './types'

// Thèmes du catalogue Quiz (maquettes QN1) : chiffres de chaque thème, thème à la une, durée d'une partie
// tirée dans des thèmes. Logique pure : les écrans ne font qu'afficher.

export const QUESTION_LEVELS: readonly QuestionLevel[] = ['easy', 'medium', 'hard']

// Thèmes d'une partie au plus (feuille d'un thème, « Ta partie », règle de la base).
export const MAX_POOL_THEMES = 3

// Nombre de questions proposé d'abord (carte héro, feuille d'un thème) : la carte « Conseillé ».
export const RECOMMENDED_QUESTION_COUNT = 20

export function questionLevelOf(difficulty: Difficulty): QuestionLevel {
  return QUESTION_LEVELS[difficulty - 1]
}

// Questions d'un quiz par niveau ; fiche importée sans levelCounts : toutes au niveau du quiz.
export function quizLevelCounts(entry: QuizEntry): QuestionLevelCounts {
  if (entry.levelCounts) return entry.levelCounts
  const level = quizLevel(entry)
  const counts: QuestionLevelCounts = { easy: 0, medium: 0, hard: 0 }
  counts[level === 'impossible' ? 'hard' : level] = entry.questionCount
  return counts
}

export function countLevels(difficulties: readonly Difficulty[]): QuestionLevelCounts {
  const counts: QuestionLevelCounts = { easy: 0, medium: 0, hard: 0 }
  for (const difficulty of difficulties) counts[questionLevelOf(difficulty)] += 1
  return counts
}

export interface ThemeStats {
  theme: string
  questionCount: number
  quizCount: number
  // Quiz du thème lancés sur ce téléphone.
  playedCount: number
}

// Un thème par thème des quiz classiques, par ordre alphabétique.
export function themeStats(entries: readonly QuizEntry[], played: ReadonlySet<string>): ThemeStats[] {
  const byTheme = new Map<string, ThemeStats>()
  for (const entry of entries) {
    if (entry.gameType !== 'quiz') continue
    const stats = byTheme.get(entry.theme) ?? { theme: entry.theme, questionCount: 0, quizCount: 0, playedCount: 0 }
    stats.questionCount += entry.questionCount
    stats.quizCount += 1
    if (played.has(entry.id)) stats.playedCount += 1
    byTheme.set(entry.theme, stats)
  }
  return [...byTheme.values()].sort((a, b) => a.theme.localeCompare(b.theme, 'fr'))
}

// Thème à la une : celui choisi dans le contenu (featuredTheme) ; sinon le plus joué sur ce téléphone ;
// sinon celui qui a le plus de questions. null si aucun thème.
export function featuredThemeOf(entries: readonly QuizEntry[], stats: readonly ThemeStats[]): ThemeStats | null {
  const chosen = entries.find((entry) => entry.gameType === 'quiz' && entry.featuredTheme)
  const chosenStats = chosen && stats.find((theme) => theme.theme === chosen.theme)
  if (chosenStats) return chosenStats
  const byMost = (key: 'playedCount' | 'questionCount') => [...stats].sort((a, b) => b[key] - a[key])[0]
  const mostPlayed = byMost('playedCount')
  if (mostPlayed && mostPlayed.playedCount > 0) return mostPlayed
  return byMost('questionCount') ?? null
}

// Questions de plusieurs thèmes (feuille d'un thème : « N questions disponibles »).
export function themesQuestionTotal(stats: readonly ThemeStats[], themes: readonly string[]): number {
  return stats.filter((theme) => themes.includes(theme.theme)).reduce((total, theme) => total + theme.questionCount, 0)
}

// Durée estimée d'une partie tirée dans des thèmes : la même fonction sur la carte héro, la feuille d'un
// thème, la fiche et « Ta partie » (réglages par défaut tant que l'hôte ne les a pas changés).
export function themeGameMinutes(questionCount: number, settings: SessionSettings = DEFAULT_SESSION_SETTINGS): number | null {
  return estimateGameMinutes(questionCount, settings)
}
