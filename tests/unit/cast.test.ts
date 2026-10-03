import { describe, expect, test } from 'vitest'

import { CAST_NAMESPACE, readCastRoomCode } from '../../shared/cast'

describe('canal Cast', () => {
  test('espace de noms au format exigé par Google (urn:x-cast:…)', () => {
    expect(CAST_NAMESPACE.startsWith('urn:x-cast:')).toBe(true)
  })

  test('code valide : normalisé', () => {
    expect(readCastRoomCode({ code: 'abcd' })).toBe('ABCD')
    expect(readCastRoomCode({ code: ' K7MP ' })).toBe('K7MP')
  })

  test('message mal formé ou code invalide : ignoré', () => {
    for (const data of [null, 'ABCD', 42, {}, { code: 1234 }, { code: 'AB' }, { code: 'O0I1' }]) {
      expect(readCastRoomCode(data)).toBeNull()
    }
  })
})
