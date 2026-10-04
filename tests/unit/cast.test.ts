import { describe, expect, test } from 'vitest'

import { CAST_NAMESPACE, readCastAudioTest, readCastRoomCode } from '../../shared/cast'
import { pauseUpdate } from '../../shared/hostEngine'
import { makeSession } from './engineFixtures'

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

// Pause automatique quand la session Cast se termine sans demande de l'hôte (spec 6.6) : même
// fonction que le bouton Pause, appliquée seulement si la partie avance.
describe('test du son par le canal Cast', () => {
  test('adresse https acceptée, tout le reste ignoré', () => {
    expect(readCastAudioTest({ audioTest: 'https://exemple.fr/a.mp3' })).toBe('https://exemple.fr/a.mp3')
    expect(readCastAudioTest({ audioTest: 'http://exemple.fr/a.mp3' })).toBeNull()
    expect(readCastAudioTest({ code: 'ABCD' })).toBeNull()
    expect(readCastAudioTest('audioTest')).toBeNull()
  })
})

describe('pause « Cast interrompu »', () => {
  const NOW = 5_000_000

  test('3-2-1, question, révélation, classement (et son annonce) : pause avec le temps restant', () => {
    for (const status of ['starting', 'question', 'reveal', 'scores'] as const) {
      const session = makeSession({ status, phaseEndsAt: NOW + 4_000 })
      expect(pauseUpdate(session, NOW)).toEqual({ status: 'paused', pausedFrom: status, remainingMs: 4_000 })
    }
  })

  test('lobby, fin de partie ou déjà en pause : rien', () => {
    for (const status of ['lobby', 'ended', 'paused'] as const) {
      expect(pauseUpdate(makeSession({ status, phaseEndsAt: NOW + 4_000 }), NOW)).toBeNull()
    }
  })
})
