import { describe, expect, test } from 'vitest'

import {
  audioCommand,
  audioPlan,
  deezerPreviewExpiresAt,
  extractOf,
  nextQuestionStart,
  fadeCurve,
  fadeGain,
  questionTimingFor,
} from '../../shared/audioPlayback'
import { AUDIO_END_FADE_MS, AUDIO_TAIL_FADE_MS, QUESTION_DURATION_S } from '../../shared/constants'
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
    const endsAt = start + timerS * 1000
    expect(audioPlan(audio, clock, start)).toEqual({ kind: 'play', positionS: 5, endsAt, level: 1, fadeMs: AUDIO_END_FADE_MS, volume: 1 })
    expect(audioPlan(audio, clock, start + 12_500)).toEqual({ kind: 'play', positionS: 17.5, endsAt, level: 1, fadeMs: AUDIO_END_FADE_MS, volume: 1 })
    expect(audioPlan(audio, clock, start + timerS * 1000)).toEqual({ kind: 'silent' })
  })

  test('chrono allé au bout : fondu court (AUDIO_END_FADE_MS), juste pour éviter le clic', () => {
    const clock = { status: 'question' as const, phaseStartedAt: start, phaseEndsAt: start + timerS * 1000 }
    const volumeAt = (remainingMs: number) => {
      const plan = audioPlan(audio, clock, start + timerS * 1000 - remainingMs)
      return plan.kind === 'play' ? plan.volume : 0
    }
    expect(volumeAt(AUDIO_END_FADE_MS + 1)).toBe(1)
    expect(volumeAt(AUDIO_END_FADE_MS / 2)).toBeCloseTo(0.5)
    expect(AUDIO_END_FADE_MS).toBeLessThan(1_000)
  })

  test('fondu en cosinus : départ et arrivée en douceur ; courbe de la rampe native décroissante, au volume de base', () => {
    expect(fadeGain(AUDIO_TAIL_FADE_MS * 0.9, AUDIO_TAIL_FADE_MS)).toBeGreaterThan(0.97)
    expect(fadeGain(AUDIO_TAIL_FADE_MS * 0.1, AUDIO_TAIL_FADE_MS)).toBeLessThan(0.03)
    const curve = fadeCurve(AUDIO_TAIL_FADE_MS, AUDIO_TAIL_FADE_MS, 0.8, 9)
    expect(curve[0]).toBeCloseTo(0.8)
    expect(curve[8]).toBe(0)
    for (let i = 1; i < curve.length; i++) expect(curve[i]).toBeLessThanOrEqual(curve[i - 1])
    // Fondu commencé en retard (TV rechargée dans les dernières secondes) : il part du volume du moment.
    expect(fadeCurve(AUDIO_TAIL_FADE_MS / 2, AUDIO_TAIL_FADE_MS, 1, 5)[0]).toBeCloseTo(fadeGain(AUDIO_TAIL_FADE_MS / 2, AUDIO_TAIL_FADE_MS))
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
  // Même fin de timing (début de la question + 20 s) pendant la question et après : fondu jamais reprogrammé.
  const KEEP = { kind: 'keep', level: 1, endsAt: start + timerS * 1000, fadeMs: AUDIO_END_FADE_MS, volume: 1 }
  // Tout le monde a répondu avant la fin : fondu long, programmé une fois à la révélation.
  const KEEP_TAIL = { kind: 'keep', level: 1, endsAt: start + timerS * 1000, fadeMs: AUDIO_TAIL_FADE_MS, volume: 1 }
  const asked = { startedAt: start, answeredAt: start + 8_000 }

  test('début de question : démarrage à la position calée sur le serveur', () => {
    expect(audioCommand(audioPlan(audio, question, start + 2_000), stopped, URL)).toEqual({
      kind: 'start',
      positionS: 7,
      level: 1,
      endsAt: start + timerS * 1000,
      fadeMs: AUDIO_END_FADE_MS,
      volume: 1,
    })
  })

  test('en pleine lecture : le lecteur garde son fondu programmé, jamais de déplacement (pas de saut audible)', () => {
    expect(audioCommand(audioPlan(audio, question, start + 9_000), playing, URL)).toEqual(KEEP)
  })

  test('TV qui n’a pas vu le début de la question (rechargée en pleine révélation) : silence, jamais de démarrage', () => {
    const reveal = { status: 'reveal' as const, phaseStartedAt: start + 8_000, phaseEndsAt: start + 14_000 }
    expect(audioCommand(audioPlan(audio, reveal, start + 8_000), playing, URL)).toEqual({ kind: 'fadeOut' })
    expect(audioCommand(audioPlan(audio, reveal, start + 10_000), stopped, URL)).toEqual({ kind: 'none' })
  })

  test('tout le monde a répondu : l’extrait continue pendant la révélation jusqu’au bout de son timing', () => {
    // Fin anticipée à 8 s ; timing de 20 s compté depuis le début de la question.
    const reveal = { status: 'reveal' as const, phaseStartedAt: start + 8_000, phaseEndsAt: start + 14_000 }
    expect(audioCommand(audioPlan(audio, reveal, start + 8_000, asked), playing, URL)).toEqual(KEEP_TAIL)
    expect(audioCommand(audioPlan(audio, reveal, start + 15_000, asked), playing, URL)).toEqual(KEEP_TAIL)
    // Fondu long (au moins 5 s) qui finit pile à la fin du timing, puis arrêt.
    const fading = audioPlan(audio, reveal, start + timerS * 1000 - AUDIO_TAIL_FADE_MS / 2, asked)
    expect(fading.kind === 'play' && fading.volume).toBeCloseTo(0.5)
    expect(AUDIO_TAIL_FADE_MS).toBeGreaterThanOrEqual(5_000)
    expect(audioCommand(audioPlan(audio, reveal, start + timerS * 1000, asked), playing, URL)).toEqual({ kind: 'fadeOut' })
  })

  test('après la question : l’extrait continue aussi au Contrôle et au classement, jamais au 3-2-1, en pause ni à la fin', () => {
    for (const status of ['validation', 'scores'] as const) {
      const clock = { status, phaseStartedAt: start + 8_000, phaseEndsAt: 0 }
      expect(audioCommand(audioPlan(audio, clock, start + 12_000, asked), playing, URL)).toEqual(KEEP_TAIL)
    }
    for (const status of ['starting', 'paused', 'ended', 'lobby'] as const) {
      const clock = { status, phaseStartedAt: start + 8_000, phaseEndsAt: 0 }
      expect(audioCommand(audioPlan(audio, clock, start + 12_000, asked), playing, URL)).toEqual({ kind: 'fadeOut' })
    }
  })

  test('réponses tardives : le fondu part quand tout le monde a répondu, sur le temps qui reste, sans saut de volume', () => {
    // Tout le monde a répondu à 17 s : il reste 3 s, moins que le fondu long.
    const reveal = { status: 'reveal' as const, phaseStartedAt: start + 17_000, phaseEndsAt: start + 23_000 }
    const late = { startedAt: start, answeredAt: start + 17_000 }
    const atAnswer = audioPlan(audio, reveal, start + 17_000, late)
    expect(atAnswer).toMatchObject({ kind: 'play', fadeMs: 3_000, volume: 1 })
    const midway = audioPlan(audio, reveal, start + 18_500, late)
    expect(midway.kind === 'play' && midway.volume).toBeCloseTo(0.5)
    // Le classement qui suit garde la même durée de fondu (pas de reprogrammation).
    const scores = { status: 'scores' as const, phaseStartedAt: start + 19_000, phaseEndsAt: 0 }
    expect(audioPlan(audio, scores, start + 19_000, late)).toMatchObject({ fadeMs: 3_000 })
  })

  test('après la question : jamais de démarrage (reprise après une pause, extrait pas encore parti, autre adresse)', () => {
    const reveal = { status: 'reveal' as const, phaseStartedAt: start + 8_000, phaseEndsAt: start + 14_000 }
    expect(audioCommand(audioPlan(audio, reveal, start + 9_000, asked), stopped, URL)).toEqual({ kind: 'none' })
    expect(audioCommand(audioPlan(audio, reveal, start + 9_000, asked), { isPlaying: true, url: `${URL}&autre` }, URL)).toEqual({
      kind: 'none',
    })
  })

  test('saisie libre : timing de 30 s', () => {
    const free: PublicAudio = { url: URL, startS: 0, durationS: QUESTION_DURATION_S.free }
    const reveal = { status: 'reveal' as const, phaseStartedAt: start + 10_000, phaseEndsAt: start + 16_000 }
    expect(audioPlan(free, reveal, start + 25_000, asked)).toMatchObject({ kind: 'play', positionS: 25, continueOnly: true })
    expect(audioPlan(free, reveal, start + 30_000, asked)).toEqual({ kind: 'silent' })
  })

  test('début de la question retenu par la TV : chrono de la question (décalé après une pause), oublié à la question suivante', () => {
    const asked = nextQuestionStart(null, { status: 'question', currentIndex: 2, phaseStartedAt: start })
    expect(asked).toEqual({ index: 2, startedAt: start })
    expect(nextQuestionStart(asked, { status: 'question', currentIndex: 2, phaseStartedAt: start })).toBe(asked)
    const reveal = nextQuestionStart(asked, { status: 'reveal', currentIndex: 2, phaseStartedAt: start + 8_000 })
    // Champs reçus un par un : la révélation arrive avant son phaseStartedAt, rien n'est encore noté.
    expect(nextQuestionStart(asked, { status: 'reveal', currentIndex: 2, phaseStartedAt: start })?.answeredAt).toBeUndefined()
    // Première phase après la question : moment où tout le monde a répondu, gardé ensuite.
    expect(questionTimingFor(reveal, 2)).toEqual({ index: 2, startedAt: start, answeredAt: start + 8_000 })
    const scores = nextQuestionStart(reveal, { status: 'scores', currentIndex: 2, phaseStartedAt: start + 12_000 })
    expect(scores?.answeredAt).toBe(start + 8_000)
    expect(nextQuestionStart(asked, { status: 'question', currentIndex: 2, phaseStartedAt: start + 5_000 })).toEqual({ index: 2, startedAt: start + 5_000 })
    expect(questionTimingFor(reveal, 3)).toBeNull()
    expect(questionTimingFor(null, 2)).toBeNull()
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

  test('extrait suivant (nextAudio) : publié à la révélation, identique à celui de la question suivante, effacé à son début', () => {
    const asked = makeSession({ status: 'question', currentIndex: 0, questionCount: 2, phaseEndsAt: 2_000_000 })
    const reveal = transitionUpdate(asked, MUSIC_QUESTIONS, { status: 'question', currentIndex: 0 }, 2_000_000, URLS)
    const nextPublic = toPublicQuestion(MUSIC_QUESTIONS[1], 'choice', URLS['q-1']).audio
    expect(reveal).toMatchObject({ status: 'reveal', nextAudio: nextPublic })
    // Jamais le titre, l'artiste ni l'identifiant du morceau suivant.
    expect(JSON.stringify(reveal?.nextAudio)).not.toContain('42')
    const scores = makeSession({ status: 'scores', currentIndex: 0, questionCount: 2, nextAudio: nextPublic })
    const next = transitionUpdate(scores, MUSIC_QUESTIONS, { status: 'scores', currentIndex: 0 }, 2_010_000, URLS)
    expect(next).toMatchObject({ status: 'question', currentIndex: 1, nextAudio: null, currentQuestion: { audio: nextPublic } })
  })

  test('extrait suivant : rien à la dernière question, ni dans une partie sans blind test (champ jamais écrit)', () => {
    const last = makeSession({ status: 'question', currentIndex: 1, questionCount: 2, phaseEndsAt: 2_000_000 })
    expect(transitionUpdate(last, MUSIC_QUESTIONS, { status: 'question', currentIndex: 1 }, 2_000_000, URLS)).not.toHaveProperty('nextAudio')
    const quiz = [makeQuestion(0), makeQuestion(1)]
    const asked = makeSession({ status: 'question', currentIndex: 0, questionCount: 2, phaseEndsAt: 2_000_000 })
    const reveal = transitionUpdate(asked, quiz, { status: 'question', currentIndex: 0 }, 2_000_000)
    expect(reveal).not.toHaveProperty('nextAudio')
    const scores = makeSession({ status: 'scores', currentIndex: 0, questionCount: 2 })
    expect(transitionUpdate(scores, quiz, { status: 'scores', currentIndex: 0 }, 2_010_000)).not.toHaveProperty('nextAudio')
  })

  test('extrait suivant : adresse renouvelée avec celle de la question en cours', () => {
    const nextPublic = toPublicQuestion(MUSIC_QUESTIONS[1], 'choice', URLS['q-1']).audio
    const session = makeSession({ status: 'scores', currentIndex: 0, nextAudio: nextPublic })
    expect(audioUrlUpdate(session, MUSIC_QUESTIONS, URLS)).toBeNull()
    expect(audioUrlUpdate(session, MUSIC_QUESTIONS, { ...URLS, 'q-1': `${URL}y` })).toEqual({ 'nextAudio/url': `${URL}y` })
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
