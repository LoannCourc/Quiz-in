import { describe, expect, test } from 'vitest'

import { audioCommand, audioPlan, deezerPreviewExpiresAt, extractOf } from '../../shared/audioPlayback'
import { AUDIO_FADE_OUT_MS, QUESTION_DURATION_S } from '../../shared/constants'
import {
  audioUrlUpdate,
  buildReveal,
  launchUpdate,
  toPublicQuestion,
  transitionUpdate,
} from '../../shared/hostEngine'
import { fitsBlindTestTimer, parseMusicTrack, parseQuestion, parseQuizSummary } from '../../shared/quizValidation'
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
  const timerS = QUESTION_DURATION_S.choice
  const audio: PublicAudio = { url: URL, startS: 5, durationS: timerS }
  const start = 1_000_000

  test('extrait : début du morceau (0 par défaut), durée du timer, jamais au-delà de la preview', () => {
    expect(extractOf({}, 20)).toEqual({ startS: 0, durationS: 20 })
    expect(extractOf({ startS: 8 }, 20)).toEqual({ startS: 8, durationS: 20 })
    expect(extractOf({ startS: 15 }, 20)).toEqual({ startS: 15, durationS: 15 })
  })

  test('question : position calée sur le temps écoulé, pendant tout le timer', () => {
    const clock = { status: 'question' as const, phaseStartedAt: start, phaseEndsAt: start + timerS * 1000 }
    expect(audioPlan(audio, clock, start)).toEqual({ kind: 'play', positionS: 5, volume: 1 })
    expect(audioPlan(audio, clock, start + 12_500)).toEqual({ kind: 'play', positionS: 17.5, volume: 1 })
    expect(audioPlan(audio, clock, start + timerS * 1000)).toEqual({ kind: 'silent' })
  })

  test('fin du timer : fondu court sur les dernières millisecondes', () => {
    const clock = { status: 'question' as const, phaseStartedAt: start, phaseEndsAt: start + timerS * 1000 }
    const plan = audioPlan(audio, clock, start + timerS * 1000 - AUDIO_FADE_OUT_MS / 2)
    expect(plan.kind === 'play' && plan.volume).toBeCloseTo(0.5)
  })

  test('révélation (fin anticipée ou timer écoulé), pause, classement, fin : silence', () => {
    for (const status of ['reveal', 'paused', 'scores', 'ended', 'starting'] as const) {
      expect(audioPlan(audio, { status, phaseStartedAt: start, phaseEndsAt: start + 6_000 }, start + 1_000)).toEqual({
        kind: 'silent',
      })
    }
  })

  test('expiration lue dans le jeton de l’adresse Deezer', () => {
    expect(deezerPreviewExpiresAt(URL)).toBe(1_791_107_825_000)
    expect(deezerPreviewExpiresAt('https://exemple.fr/a.mp3')).toBeNull()
  })
})

describe('ordres au lecteur de la TV (audioCommand)', () => {
  const timerS = QUESTION_DURATION_S.choice
  const audio: PublicAudio = { url: URL, startS: 5, durationS: timerS }
  const start = 1_000_000
  const question = { status: 'question' as const, phaseStartedAt: start, phaseEndsAt: start + timerS * 1000 }
  const playing = { isPlaying: true, url: URL }
  const stopped = { isPlaying: false, url: null }

  test('début de question : démarrage à la position calée sur le serveur', () => {
    expect(audioCommand(audioPlan(audio, question, start + 2_000), stopped, URL)).toEqual({
      kind: 'start',
      positionS: 7,
      volume: 1,
    })
  })

  test('en pleine lecture : volume seulement, jamais de déplacement (pas de saut audible)', () => {
    expect(audioCommand(audioPlan(audio, question, start + 9_000), playing, URL)).toEqual({ kind: 'volume', volume: 1 })
  })

  test('tout le monde a répondu (passage à la révélation) : fondu de sortie, jamais de redémarrage', () => {
    const reveal = { status: 'reveal' as const, phaseStartedAt: start + 8_000, phaseEndsAt: start + 14_000 }
    expect(audioCommand(audioPlan(audio, reveal, start + 8_000), playing, URL)).toEqual({ kind: 'fadeOut' })
    // Ensuite, pendant toute la révélation : plus rien (pas de relance).
    expect(audioCommand(audioPlan(audio, reveal, start + 10_000), stopped, URL)).toEqual({ kind: 'none' })
  })

  test('timer écoulé : fondu sur la fin, puis arrêt ; pause : arrêt', () => {
    const ended = audioPlan(audio, question, start + timerS * 1000)
    expect(audioCommand(ended, playing, URL)).toEqual({ kind: 'fadeOut' })
    const paused = { status: 'paused' as const, phaseStartedAt: start, phaseEndsAt: 0 }
    expect(audioCommand(audioPlan(audio, paused, start + 3_000), playing, URL)).toEqual({ kind: 'fadeOut' })
  })

  test('reprise après une pause : redémarrage à la position calée', () => {
    // La reprise décale phaseStartedAt de la durée de la pause : la position reste la bonne.
    const resumed = { status: 'question' as const, phaseStartedAt: start + 60_000, phaseEndsAt: start + 80_000 }
    expect(audioCommand(audioPlan(audio, resumed, start + 63_000), stopped, URL)).toMatchObject({
      kind: 'start',
      positionS: 8,
    })
  })

  test('nouvelle question : démarrage du nouvel extrait, même si l’ancien joue encore', () => {
    expect(audioCommand(audioPlan(audio, question, start), { isPlaying: true, url: 'https://autre.mp3' }, URL)).toMatchObject({
      kind: 'start',
    })
  })
})

describe('validation des données du blind test', () => {
  test('morceau valide, avec ou sans début', () => {
    expect(parseMusicTrack(TRACK)).toEqual(TRACK)
    expect(parseMusicTrack({ source: 'deezer', id: '1', title: 'T', artist: 'A' })).toEqual({
      source: 'deezer',
      id: '1',
      title: 'T',
      artist: 'A',
    })
  })

  test('morceau refusé : source inconnue, identifiant vide, début hors de la preview', () => {
    expect(parseMusicTrack({ ...TRACK, source: 'spotify' })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, id: '' })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, startS: -1 })).toBeNull()
    expect(parseMusicTrack({ ...TRACK, startS: 30 })).toBeNull()
  })

  test('l’extrait doit couvrir tout le timer : début + timer ≤ 30 s', () => {
    expect(fitsBlindTestTimer({ startS: 10 })).toBe(true)
    expect(fitsBlindTestTimer({ startS: 11 })).toBe(false)
    expect(fitsBlindTestTimer({ startS: 15 }, 15)).toBe(true)
    expect(parseQuestion(musicQuestion(0, { startS: 11 }))).toBeNull()
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
    expect(published.audio).toEqual({ url: URL, startS: 5, durationS: QUESTION_DURATION_S.choice })
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
