import { describe, expect, test, vi } from 'vitest'

import { isValidRoomCode, normalizeRoomCode } from '../../shared/roomCode'
import { refreshAfterRefusal } from '../../shared/signIn'

describe('Code de la partie : même mise en forme à la saisie et dans une adresse', () => {
  test.each([
    ['K7TM', 'K7TM'],
    ['k7tm', 'K7TM'],
    [' K7TM ', 'K7TM'],
    ['K7 TM', 'K7TM'],
    ['K7\u00A0TM\n', 'K7TM'],
    ['K7-TM/', 'K7TM'],
  ])('%j → %s', (input, expected) => {
    expect(normalizeRoomCode(input)).toBe(expected)
    expect(isValidRoomCode(normalizeRoomCode(input))).toBe(true)
  })

  test('caractères hors de l’alphabet : refusés, pas transformés (ni 0, ni O, ni 1, ni I n’existent dans un code)', () => {
    expect(isValidRoomCode(normalizeRoomCode('K0TM'))).toBe(false)
    expect(isValidRoomCode(normalizeRoomCode('KOTM'))).toBe(false)
    expect(isValidRoomCode(normalizeRoomCode('K7T'))).toBe(false)
    expect(isValidRoomCode(normalizeRoomCode(''))).toBe(false)
  })
})

describe('Lecture refusée : session rafraîchie avant un nouvel essai', () => {
  test('jeton renouvelé : le compte est gardé', async () => {
    const signOut = vi.fn(async () => undefined)
    await refreshAfterRefusal({ refreshToken: async () => 'jeton', signOut })
    expect(signOut).not.toHaveBeenCalled()
  })

  test('compte disparu : déconnexion, la connexion suivante en crée un autre', async () => {
    const signOut = vi.fn(async () => undefined)
    await refreshAfterRefusal({ refreshToken: () => Promise.reject(Object.assign(new Error(), { code: 'auth/user-token-expired' })), signOut })
    expect(signOut).toHaveBeenCalledOnce()
  })

  test('réseau coupé : le compte est gardé (le joueur retrouvera sa place)', async () => {
    const signOut = vi.fn(async () => undefined)
    await refreshAfterRefusal({ refreshToken: () => Promise.reject(Object.assign(new Error(), { code: 'auth/network-request-failed' })), signOut })
    expect(signOut).not.toHaveBeenCalled()
  })
})
