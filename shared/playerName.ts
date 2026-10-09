import { containsForbiddenWord } from './answerFilter'
import { PLAYER_NAME_MAX_LENGTH, PLAYER_NAME_MIN_LENGTH } from './constants'

// Pseudo tel qu'il sera enregistré : sans espace au début ni à la fin (spec 6.6).
export function cleanPlayerName(input: string): string {
  return input.trim()
}

export function isValidPlayerName(name: string): boolean {
  return name.length >= PLAYER_NAME_MIN_LENGTH && name.length <= PLAYER_NAME_MAX_LENGTH
}

// Unicité du pseudo : « Léa » et « léa » sont le même pseudo.
export function isSamePlayerName(a: string, b: string): boolean {
  return a.toLocaleLowerCase('fr') === b.toLocaleLowerCase('fr')
}

// Taille d'un pseudo selon sa longueur (spec 6.6 : 12 caractères au plus), pour qu'il tienne toujours sur
// une seule ligne : entière jusqu'à 8 caractères, puis 6 % de moins par caractère, jamais sous 76 % (taille
// minimale lisible). Au-delà de la place disponible : « … ». Même règle sur les téléphones et sur la TV.
const NAME_FULL_SIZE_LENGTH = 8
const NAME_SCALE_STEP = 0.06
export const NAME_MIN_SCALE = 0.76

export function playerNameScale(name: string): number {
  const extra = Math.max(0, [...name].length - NAME_FULL_SIZE_LENGTH)
  return Math.max(NAME_MIN_SCALE, Math.round((1 - extra * NAME_SCALE_STEP) * 100) / 100)
}

// Pseudo acceptable : sans mot interdit (même filtre que les réponses affichées sur la TV, answerFilter.ts).
export function isAllowedPlayerName(name: string): boolean {
  return !containsForbiddenWord(name)
}
