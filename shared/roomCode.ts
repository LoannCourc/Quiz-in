import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './constants'

// Met en forme un code saisi ou lu dans une URL : espaces retirés, majuscules.
export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase()
}

// Code valide : bonne longueur, uniquement des caractères de l'alphabet (spec 6.6).
export function isValidRoomCode(code: string): boolean {
  return (
    code.length === ROOM_CODE_LENGTH &&
    [...code].every((character) => ROOM_CODE_ALPHABET.includes(character))
  )
}
