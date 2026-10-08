// Icônes des quiz (maquettes I2 et I3). Chaque thème du catalogue a la sienne, associée au texte du
// champ theme (Culture générale et un thème inconnu gardent le « ? ») ; un quiz peut aussi en choisir
// une par son champ facultatif icon (les blind tests : une icône par genre). Les puces de filtre
// restent sur les thèmes.

export type ThemeIconName = 'question' | 'clapper' | 'globe' | 'columns' | 'gamepad' | 'note' | 'flask' | 'ball'

// Genres de blind test (I3), et le crayon de Dessine-moi.
export type GenreIconName =
  | 'cassette'
  | 'cd'
  | 'headphones'
  | 'smartphone'
  | 'accordion'
  | 'discoBall'
  | 'sun'
  | 'star'
  | 'microphone'
  | 'guitar'
  | 'speechBubble'
  // Dessine-moi (affiche du jeu, comme sa tuile d'accueil).
  | 'pencil'

export type QuizIconName = ThemeIconName | GenreIconName

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

export const GENRE_ICONS: readonly GenreIconName[] = [
  'cassette',
  'cd',
  'headphones',
  'smartphone',
  'accordion',
  'discoBall',
  'sun',
  'star',
  'microphone',
  'guitar',
  'speechBubble',
  'pencil',
]

const ALL_ICONS: readonly QuizIconName[] = [...new Set<QuizIconName>([...Object.values(THEME_ICONS), ...GENRE_ICONS])]

export function hasThemeIcon(theme: string): boolean {
  return Object.prototype.hasOwnProperty.call(THEME_ICONS, theme)
}

export function themeIconOf(theme: string): ThemeIconName {
  return hasThemeIcon(theme) ? THEME_ICONS[theme] : 'question'
}

// Identifiant d'icône valide pour le champ icon d'un quiz (icône de thème ou de genre).
export function isQuizIconName(value: unknown): value is QuizIconName {
  return ALL_ICONS.includes(value as QuizIconName)
}

// Icône d'un quiz : la sienne si elle est donnée, sinon celle de son thème.
export function quizIconOf(quiz: { theme: string; icon?: QuizIconName }): QuizIconName {
  return quiz.icon ?? themeIconOf(quiz.theme)
}

// Thèmes qui ont leur propre icône (démo, tests).
export const ICON_THEMES: readonly string[] = Object.keys(THEME_ICONS)
