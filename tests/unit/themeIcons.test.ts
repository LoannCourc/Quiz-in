import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { catalogThemes } from '../../shared/catalogRows'
import type { QuizEntry } from '../../shared/quizValidation'
import { hasThemeIcon, themeIconOf } from '../../shared/themeIcons'

const QUIZZES_DIR = new URL('../../content/quizzes/', import.meta.url)

// Fiches du contenu actuel : seul le thème compte ici.
function contentEntries(): QuizEntry[] {
  return readdirSync(QUIZZES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(new URL(file, QUIZZES_DIR), 'utf8')) as QuizEntry)
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
})
