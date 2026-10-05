// Icônes des thèmes du catalogue (maquette I2), associées au texte du champ theme des quiz.
// Culture générale garde le « ? » ; un thème absent de la table l'a aussi.

export type ThemeIconName = 'question' | 'clapper' | 'globe' | 'columns' | 'gamepad' | 'note' | 'flask' | 'ball'

const THEME_ICONS: Readonly<Record<string, ThemeIconName>> = {
  'Culture générale': 'question',
  'Cinéma et séries': 'clapper',
  Géographie: 'globe',
  Histoire: 'columns',
  Loisirs: 'gamepad',
  Musique: 'note',
  'Sciences et nature': 'flask',
  Sport: 'ball',
}

export function hasThemeIcon(theme: string): boolean {
  return Object.prototype.hasOwnProperty.call(THEME_ICONS, theme)
}

export function themeIconOf(theme: string): ThemeIconName {
  return hasThemeIcon(theme) ? THEME_ICONS[theme] : 'question'
}

// Thèmes qui ont leur propre icône (démo, tests).
export const ICON_THEMES: readonly string[] = Object.keys(THEME_ICONS)
