import { describe, expect, test } from 'vitest'

import type { QuizEntry } from '../../shared/quizValidation'
import {
  availableByTheme,
  availableTotal,
  drawThemeQuestions,
  effectiveQuestionCount,
  normalizeLevels,
  poolShortage,
  themeQuotas,
  type PoolCandidate,
} from '../../shared/themePool'
import type { QuestionLevel, QuestionLevelCounts } from '../../shared/types'

function entry(id: string, theme: string, levelCounts: QuestionLevelCounts, gameType: QuizEntry['gameType'] = 'quiz'): QuizEntry {
  return {
    id,
    title: id,
    theme,
    gameType,
    language: 'fr',
    difficulty: 2,
    difficultyLabel: 'Moyen',
    questionCount: levelCounts.easy + levelCounts.medium + levelCounts.hard,
    estimatedMinutes: 6,
    description: '',
    audience: 'all',
    poster: 'pink',
    addedAt: '',
    levelCounts,
  }
}

// Sport : 70 questions dont 10 difficiles ; Histoire : 70 dont 15 difficiles ; Musique : 60 dont 9.
const ENTRIES = [
  ...Array.from({ length: 7 }, (_, index) => entry(`sport-${index}`, 'Sport', index === 0 ? { easy: 4, medium: 2, hard: 4 } : { easy: 4, medium: 5, hard: 1 })),
  ...Array.from({ length: 7 }, (_, index) => entry(`histoire-${index}`, 'Histoire', index < 3 ? { easy: 3, medium: 3, hard: 4 } : { easy: 4, medium: 5, hard: 1 })),
  ...Array.from({ length: 6 }, (_, index) => entry(`musique-${index}`, 'Musique', index < 3 ? { easy: 4, medium: 4, hard: 2 } : { easy: 4, medium: 5, hard: 1 })),
  entry('bluff-sport', 'Sport', { easy: 10, medium: 0, hard: 0 }, 'bluff'),
]

describe('Difficulté choisie', () => {
  test('sans doublon, dans l’ordre ; aucun niveau ou les trois : tous', () => {
    expect(normalizeLevels(['hard', 'easy', 'hard'])).toEqual(['easy', 'hard'])
    expect(normalizeLevels([])).toBe('all')
    expect(normalizeLevels(['easy', 'medium', 'hard'])).toBe('all')
    expect(normalizeLevels(undefined)).toBe('all')
  })
})

describe('Questions disponibles', () => {
  test('par thème et par niveau, quiz classiques seulement', () => {
    expect(availableByTheme(ENTRIES, ['Sport', 'Histoire'], ['hard'])).toEqual([
      { theme: 'Sport', count: 10 },
      { theme: 'Histoire', count: 16 },
    ])
    expect(availableTotal(ENTRIES, ['Sport'], 'all')).toBe(70)
    expect(availableTotal(ENTRIES, ['Sport'], ['easy', 'hard'])).toBe(28 + 10)
  })

  test('nombre effectif : celui demandé, sinon toutes les questions disponibles', () => {
    expect(effectiveQuestionCount(20, 70)).toBe(20)
    expect(effectiveQuestionCount(30, 10)).toBe(10)
    expect(effectiveQuestionCount(10, 0)).toBe(0)
  })

  test('avertissement : nombre réel et conseil (ajouter un thème, élargir la difficulté, moins de questions)', () => {
    expect(poolShortage(ENTRIES, ['Sport'], ['hard'], 30)).toEqual({ available: 10, themes: ['Sport'], levels: ['hard'], advice: 'addTheme' })
    expect(poolShortage(ENTRIES, ['Sport'], ['hard'], 10)).toBeNull()
    expect(poolShortage(ENTRIES, ['Sport', 'Histoire', 'Musique'], ['hard'], 40)).toEqual({
      available: 10 + 16 + 9,
      themes: ['Sport', 'Histoire', 'Musique'],
      levels: ['hard'],
      advice: 'widenLevels',
    })
    expect(poolShortage(ENTRIES, ['Sport', 'Histoire', 'Musique'], 'all', 300)?.advice).toBe('fewerQuestions')
  })
})

// Questions candidates d'un thème : n questions, numérotées, au niveau donné.
function candidates(theme: string, count: number, level: QuestionLevel = 'medium', from = 0): PoolCandidate[] {
  return Array.from({ length: count }, (_, index) => ({ ref: `${theme.toLowerCase()}/q${from + index}`, theme, level }))
}

function countByTheme(refs: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const ref of refs) counts[ref.split('/')[0]] = (counts[ref.split('/')[0]] ?? 0) + 1
  return counts
}

describe('Tirage réparti entre les thèmes', () => {
  test('parts égales, le reste aux premiers thèmes', () => {
    expect(themeQuotas(20, 2)).toEqual([10, 10])
    expect(themeQuotas(20, 3)).toEqual([7, 7, 6])
    expect(themeQuotas(10, 1)).toEqual([10])
  })

  test('deux thèmes, assez de questions : 10 + 10, sans doublon', () => {
    const drawn = drawThemeQuestions([...candidates('Histoire', 70), ...candidates('Sport', 70)], ['Histoire', 'Sport'], 'all', 20, {})
    expect(drawn).toHaveLength(20)
    expect(new Set(drawn).size).toBe(20)
    expect(countByTheme(drawn)).toEqual({ histoire: 10, sport: 10 })
  })

  test('un thème qui manque de questions : complété par l’autre', () => {
    const pool = [...candidates('Histoire', 70, 'hard'), ...candidates('Sport', 10, 'hard'), ...candidates('Sport', 60, 'easy', 10)]
    const drawn = drawThemeQuestions(pool, ['Histoire', 'Sport'], ['hard'], 30, {})
    expect(drawn).toHaveLength(30)
    expect(countByTheme(drawn)).toEqual({ histoire: 20, sport: 10 })
  })

  test('seulement les niveaux choisis ; s’il en manque partout, toutes celles disponibles', () => {
    const pool = [...candidates('Sport', 10, 'hard'), ...candidates('Sport', 60, 'easy', 10)]
    const drawn = drawThemeQuestions(pool, ['Sport'], ['hard'], 30, {})
    expect(drawn).toHaveLength(10)
    expect(drawn.every((ref) => Number(ref.split('/q')[1]) < 10)).toBe(true)
  })

  test('jamais jouées d’abord, puis les plus anciennement jouées', () => {
    const pool = candidates('Sport', 5)
    const playedAt = { 'sport/q0': 300, 'sport/q1': 100, 'sport/q2': 200 }
    const drawn = drawThemeQuestions(pool, ['Sport'], 'all', 3, playedAt)
    expect([...drawn].sort()).toEqual(['sport/q1', 'sport/q3', 'sport/q4'])
  })

  test('thèmes non choisis jamais tirés', () => {
    const drawn = drawThemeQuestions([...candidates('Sport', 5), ...candidates('Musique', 50)], ['Sport'], 'all', 10, {})
    expect(countByTheme(drawn)).toEqual({ sport: 5 })
  })
})
