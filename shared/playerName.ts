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
