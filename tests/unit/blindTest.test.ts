import { describe, expect, test } from 'vitest'

import { audioPlan, deezerPreviewExpiresAt, extractOf } from '../../shared/audioPlayback'
import { AUDIO_EXTRACT_S, AUDIO_FADE_OUT_MS } from '../../shared/constants'
import {
  audioUrlUpdate,
  buildReveal,
  launchUpdate,
  toPublicQuestion,
  transitionUpdate,
} from '../../shared/hostEngine'
import { parseMusicTrack, parseQuestion, parseQuizSummary } from '../../shared/quizValidation'
import type { MusicTrack, PublicAudio, Question } from '../../shared/types'
import { makeQuestion, makeSession, PLAYER } from './engineFixtures'

const TRACK: MusicTrack = { source: 'deezer', id: '6297555', title: 'Alors on danse', artist: 'Stromae', startS: 5 }
const URL = 'https://cdnt-preview.dzcdn.net/api/1/1/a.mp3?hdnea=exp=1791107825~acl=/api/1/1/a.mp3*~hmac=abc'

function musicQuestion(index: number, track: Partial<MusicTrack> = {}): Question {
  return makeQuestion(index, { text: 'Quel est ce morceau ?', music: { ...TRACK, ...track } })
}

const MUSIC_QUESTIONS = [musicQuestion(0), musicQuestion(1, { id: '42' })]
const URLS = { 'q-0': URL, 'q-1': `${URL}&b` }

describe('extrait et lecture sur la TV (audioPlan)', () => {
  const audio: PublicAudio = { url: URL, startS: 5, durationS: 12 }
  const start = 1_000_000

  test('extrait par défaut : début 0, durée AUDIO_EXTRACT_S', () => {
    expect(extractOf({})).toEqual({ startS: 0, durationS: AUDIO_EXTRACT_S })
  })

  test('question : position calée sur le temps écoulé, silence après la fin de l’extrait', () => {
    const clock = { status: 'question' as const, phaseStartedAt: start, phaseEndsAt: start + 20_000 }
    expect(audioPlan(audio, clock, start)).toEqual({ kind: 'play', positionS: 5, volume: 1, keepIfPlaying: false })
    expect(audioPlan(audio, clock, start + 3_500)).toMatchObject({ kind: 'play', positionS: 8.5 })
    expect(audioPlan(audio, clock, start + 12_000)).toEqual({ kind: 'silent' })
  })

  test('révélation : le morceau continue après l’extrait, fondu sur la fin', () => {
    const clock = { status: 'reveal' as const, phaseStartedAt: start, phaseEndsAt: start + 6_000 }
    expect(audioPlan(audio, clock, start)).toEqual({ kind: 'play', positionS: 17, volume: 1, keepIfPlaying: true })
    expect(audioPlan(audio, clock, start + 6_000 - AUDIO_FADE_OUT_MS / 2)).toMatchObject({ volume: 0.5 })
    expect(audioPlan(audio, clock, start + 6_000)).toEqual({ kind: 'silent' })
  })

  test('révélation : jamais au-delà de la preview de 30 s', () => {
    const late: PublicAudio = { url: URL, startS: 18, durationS: 12 }
    const clock = { status: 'reveal' as const, phaseStartedAt: start, phaseEndsAt: start + 6_000 }
    expect(audioPlan(late, clock, start)).toEqual({ kind: 'silent' })
  })

  test('pause, classement, fin : silence', () => {
    for (const status of ['paused', 'scores', 'ended', 'starting'] as const) {
      expect(audioPlan(audio, { status, phaseStartedAt: start, phaseEndsAt: start + 5_000 }, start + 1_000)).toEqual({
        kind: 'silent',
      })
    }
  })

  test('expiration lue dans le jeton de l’adresse Deezer', () => {
    expect(deezerPreviewExpiresAt(URL)).toBe(1_791_107_825_000)
    expect(deezerPreviewExpiresAt('https://exemple.fr/a.mp3')).toBeNull()
  })
})

describe('validation des données du blind test', () => {
  test('morceau valide, avec ou sans début et durée', () => {
    expect(parseMusicTrack(TRACK)).toEqual(TRACK)
    expect(parseMusicTrack({ source: 'deezer', id: '1', title: 'T', artist: 'A' })).toEqual({
      source: 'deezer',
      id: '1',
      title: 'T',
      artist: 'A',
    })
  })

  test('morceau refusé : source inconnue, identifiant vide, extrait hors de la preview ou de la bonne durée', () => {
    expect(parseMusicTrack({ ...TRACK, source: 'spotify' })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, id: '' })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, startS: 20 })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, durationS: 9 })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, durationS: 16 })).toBeNull()
  })

  test('question avec un morceau mal formé : refusée entière', () => {
    expect(parseQuestion(musicQuestion(0))).toMatchObject({ music: TRACK })
    expect(parseQuestion({ ...musicQuestion(0), music: { ...TRACK, title: '' } })).toBeNull()
  })

  test('fiche de type blind test acceptée, type inconnu refusé', () => {
    const summary = {
      title: 'Tubes',
      theme: 'Musique',
      gameType: 'blindTest',
      language: 'fr',
      difficulty: 1.2,
      difficultyLabel: 'Facile',
      questionCount: 10,
      estimatedMinutes: 6,
    }
    expect(parseQuizSummary(summary)).toMatchObject({ gameType: 'blindTest' })
    expect(parseQuizSummary({ ...summary, gameType: 'lyrics' })).toBeNull()
  })
})

describe('moteur : blind test', () => {
  test('question publiée : adresse et extrait seulement, jamais l’identifiant, le titre ni l’artiste', () => {
    const published = toPublicQuestion(musicQuestion(0), 'choice', URL)
    expect(published.audio).toEqual({ url: URL, startS: 5, durationS: AUDIO_EXTRACT_S })
    const text = JSON.stringify(published)
    expect(text).not.toContain(TRACK.id)
    expect(text).not.toContain('Stromae')
  })

  test('question classique : aucun extrait publié', () => {
    expect(toPublicQuestion(makeQuestion(0), 'choice', URL).audio).toBeUndefined()
  })

  test('révélation : titre, artiste et source', () => {
    const session = makeSession({ status: 'question', currentIndex: 0 })
    expect(buildReveal(musicQuestion(0), session).reveal.music).toEqual({
      title: 'Alors on danse',
      artist: 'Stromae',
      source: 'deezer',
    })
  })

  test('lancement refusé si l’interrupteur est coupé ou s’il manque une adresse', () => {
    const lobby = makeSession()
    expect(launchUpdate(lobby, MUSIC_QUESTIONS, 0)).toEqual({ ok: false, reason: 'blindTestDisabled' })
    expect(launchUpdate(lobby, MUSIC_QUESTIONS, 0, undefined, { enabled: true, urls: { 'q-0': URL } })).toEqual({
      ok: false,
      reason: 'audioUnavailable',
    })
    expect(launchUpdate(lobby, MUSIC_QUESTIONS, 0, undefined, { enabled: true, urls: URLS }).ok).toBe(true)
  })

  test('quiz classique : lancement inchangé, interrupteur ignoré', () => {
    expect(launchUpdate(makeSession(), [makeQuestion(0)], 0).ok).toBe(true)
  })

  test('passage à la question : l’adresse de l’extrait est publiée', () => {
    const session = makeSession({ status: 'starting', currentIndex: 0, questionCount: 2 })
    const update = transitionUpdate(session, MUSIC_QUESTIONS, { status: 'starting', currentIndex: 0 }, 5_000, URLS)
    expect(update).toMatchObject({ status: 'question', currentQuestion: { audio: { url: URL } } })
  })

  test('adresse renouvelée : republiée seulement si elle a changé', () => {
    const published = toPublicQuestion(musicQuestion(0), 'choice', URL)
    const session = makeSession({ status: 'paused', currentIndex: 0, currentQuestion: published })
    expect(audioUrlUpdate(session, MUSIC_QUESTIONS, URLS)).toBeNull()
    expect(audioUrlUpdate(session, MUSIC_QUESTIONS, { 'q-0': `${URL}x` })).toEqual({
      'currentQuestion/audio/url': `${URL}x`,
    })
    expect(audioUrlUpdate(makeSession({ status: 'question', players: {} }), MUSIC_QUESTIONS, URLS)).toBeNull()
  })

  test('réponses notées comme d’habitude', () => {
    const session = makeSession({
      status: 'question',
      currentIndex: 0,
      phaseEndsAt: 2_000_000,
      answers: { 0: { [PLAYER]: { value: 1, submittedAt: 1_500_000 } } },
    })
    expect(buildReveal(musicQuestion(0), session).results[PLAYER]).toMatchObject({ correct: true })
  })
})
