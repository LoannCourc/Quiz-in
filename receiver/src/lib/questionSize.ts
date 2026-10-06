// Mise en page de l'écran de question de la TV selon l'énoncé (140 caractères au plus, jusqu'à 4 lignes)
// et le nombre de joueurs : tout doit tenir à l'écran, la barre des joueurs en bas comprise, en 720p comme
// en 1080p (la mise en page est proportionnelle à l'écran).

// Énoncé long (2 lignes ou plus) : texte plus petit ; très long (3 à 4 lignes) : encore plus petit.
const LONG_QUESTION_MIN = 60
const VERY_LONG_QUESTION_MIN = 100
// Au-delà, les avatars passent sur une seule ligne, plus petits (comme au vote du Bluff).
export const MANY_PLAYERS_MIN = 13

export type QuestionSizeClass = '' | 'is-long' | 'is-very-long'

export function questionSizeClass(text: string): QuestionSizeClass {
  if (text.length >= VERY_LONG_QUESTION_MIN) return 'is-very-long'
  return text.length >= LONG_QUESTION_MIN ? 'is-long' : ''
}

// Écran serré : énoncé long ou beaucoup de joueurs ; les marges et le cadre de saisie se réduisent.
export function isTightQuestion(text: string, playerCount: number): boolean {
  return questionSizeClass(text) !== '' || playerCount >= MANY_PLAYERS_MIN
}
