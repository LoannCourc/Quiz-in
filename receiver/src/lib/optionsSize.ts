// Taille du texte des propositions, choisie d'après la plus longue (80 caractères au plus) : la même
// sur la question et sur la révélation, pour que tout tienne à l'écran, en 720p comme en 1080p
// (la mise en page est proportionnelle à l'écran).
const NORMAL_MAX_LENGTH = 22
const LONG_MAX_LENGTH = 40

export type OptionsSizeClass = 'options-size-normal' | 'options-size-long' | 'options-size-very-long'

export function optionsSizeClass(options: readonly string[]): OptionsSizeClass {
  const longest = Math.max(0, ...options.map((option) => option.length))
  if (longest <= NORMAL_MAX_LENGTH) return 'options-size-normal'
  if (longest <= LONG_MAX_LENGTH) return 'options-size-long'
  return 'options-size-very-long'
}
