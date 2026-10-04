import { optionsTextSize, type OptionsTextSize } from '@shared/optionsText'

// Taille du texte des propositions, choisie d'après la plus longue (80 caractères au plus) : la même
// pour toutes les propositions, sur la question et sur la révélation, pour que tout tienne à l'écran,
// en 720p comme en 1080p (la mise en page est proportionnelle à l'écran).
const TV_THRESHOLDS = { normalMax: 22, longMax: 40 }

export type OptionsSizeClass = 'options-size-normal' | 'options-size-long' | 'options-size-very-long'

const SIZE_CLASSES: Record<OptionsTextSize, OptionsSizeClass> = {
  normal: 'options-size-normal',
  long: 'options-size-long',
  veryLong: 'options-size-very-long',
}

export function optionsSizeClass(options: readonly string[]): OptionsSizeClass {
  return SIZE_CLASSES[optionsTextSize(options, TV_THRESHOLDS)]
}
