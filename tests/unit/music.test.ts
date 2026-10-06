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

  test('classement : la musique de la question continue ; fin : musique de fin, après le roulement en Suspense', () => {
    expect(musicPlan(inPhase('scores'), false)).toMatchObject({ track: 'game' })
    expect(musicPlan(inPhase('scores', 'free'), false).track).toBe('writing')
    expect(musicPlan(inPhase('scores', 'bluff'), false).track).toBe('vote')
    expect(musicPlan(inPhase('ended'), false)).toMatchObject({ track: 'final', startAt: NOW })
    const suspense = inPhase('ended', 'choice', { settings: { ...makeSession().settings, suspense: true } })
    expect(musicPlan(suspense, false)).toMatchObject({ track: 'final', startAt: NOW + SUSPENSE_DRUMROLL_MS })
  })

  test('blind test : silence pendant l’extrait (arrêt rapide), musique de jeu dès la bonne réponse, au salon, au classement et à la fin', () => {
    expect(musicPlan(inPhase('question', 'choice', { currentQuestion: BLIND_TEST_QUESTION }), false)).toMatchObject({ track: null, fastStop: true })
    expect(musicPlan(inPhase('reveal'), true)).toMatchObject({ track: 'game', fastStop: false })
    expect(musicPlan(inPhase('reveal', 'free'), true).track).toBe('game')
    expect(musicPlan(inPhase('reveal', 'choice', { currentQuestion: BLIND_TEST_QUESTION }), false).track).toBe('game')
    expect(musicPlan(inPhase('question', 'free'), true).track).toBeNull()
    expect(musicPlan(inPhase('lobby'), true).track).toBe('waiting')
    expect(musicPlan(inPhase('ended'), true).track).toBe('final')
  })

  test('Rejouer : la musique de fin cède la place à celle du salon ; pause impossible en fin de partie', () => {
    expect(musicPlan(inPhase('lobby'), false)).toMatchObject({ track: 'waiting', isPaused: false })
    expect(musicPlan(inPhase('ended'), false).isPaused).toBe(false)
  })

  test('blind test : la musique se tait à la fin du 3-2-1, de la révélation et du classement, avant l’extrait', () => {
    // Révélation suivie du classement : la musique continue (pas d'arrêt à la fin de la révélation).
    expect(musicPlan(inPhase('reveal'), true)).toMatchObject({ track: 'game', stopBy: undefined })
    // Suspense : la question suivante suit directement la révélation, la musique se tait avant son extrait.
    const suspense = { ...makeSession().settings, suspense: true }
    expect(musicPlan(inPhase('reveal', 'choice', { settings: suspense }), true)).toMatchObject({ track: 'game', stopBy: NOW + 20_000 })
    expect(musicPlan(inPhase('reveal', 'choice', { settings: suspense, phaseEndsAt: 0 }), true).stopBy).toBeUndefined()
    expect(musicPlan(inPhase('starting'), true)).toMatchObject({ track: 'waiting', stopBy: NOW + 20_000 })
    expect(musicPlan(inPhase('scores'), true)).toMatchObject({ track: 'game', stopBy: NOW + 20_000 })
    expect(musicPlan(inPhase('scores', 'free'), true).track).toBe('game')
    // Pas à pas : pas d'échéance, la question suivante coupera la musique.
    expect(musicPlan(inPhase('scores', 'choice', { phaseEndsAt: 0 }), true).stopBy).toBeUndefined()
  })

  test('pause : musique d’attente, la musique de la phase est retenue pour la reprise', () => {
    const paused = inPhase('paused', 'choice', { pausedFrom: 'question', remainingMs: 5_000 })
    expect(musicPlan(paused, false)).toEqual({ track: 'waiting', heldTrack: 'game', fastStop: false, isPaused: true })
    const bluff = inPhase('paused', 'bluff', { pausedFrom: 'vote', remainingMs: 5_000 })
    expect(musicPlan(bluff, false)).toMatchObject({ track: 'waiting', heldTrack: 'vote' })
    // Blind test : rien à reprendre (l'extrait reprend de lui-même), mais la musique d'attente joue aussi.
    const blindTest = inPhase('paused', 'choice', { pausedFrom: 'question', currentQuestion: BLIND_TEST_QUESTION })
    expect(musicPlan(blindTest, false)).toMatchObject({ track: 'waiting', heldTrack: null })
    // Pause pendant la musique d'attente (3-2-1) : rien ne change, ni arrêt avant l'extrait pendant la pause.
    expect(musicPlan(inPhase('paused', 'choice', { pausedFrom: 'starting' }), true)).toEqual({ track: 'waiting', fastStop: false, isPaused: true })
  })

  test('pistes à préparer selon le mode, dans l’ordre d’utilisation', () => {
    expect(musicTracksFor('choice', false)).toEqual(['waiting', 'game', 'final'])
    expect(musicTracksFor('bluff', false)).toEqual(['waiting', 'writing', 'vote', 'final'])
    expect(musicTracksFor('free', false)).toEqual(['waiting', 'writing', 'final'])
    expect(musicTracksFor('free', true)).toEqual(['waiting', 'game', 'final'])
  })

  test('manifeste : toutes les musiques bouclent ; la musique de fin démarre net, et boucle sur son début', () => {
    expect(MUSIC_TRACK_IDS.filter((id) => !MUSIC_TRACKS[id].loop)).toEqual([])
    expect(MUSIC_TRACK_IDS.filter((id) => MUSIC_TRACKS[id].cue)).toEqual(['final'])
    // Fichier de 16,7 s : la boucle (8,348 s) et son raccord tiennent dedans.
    expect(MUSIC_TRACKS.final.loopEndS).toBeGreaterThan(8)
    expect(MUSIC_TRACKS.final.loopEndS).toBeLessThan(16)
    expect(MUSIC_TRACKS.game.volume).toBeLessThan(MUSIC_TRACKS.waiting.volume)
  })
})
