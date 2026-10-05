import { describe, expect, test } from 'vitest'

import { musicPlan, musicTracksFor } from '../../shared/music'
import { MUSIC_TRACK_IDS, MUSIC_TRACKS } from '../../shared/musicTracks'
import { SUSPENSE_DRUMROLL_MS } from '../../shared/sound'
import type { AnswerMode, Session } from '../../shared/types'
import { makeSession } from './engineFixtures'

const NOW = 1_000_000

function inPhase(status: Session['status'], answerMode: AnswerMode = 'choice', overrides: Partial<Session> = {}): Session {
  const base = makeSession()
  return makeSession({ status, phaseStartedAt: NOW, phaseEndsAt: NOW + 20_000, settings: { ...base.settings, answerMode }, ...overrides })
}

const BLIND_TEST_QUESTION = { text: 'Quel est ce titre ?', difficulty: 1 as const, timeLimit: 20, audio: { url: 'https://a', startS: 0, durationS: 20 } }

describe('Musique de la TV selon la phase (spec 17)', () => {
  test('salon et 3-2-1 : attente', () => {
    expect(musicPlan(inPhase('lobby'), false)).toMatchObject({ track: 'waiting', isPaused: false })
    expect(musicPlan(inPhase('starting'), false)).toMatchObject({ track: 'waiting', stopBy: undefined })
  })

  test('choix multiples : musique de jeu pendant la question et la révélation', () => {
    expect(musicPlan(inPhase('question'), false).track).toBe('game')
    expect(musicPlan(inPhase('reveal'), false).track).toBe('game')
  })

  test('saisie libre (Contrôle compris) : musique d’écriture', () => {
    expect(musicPlan(inPhase('question', 'free'), false).track).toBe('writing')
    expect(musicPlan(inPhase('validation', 'free'), false).track).toBe('writing')
    expect(musicPlan(inPhase('reveal', 'free'), false).track).toBe('writing')
  })

  test('Bluff : écriture, puis vote (aussi pendant la révélation)', () => {
    expect(musicPlan(inPhase('question', 'bluff'), false).track).toBe('writing')
    expect(musicPlan(inPhase('vote', 'bluff'), false).track).toBe('vote')
    expect(musicPlan(inPhase('reveal', 'bluff'), false).track).toBe('vote')
  })

  test('classement : jingle une fois, dès le début de la phase ; fin : jingle final, après le roulement en Suspense', () => {
    expect(musicPlan(inPhase('scores'), false)).toMatchObject({ track: 'ranking', startAt: NOW })
    expect(musicPlan(inPhase('ended'), false)).toMatchObject({ track: 'final', startAt: NOW })
    const suspense = inPhase('ended', 'choice', { settings: { ...makeSession().settings, suspense: true } })
    expect(musicPlan(suspense, false)).toMatchObject({ track: 'final', startAt: NOW + SUSPENSE_DRUMROLL_MS })
  })

  test('blind test : silence pendant la question et la révélation (arrêt rapide), musique au salon, au classement et à la fin', () => {
    expect(musicPlan(inPhase('question', 'choice', { currentQuestion: BLIND_TEST_QUESTION }), false)).toMatchObject({ track: null, fastStop: true })
    expect(musicPlan(inPhase('reveal'), true)).toMatchObject({ track: null, fastStop: true })
    expect(musicPlan(inPhase('question', 'free'), true).track).toBeNull()
    expect(musicPlan(inPhase('lobby'), true).track).toBe('waiting')
    expect(musicPlan(inPhase('ended'), true).track).toBe('final')
  })

  test('blind test : la musique se tait à la fin du 3-2-1 et du classement, avant l’extrait', () => {
    expect(musicPlan(inPhase('starting'), true)).toMatchObject({ track: 'waiting', stopBy: NOW + 20_000 })
    expect(musicPlan(inPhase('scores'), true)).toMatchObject({ track: 'ranking', stopBy: NOW + 20_000 })
    // Pas à pas : pas d'échéance, la question suivante coupera la musique.
    expect(musicPlan(inPhase('scores', 'choice', { phaseEndsAt: 0 }), true).stopBy).toBeUndefined()
  })

  test('pause : même musique que la phase interrompue, baissée', () => {
    const paused = inPhase('paused', 'choice', { pausedFrom: 'question', remainingMs: 5_000 })
    expect(musicPlan(paused, false)).toMatchObject({ track: 'game', isPaused: true })
    const bluff = inPhase('paused', 'bluff', { pausedFrom: 'vote', remainingMs: 5_000 })
    expect(musicPlan(bluff, false)).toMatchObject({ track: 'vote', isPaused: true })
  })

  test('pistes à préparer selon le mode, dans l’ordre d’utilisation', () => {
    expect(musicTracksFor('choice', false)).toEqual(['waiting', 'game', 'ranking', 'final'])
    expect(musicTracksFor('bluff', false)).toEqual(['waiting', 'writing', 'vote', 'ranking', 'final'])
    expect(musicTracksFor('choice', true)).toEqual(['waiting', 'ranking', 'final'])
  })

  test('manifeste : boucles et jingles de la spec 17', () => {
    expect(MUSIC_TRACK_IDS.filter((id) => !MUSIC_TRACKS[id].loop)).toEqual(['ranking', 'final'])
    expect(MUSIC_TRACKS.game.volume).toBeLessThan(MUSIC_TRACKS.waiting.volume)
  })
})
