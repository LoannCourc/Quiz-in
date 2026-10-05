import { describe, expect, test } from 'vitest'

import {
  CUE_MAX_AGE_MS,
  DEFAULT_SOUND_SETTINGS,
  SOUND_MIX,
  channelGains,
  masterGain,
  parseSoundSettings,
  soundCues,
  soundSettingsOf,
} from '../../shared/sound'
import { makeSession } from './engineFixtures'

const NOW = 1_000_000

describe('Réglages du son', () => {
  test('forme valide acceptée, le reste refusé', () => {
    expect(parseSoundSettings({ music: false, effects: true, volume: 40 })).toEqual({ music: false, effects: true, volume: 40 })
    expect(parseSoundSettings({ music: false, effects: true, volume: 140 })).toBeNull()
    expect(parseSoundSettings({ music: false, effects: true, volume: 40.5 })).toBeNull()
    expect(parseSoundSettings({ music: 'oui', effects: true, volume: 40 })).toBeNull()
    expect(parseSoundSettings(null)).toBeNull()
  })

  test('partie sans réglage du son : réglages par défaut', () => {
    expect(soundSettingsOf({})).toEqual(DEFAULT_SOUND_SETTINGS)
    expect(soundSettingsOf({ sound: { music: false, effects: false, volume: 20 } })).toEqual({ music: false, effects: false, volume: 20 })
  })

  test('gains : courbe du volume, part des canaux, interrupteurs', () => {
    expect(masterGain(0)).toBe(0)
    expect(masterGain(100)).toBe(1)
    expect(masterGain(60)).toBeLessThan(0.6)
    expect(channelGains({ music: true, effects: true, volume: 100 })).toEqual(SOUND_MIX)
    expect(channelGains({ music: false, effects: true, volume: 100 })).toEqual({ music: 0, effects: SOUND_MIX.effects })
    expect(channelGains({ music: true, effects: false, volume: 100 })).toEqual({ music: SOUND_MIX.music, effects: 0 })
  })
})

describe('Sons déduits de l’état de la partie', () => {
  const lobby = makeSession({ status: 'lobby', players: { a: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true } } })
  const question = makeSession({ status: 'question', currentIndex: 0, phaseStartedAt: NOW - 500, phaseEndsAt: NOW + 19_500 })

  test('premier état reçu : aucun son (TV ouverte en pleine partie)', () => {
    expect(soundCues(null, question, NOW)).toEqual([])
  })

  test('un joueur rejoint le salon', () => {
    const joined = { ...lobby, players: { ...lobby.players, b: { name: 'Tom', avatar: '🐙', score: 0, rank: 1, connected: true } } }
    expect(soundCues(lobby, joined, NOW)).toEqual(['playerJoined'])
    // Un joueur qui part, ou rien de nouveau : silence.
    expect(soundCues(joined, lobby, NOW)).toEqual([])
    expect(soundCues(lobby, lobby, NOW)).toEqual([])
  })

  test('question qui apparaît : nouvelle phase ou nouvelle question, seulement si elle est récente', () => {
    const starting = makeSession({ status: 'starting' })
    expect(soundCues(starting, question, NOW)).toEqual(['questionShown'])
    expect(soundCues(question, { ...question, currentIndex: 1 }, NOW)).toEqual(['questionShown'])
    expect(soundCues(question, question, NOW)).toEqual([])
    expect(soundCues(starting, question, NOW + CUE_MAX_AGE_MS)).toEqual([])
  })

  test('pause, puis reprise sans rejouer la question', () => {
    const paused = makeSession({ status: 'paused', pausedFrom: 'question', remainingMs: 12_000 })
    expect(soundCues(question, paused, NOW)).toEqual(['paused'])
    expect(soundCues(paused, question, NOW)).toEqual(['resumed'])
    // Terminer pendant la pause : pas de son de reprise.
    expect(soundCues(paused, makeSession({ status: 'ended' }), NOW)).toEqual([])
  })
})
