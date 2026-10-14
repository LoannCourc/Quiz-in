import { describe, expect, test } from 'vitest'

import { bluffCategories, bluffEntries, bluffList, mixSummary, surpriseMix, toggleMix } from '../../shared/bluffCatalog'
import type { QuizEntry } from '../../shared/quizValidation'

function bluff(id: string, fields: Partial<QuizEntry> = {}): QuizEntry {
  return {
    id,
    title: id,
    theme: 'Histoire',
    gameType: 'bluff',
    language: 'fr',
    difficulty: 2,
    difficultyLabel: 'Moyen',
    questionCount: 10,
    estimatedMinutes: 8,
    description: '',
    audience: 'all',
    poster: 'gold',
    addedAt: '2026-10-01',
    ...fields,
  }
}

const CATALOG = [
  bluff('Rois', { addedAt: '2026-10-05' }),
  bluff('Bêtes', { theme: 'Sciences et nature', questionCount: 20 }),
  bluff('Antiquité', { featuredRank: 1, questionCount: 15 }),
  bluff('Capitales', { theme: 'Géographie', addedAt: '2026-09-01', questionCount: 5 }),
  { ...bluff('Quiz classique'), gameType: 'quiz' as const },
]

describe('Catalogue du Bluff', () => {
  const entries = bluffEntries(CATALOG)

  test('seulement les quiz de Bluff, et les catégories qui ont du contenu', () => {
    expect(entries.map((entry) => entry.id)).not.toContain('Quiz classique')
    expect(bluffCategories(entries)).toEqual(['Géographie', 'Histoire', 'Sciences et nature'])
  })

  test('tris : Populaires (Top 10 puis récents), Nouveaux, A–Z, Nombre de questions croissant', () => {
    const ids = (sort: Parameters<typeof bluffList>[3]) => bluffList(entries, null, '', sort).map((entry) => entry.id)
    expect(ids('popular')).toEqual(['Antiquité', 'Rois', 'Bêtes', 'Capitales'])
    expect(ids('new')).toEqual(['Rois', 'Antiquité', 'Bêtes', 'Capitales'])
    expect(ids('alphabetical')).toEqual(['Antiquité', 'Bêtes', 'Capitales', 'Rois'])
    expect(ids('questionCount')).toEqual(['Capitales', 'Rois', 'Antiquité', 'Bêtes'])
  })

  test('catégorie et recherche', () => {
    expect(bluffList(entries, 'Histoire', '', 'alphabetical').map((entry) => entry.id)).toEqual(['Antiquité', 'Rois'])
    expect(bluffList(entries, null, 'betes', 'popular').map((entry) => entry.id)).toEqual(['Bêtes'])
  })

  test('Mon mélange : cocher, décocher, résumé', () => {
    let mix = toggleMix([], 'Rois')
    mix = toggleMix(mix, 'Bêtes')
    expect(mixSummary(entries, mix)).toMatchObject({ questionCount: 30 })
    mix = toggleMix(mix, 'Rois')
    expect(mix).toEqual(['Bêtes'])
    expect(mixSummary(entries, ['disparu']).quizzes).toEqual([])
  })

  test('Surprends-moi : 3 quiz, d’abord ceux pas encore joués', () => {
    const picked = surpriseMix(entries, new Set(['Rois']))
    expect(picked).toHaveLength(3)
    expect(picked).not.toContain('Rois')
    expect(new Set(picked).size).toBe(3)
  })
})
