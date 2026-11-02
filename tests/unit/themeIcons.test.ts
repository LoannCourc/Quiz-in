import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { catalogThemes } from '../../shared/catalogRows'
import type { QuizEntry } from '../../shared/quizValidation'
import { GENRE_ICONS, hasThemeIcon, isQuizIconName, quizIconOf, themeIconOf } from '../../shared/themeIcons'

// Un dossier par type de jeu (content/scripts/quizFiles.mjs).
const QUIZ_DIRS = ['quiz', 'bluff', 'blind-test'].map((folder) => new URL(`../../content/quizzes/${folder}/`, import.meta.url))

// Fiches du contenu actuel : seuls le thème et l'icône comptent ici.
function contentEntries(): (QuizEntry & { icon?: unknown })[] {
  return QUIZ_DIRS.flatMap((dir) =>
    readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as QuizEntry & { icon?: unknown }),
  )
}

describe('Icônes de thème', () => {
  test('chaque thème du catalogue actuel a une icône', () => {
    const themes = catalogThemes(contentEntries())
    expect(themes.length).toBeGreaterThan(0)
    expect(themes.filter((theme) => !hasThemeIcon(theme))).toEqual([])
  })

  test('Culture générale et un thème inconnu gardent le « ? »', () => {
    expect(themeIconOf('Culture générale')).toBe('question')
    expect(themeIconOf('Thème inconnu')).toBe('question')
    expect(themeIconOf('toString')).toBe('question')
    expect(themeIconOf('Musique')).toBe('note')
  })

  test('toute icône choisie par un quiz du contenu existe dans la table', () => {
    const icons = contentEntries().flatMap((entry) => (entry.icon === undefined ? [] : [entry.icon]))
    expect(icons.length).toBeGreaterThan(0)
    expect(icons.filter((icon) => !isQuizIconName(icon))).toEqual([])
  })

  test('icône d’un quiz : la sienne, sinon celle du thème ; un identifiant inconnu est refusé', () => {
    expect(quizIconOf({ theme: 'Musique', icon: 'cassette' })).toBe('cassette')
    expect(quizIconOf({ theme: 'Musique' })).toBe('note')
    expect(isQuizIconName('licorne')).toBe(false)
    expect(GENRE_ICONS).toHaveLength(12)
  })
})
