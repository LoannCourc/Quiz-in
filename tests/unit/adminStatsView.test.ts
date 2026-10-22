import { describe, expect, test } from 'vitest'

// Module JavaScript de la page admin (sans types), servi tel quel par Firebase Hosting.
import * as view from '../../admin/public/statsView.js'

// Lecture de /stats telle que la renvoie la base : reached et playerCounts en tableaux (clés numériques
// qui se suivent), cases vides à null.
const STATS = {
  modes: {
    quiz: { started: 100, completed: 80, reached: [100, 95, 90, 82] },
    bluff: { started: 20, completed: 5 },
    blindTest: { started: 999 },
  },
  quizzes: { 'animaux-du-monde': { started: 12, completed: 10 }, 'histoire-1': { started: 30, completed: 21 } },
  pools: { themes: { started: 18, completed: 18 }, autre: { started: 50 } },
  playerCounts: [null, null, 10, 30, null, 5],
  questions: {
    'animaux-du-monde': { 'am-01': { answered: 40, correct: 38 }, 'am-02': { answered: 25, correct: 5 }, 'am-03': { answered: 3, correct: 0 } },
    'histoire-1': { 'h-07': { answered: 20, correct: 10 } },
  },
  daily: { '2026-10-21': { started: 4, completed: 3 }, '2026-10-22': { started: 7 } },
}

describe('Page des statistiques : calculs à partir de /stats', () => {
  test('totaux et jeux : seuls Quiz, Bluff et Dessine-moi comptent (jamais le blind test)', () => {
    expect(view.totals(STATS)).toEqual({ started: 120, completed: 85, rate: 85 / 120 })
    expect(view.modeRows(STATS).map((row: { id: string }) => row.id)).toEqual(['quiz', 'bluff'])
    expect(view.formatRate(0.25)).toBe('25 %')
    expect(view.formatRate(null)).toBe('–')
  })

  test('quiz et ensembles les plus joués, avec leurs titres ; ensemble inconnu ignoré', () => {
    const rows = view.topGames(STATS, { 'histoire-1': 'Histoire de France' })
    expect(rows.map((row: { label: string; started: number }) => [row.label, row.started])).toEqual([
      ['Histoire de France', 30],
      ['Quiz par thèmes', 18],
      ['animaux-du-monde', 12],
    ])
  })

  test('courbe d’abandon : parties arrivées, part des démarrées, abandons entre deux questions', () => {
    expect(view.dropOff(STATS, 'quiz')).toEqual([
      { index: 0, games: 100, share: 1, abandoned: 5 },
      { index: 1, games: 95, share: 0.95, abandoned: 5 },
      { index: 2, games: 90, share: 0.9, abandoned: 8 },
      { index: 3, games: 82, share: 0.82, abandoned: null },
    ])
    expect(view.dropOff(STATS, 'draw')).toEqual([])
  })

  test('nombre de joueurs : de la plus petite à la plus grande valeur, trous à 0', () => {
    expect(view.playerHistogram(STATS)).toEqual([
      { players: 2, games: 10, share: 10 / 45 },
      { players: 3, games: 30, share: 30 / 45 },
      { players: 4, games: 0, share: 0 },
      { players: 5, games: 5, share: 5 / 45 },
    ])
  })

  test('questions : minimum de réponses, plus dures et plus faciles', () => {
    const ranking = view.questionRanking(STATS, 20)
    expect(ranking.counted).toBe(3)
    expect(ranking.hardest.map((row: { questionId: string }) => row.questionId)).toEqual(['am-02', 'h-07', 'am-01'])
    expect(ranking.easiest[0]).toEqual({ quizId: 'animaux-du-monde', questionId: 'am-01', answered: 40, correct: 38, rate: 0.95 })
    expect(view.questionRanking(STATS, 1).counted).toBe(4)
    expect(view.questionRanking(STATS, 50).counted).toBe(0)
  })

  test('tendance : jours UTC consécutifs, jours sans partie à 0', () => {
    const now = Date.UTC(2026, 9, 22, 23, 59)
    expect(view.dailyTrend(STATS, now, 3)).toEqual([
      { day: '2026-10-20', started: 0, completed: 0 },
      { day: '2026-10-21', started: 4, completed: 3 },
      { day: '2026-10-22', started: 7, completed: 0 },
    ])
  })

  test('titres à lire : quiz joués et quiz des questions comptées, sans doublon', () => {
    expect(view.quizIdsToName(STATS).sort()).toEqual(['animaux-du-monde', 'histoire-1'])
  })

  test('statistiques vides : rien ne casse', () => {
    expect(view.totals({})).toEqual({ started: 0, completed: 0, rate: null })
    expect(view.topGames({})).toEqual([])
    expect(view.playerHistogram({})).toEqual([])
    expect(view.questionRanking({}).hardest).toEqual([])
  })
})
