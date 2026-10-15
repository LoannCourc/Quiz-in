import { describe, expect, test } from 'vitest'

import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import { estimateGameMinutes } from '../../shared/quizCatalog'
import { parseQuizSummary, type QuizEntry } from '../../shared/quizValidation'
import { countLevels, featuredThemeOf, gameProgramme, themeGameChoice, quizLevelCounts, themeGameMinutes, themeStats } from '../../shared/themeCatalog'

function entry(id: string, theme: string, extra: Partial<QuizEntry> = {}): QuizEntry {
  return {
    id,
    title: id,
    theme,
    gameType: 'quiz',
    language: 'fr',
    difficulty: 1,
    difficultyLabel: 'Facile',
    questionCount: 10,
    estimatedMinutes: 6,
    description: '',
    audience: 'all',
    poster: 'pink',
    addedAt: '',
    ...extra,
  }
}

describe('Thèmes du catalogue Quiz', () => {
  const entries = [
    entry('h1', 'Histoire'),
    entry('h2', 'Histoire', { questionCount: 12 }),
    entry('s1', 'Sport'),
    entry('b1', 'Histoire', { gameType: 'bluff' }),
  ]

  test('chiffres par thème : questions, quiz, déjà joués ; Bluff et blind tests à part', () => {
    expect(themeStats(entries, new Set(['h2']))).toEqual([
      { theme: 'Histoire', questionCount: 22, quizCount: 2, playedCount: 1 },
      { theme: 'Sport', questionCount: 10, quizCount: 1, playedCount: 0 },
    ])
  })

  test('thème à la une : celui du contenu, sinon le plus joué, sinon le plus fourni', () => {
    const withFlag = [...entries, entry('s2', 'Sport', { featuredTheme: true })]
    expect(featuredThemeOf(withFlag, themeStats(withFlag, new Set()))?.theme).toBe('Sport')
    expect(featuredThemeOf(entries, themeStats(entries, new Set(['s1'])))?.theme).toBe('Sport')
    expect(featuredThemeOf(entries, themeStats(entries, new Set()))?.theme).toBe('Histoire')
    expect(featuredThemeOf([], [])).toBeNull()
  })

  test('questions par niveau : celles du build, sinon toutes au niveau du quiz', () => {
    expect(countLevels([1, 1, 2, 3, 3, 3])).toEqual({ easy: 2, medium: 1, hard: 3 })
    expect(quizLevelCounts(entry('a', 'Sport', { levelCounts: { easy: 4, medium: 5, hard: 1 } }))).toEqual({ easy: 4, medium: 5, hard: 1 })
    expect(quizLevelCounts(entry('a', 'Sport', { level: 'hard' }))).toEqual({ easy: 0, medium: 0, hard: 10 })
  })

  test('levelCounts et featuredTheme lus dans la base, ignorés s’ils sont mal formés', () => {
    const base = { title: 'T', theme: 'Sport', gameType: 'quiz', language: 'fr', difficulty: 1, difficultyLabel: 'Facile', questionCount: 10, estimatedMinutes: 6 }
    expect(parseQuizSummary({ ...base, levelCounts: { easy: 4, medium: 5, hard: 1 }, featuredTheme: true })).toMatchObject({
      levelCounts: { easy: 4, medium: 5, hard: 1 },
      featuredTheme: true,
    })
    const ignored = parseQuizSummary({ ...base, levelCounts: { easy: -1, medium: 5, hard: 1 }, featuredTheme: 'oui' })
    expect(ignored).not.toHaveProperty('levelCounts')
    expect(ignored).not.toHaveProperty('featuredTheme')
  })

  test('durée : la même estimation que la fiche, réglages par défaut', () => {
    expect([10, 20, 30].map((count) => themeGameMinutes(count))).toEqual([10, 20, 30].map((count) => estimateGameMinutes(count, DEFAULT_SESSION_SETTINGS)))
  })
})

describe('Au programme de la fiche', () => {
  test('répartition des questions tirées par thème (ordre des thèmes choisis) et par niveau', () => {
    const drawn = [
      { theme: 'Sport', level: 'easy' as const },
      { theme: 'Histoire', level: 'hard' as const },
      { theme: 'Histoire', level: 'easy' as const },
    ]
    const programme = gameProgramme(drawn, ['Histoire', 'Sport'])
    expect(programme).toEqual({
      byTheme: [
        { theme: 'Histoire', count: 2 },
        { theme: 'Sport', count: 1 },
      ],
      byLevel: { easy: 2, medium: 0, hard: 1 },
    })
  })
})

describe('Choix reçu par la fiche', () => {
  const entries = [entry('h1', 'Histoire'), entry('h2', 'Histoire'), entry('s1', 'Sport'), entry('s2', 'Sport'), entry('m1', 'Musique')]

  test('1 à 3 thèmes connus, sans doublon, et un nombre proposé que leurs questions permettent', () => {
    expect(themeGameChoice(entries, ['Histoire'], 20)).toEqual({ themes: ['Histoire'], count: 20 })
    expect(themeGameChoice(entries, ['Histoire', 'Sport'], 30)).toEqual({ themes: ['Histoire', 'Sport'], count: 30 })
    expect(themeGameChoice(entries, ['Histoire'], 30)).toBeNull()
    expect(themeGameChoice(entries, ['Histoire'], 15)).toBeNull()
    expect(themeGameChoice(entries, ['Inconnu'], 10)).toBeNull()
    expect(themeGameChoice(entries, ['Sport', 'Sport'], 10)).toBeNull()
    expect(themeGameChoice(entries, [], 10)).toBeNull()
    expect(themeGameChoice([...entries, entry('g1', 'Géographie')], ['Histoire', 'Sport', 'Musique', 'Géographie'], 10)).toBeNull()
  })
})
