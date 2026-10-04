// Taille du texte des propositions : une seule pour toutes les propositions d'une question, choisie
// d'après la plus longue (jamais de réduction proposition par proposition). Seuils propres à
// chaque écran (TV, téléphone).

export type OptionsTextSize = 'normal' | 'long' | 'veryLong'

export interface OptionsTextThresholds {
  // Longueur maximale (en caractères) de la plus longue proposition pour chaque taille.
  normalMax: number
  longMax: number
}

export function longestOptionLength(options: readonly string[]): number {
  return Math.max(0, ...options.map((option) => option.length))
}

export function optionsTextSize(options: readonly string[], { normalMax, longMax }: OptionsTextThresholds): OptionsTextSize {
  const longest = longestOptionLength(options)
  if (longest <= normalMax) return 'normal'
  if (longest <= longMax) return 'long'
  return 'veryLong'
}
