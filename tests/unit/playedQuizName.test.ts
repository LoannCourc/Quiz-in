import { describe, expect, test } from 'vitest'

import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import { playedQuizName } from '../../shared/quizCatalog'
import type { QuizSummary } from '../../shared/types'

const SUMMARY: QuizSummary = {
  title: 'Électro des années 80',
  theme: 'Musique',
  gameType: 'blindTest',
  language: 'fr',
  difficulty: 2,
  difficultyLabel: 'Moyen',
  level: 'medium',
  questionCount: 10,
  estimatedMinutes: 6,
  description: '',
  audience: 'all',
  poster: 'violet',
  addedAt: '',
}

describe('playedQuizName (nom du quiz joué : salon, TV, fin)', () => {
  test('blind test ou quiz fixe : titre et niveau (choisi, sinon déduit de la difficulté)', () => {
    expect(playedQuizName(SUMMARY, DEFAULT_SESSION_SETTINGS)).toEqual({ title: 'Électro des années 80', level: 'medium' })
    const quiz = { ...SUMMARY, gameType: 'quiz' as const, level: undefined, difficulty: 1 }
    expect(playedQuizName(quiz, DEFAULT_SESSION_SETTINGS)).toEqual({ title: 'Électro des années 80', level: 'easy' })
  })
  test('rien pour le Bluff, Dessine-moi, une partie par thèmes ou un mélange, ni sans fiche', () => {
    expect(playedQuizName({ ...SUMMARY, gameType: 'bluff' }, DEFAULT_SESSION_SETTINGS)).toBeNull()
    expect(playedQuizName({ ...SUMMARY, gameType: 'draw' }, DEFAULT_SESSION_SETTINGS)).toBeNull()
    expect(playedQuizName(SUMMARY, { ...DEFAULT_SESSION_SETTINGS, themes: ['Histoire'] })).toBeNull()
    expect(playedQuizName(SUMMARY, { ...DEFAULT_SESSION_SETTINGS, quizIds: ['bluff-a', 'bluff-b'] })).toBeNull()
    expect(playedQuizName(null, DEFAULT_SESSION_SETTINGS)).toBeNull()
  })
})
