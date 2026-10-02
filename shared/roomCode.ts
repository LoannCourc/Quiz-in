import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './constants'

// Met en forme un code saisi ou lu dans une URL : espaces retirés, majuscules.
export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase()
}

// Tire un code au hasard. random renvoie un nombre dans [0, 1[ ; il est remplaçable dans les tests.
export function generateRoomCode(random: () => number = Math.random): string {
  return Array.from(
    { length: ROOM_CODE_LENGTH },
    () => ROOM_CODE_ALPHABET[Math.floor(random() * ROOM_CODE_ALPHABET.length)],
  ).join('')
}

// Code valide : bonne longueur, uniquement des caractères de l'alphabet (spec 6.6).
export function isValidRoomCode(code: string): boolean {
  return (
    code.length === ROOM_CODE_LENGTH &&
    [...code].every((character) => ROOM_CODE_ALPHABET.includes(character))
  )
}
