import { describe, expect, test } from 'vitest'

import {
  availableGenres,
  availableLevels,
  blindTestTiles,
  filterBlindTests,
  isBlindTestPlayed,
  levelDots,
} from '../../shared/blindTestCatalog'
import { parseQuizSummary, type QuizEntry } from '../../shared/quizValidation'

function blindTest(id: string, fields: Partial<QuizEntry>): QuizEntry {
  return {
    id,
    title: id,
    theme: 'Musique',
    gameType: 'blindTest',
    language: 'fr',
    difficulty: 1,
    difficultyLabel: 'Facile',
    questionCount: 10,
    estimatedMinutes: 6,
    description: '',
    audience: 'all',
    poster: 'pink',
    addedAt: '',
    ...fields,
  }
}

const CATALOG = [
  blindTest('a80', { genre: 'pop', decade: 1980, difficulty: 1 }),
  blindTest('rock80', { genre: 'rock', decade: 1980, difficulty: 3 }),
  blindTest('metal80', { genre: 'rock', decade: 1980, level: 'impossible' }),
  blindTest('rap', { genre: 'rap', decade: 'all', difficulty: 2 }),
]

describe('Blind test : tuiles', () => {
  test('genres et décennies avec leur compteur et le nombre déjà joués ; jamais de tuile vide', () => {
    const genres = blindTestTiles(CATALOG, 'genre', new Set(['rock80']))
    expect(genres.map((tile) => [tile.facet.value, tile.count, tile.playedCount])).toEqual([
      ['pop', 1, 0],
      ['rock', 2, 1],
      ['rap', 1, 0],
    ])
    expect(blindTestTiles(CATALOG, 'decade', new Set()).map((tile) => tile.facet.value)).toEqual([1980, 'all'])
  })

  test('« joué » : le compteur d’une tuile égale le nombre de lignes marquées dans sa liste (une seule source)', () => {
    const played = new Set(['rock80', 'metal80', 'rap'])
    for (const tab of ['genre', 'decade', 'level'] as const) {
      for (const tile of blindTestTiles(CATALOG, tab, played)) {
        const rows = filterBlindTests(CATALOG, { facet: tile.facet, genres: [], levels: [] })
        expect(rows.filter((entry) => isBlindTestPlayed(entry, played)).length, String(tile.facet.value)).toBe(tile.playedCount)
      }
    }
    expect(isBlindTestPlayed({ id: 'a80' }, played)).toBe(false)
    expect(isBlindTestPlayed({ id: 'rap' }, played)).toBe(true)
  })

  test('« Impossible » seulement s’il a au moins un blind test', () => {
    expect(blindTestTiles(CATALOG, 'level', new Set()).map((tile) => tile.facet.value)).toEqual(['easy', 'medium', 'hard', 'impossible'])
    const withoutImpossible = CATALOG.filter((entry) => entry.level !== 'impossible')
    expect(blindTestTiles(withoutImpossible, 'level', new Set()).map((tile) => tile.facet.value)).not.toContain('impossible')
  })
})

describe('Blind test : liste filtrée', () => {
  const eighties = { tab: 'decade', value: 1980 } as const

  test('la tuile, puis des filtres en plus (ou dans un groupe, et entre les groupes)', () => {
    expect(filterBlindTests(CATALOG, { facet: eighties, genres: [], levels: [] }).map((entry) => entry.id)).toEqual(['a80', 'rock80', 'metal80'])
    expect(filterBlindTests(CATALOG, { facet: eighties, genres: [], levels: ['hard', 'impossible'] }).map((entry) => entry.id)).toEqual(['rock80', 'metal80'])
    expect(filterBlindTests(CATALOG, { facet: eighties, genres: ['pop'], levels: ['hard'] })).toEqual([])
  })

  test('choix des filtres en plus : seulement ceux qui ont du contenu dans la tuile', () => {
    expect(availableGenres(CATALOG, eighties)).toEqual(['pop', 'rock'])
    expect(availableLevels(CATALOG, eighties)).toEqual(['easy', 'hard', 'impossible'])
  })

  test('points de difficulté : 1 à 4', () => {
    expect([levelDots('easy'), levelDots('impossible')]).toEqual([1, 4])
  })
})

describe('Fiche lue dans la base', () => {
  test('genre, décennie et niveau « impossible » gardés ; valeurs inconnues ignorées', () => {
    const base = { title: 'X', theme: 'Musique', gameType: 'blindTest', language: 'fr', difficulty: 3, difficultyLabel: 'Difficile', questionCount: 10, estimatedMinutes: 6 }
    expect(parseQuizSummary({ ...base, genre: 'electro', decade: 2020, level: 'impossible' })).toMatchObject({ genre: 'electro', decade: 2020, level: 'impossible' })
    const unknown = parseQuizSummary({ ...base, genre: 'jazz', decade: 1975 })
    expect(unknown).not.toHaveProperty('genre')
    expect(unknown).not.toHaveProperty('decade')
  })

  test('marquage « paroles explicites » : gardé s’il vaut true, ignoré sinon', () => {
    const base = { title: 'X', theme: 'Musique', gameType: 'blindTest', language: 'fr', difficulty: 4, difficultyLabel: 'Impossible', questionCount: 10, estimatedMinutes: 6 }
    expect(parseQuizSummary({ ...base, explicitLyrics: true })).toMatchObject({ explicitLyrics: true })
    expect(parseQuizSummary({ ...base, explicitLyrics: 'oui' })).not.toHaveProperty('explicitLyrics')
  })

  test('niveau « mixed » (Tous niveaux) gardé ; tuile du niveau, sans point plein', () => {
    const base = { title: 'X', theme: 'Musique', gameType: 'blindTest', language: 'fr', difficulty: 2.3, difficultyLabel: 'Tous niveaux', questionCount: 10, estimatedMinutes: 6 }
    expect(parseQuizSummary({ ...base, level: 'mixed' })).toMatchObject({ level: 'mixed' })
    const catalog = [...CATALOG, blindTest('mix80', { genre: 'pop', decade: 1980, level: 'mixed' })]
    expect(blindTestTiles(catalog, 'level', new Set()).map((tile) => tile.facet.value)).toContain('mixed')
    expect(levelDots('mixed')).toBe(0)
    expect(levelDots('impossible')).toBe(4)
  })
})
