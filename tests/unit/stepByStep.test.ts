import { describe, expect, test } from 'vitest'

import { QUESTION_DURATION_S, REVEAL_DURATION_S, STARTING_DURATION_S } from '../../shared/constants'
import { isAnnouncingNextQuestion, isAwaitingHost, nextPhase, nextQuestionCountdown } from '../../shared/gameFlow'
import { connectionLostPauseUpdate, isHostAway, isPhaseStale } from '../../shared/hostAbsence'
import {
  buildReveal,
  hostControls,
  nextDeadline,
  pauseUpdate,
  resumeUpdate,
  transitionUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import type { Session } from '../../shared/types'
import { makeSession, PLAYER, QUESTIONS } from './engineFixtures'

const STEP_SETTINGS = { answerMode: 'choice' as const, speedBonus: true, control: false, teams: false, stepByStep: true }
const NOW = 2_000_000
const GAME = QUESTIONS.slice(0, 3)

// Applique un update à plat (chemins de premier niveau seulement) : suffisant pour enchaîner les phases.
function apply(session: Session, update: SessionUpdate | null): Session {
  expect(update).not.toBeNull()
  const next: Record<string, unknown> = { ...session }
  for (const [path, value] of Object.entries(update as SessionUpdate)) {
    if (path.includes('/')) continue
    if (value === null) delete next[path]
    else next[path] = value
  }
  return next as unknown as Session
}

function questionSession(stepByStep: boolean, overrides: Partial<Session> = {}): Session {
  return makeSession({
    status: 'question',
    currentIndex: 0,
    questionCount: GAME.length,
    phaseStartedAt: NOW - 10_000,
    phaseEndsAt: NOW + 10_000,
    settings: { ...STEP_SETTINGS, stepByStep },
    answers: { 0: { [PLAYER]: { value: 1, submittedAt: NOW - 4_000 } } },
    ...overrides,
  })
}

// Classement en attente : après « Voir le classement » depuis la révélation.
function awaitingScores(overrides: Partial<Session> = {}): Session {
  const reveal = awaitingReveal(overrides)
  const expected = { status: 'reveal' as const, currentIndex: reveal.currentIndex }
  return apply(reveal, transitionUpdate(reveal, GAME, expected, NOW + 30_000))
}

// Révélation en attente, telle que l'écrit le moteur à la fin de la question.
function awaitingReveal(overrides: Partial<Session> = {}): Session {
  const session = questionSession(true, overrides)
  const expected = { status: 'question' as const, currentIndex: session.currentIndex }
  return apply(session, transitionUpdate(session, GAME, expected, NOW))
}

describe('Pas à pas : attente après la révélation et après le classement', () => {
  test('la révélation n’a pas de durée, seule l’action de l’hôte fait avancer', () => {
    expect(nextPhase('question', { answerMode: 'choice', currentIndex: 0, questionCount: 3, stepByStep: true })).toEqual({
      status: 'reveal',
      currentIndex: 0,
      durationS: null,
    })
    const reveal = awaitingReveal()
    expect(reveal).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    expect(isAwaitingHost(reveal)).toBe(true)
    expect(nextDeadline(reveal)).toBeNull()
  })

  test('réglage désactivé : comportement inchangé (révélation de 6 s, puis classement automatique)', () => {
    const session = questionSession(false)
    const reveal = apply(session, transitionUpdate(session, GAME, { status: 'question', currentIndex: 0 }, NOW))
    expect(reveal.phaseEndsAt).toBe(NOW + REVEAL_DURATION_S.choice * 1000)
    expect(isAwaitingHost(reveal)).toBe(false)
    expect(nextDeadline(reveal)).toBe(reveal.phaseEndsAt)
    expect(hostControls(reveal).awaitingNext).toBeNull()
  })

  test('ancienne partie sans le champ stepByStep : désactivé', () => {
    const { stepByStep: _stepByStep, ...oldSettings } = STEP_SETTINGS
    expect(isAwaitingHost({ status: 'reveal', settings: oldSettings })).toBe(false)
  })

  test('« Voir le classement » : le classement attend lui aussi l’hôte', () => {
    const scores = awaitingScores()
    expect(scores).toMatchObject({ status: 'scores', phaseEndsAt: 0 })
    expect(isAwaitingHost(scores)).toBe(true)
    expect(nextDeadline(scores)).toBeNull()
  })

  test('« Question suivante » depuis le classement : 3-2-1, puis la question démarre avec son timer', () => {
    const scores = awaitingScores()
    const starting = apply(scores, transitionUpdate(scores, GAME, { status: 'scores', currentIndex: 0 }, NOW + 90_000))
    expect(starting).toMatchObject({ status: 'starting', currentIndex: 1 })
    const next = apply(starting, transitionUpdate(starting, GAME, { status: 'starting', currentIndex: 1 }, starting.phaseEndsAt))
    expect(next).toMatchObject({ status: 'question', currentIndex: 1 })
    expect(next.phaseEndsAt).toBeGreaterThan(NOW + 90_000)
  })

  test('dernière question : la révélation attend « Classement final », qui mène directement à la fin (pas de classement intermédiaire)', () => {
    const lastReveal = awaitingReveal({ currentIndex: 2, answers: { 2: {} } })
    expect(hostControls(lastReveal).awaitingNext).toBe('finalRanking')
    expect(nextQuestionCountdown(lastReveal)).toBeNull()
    const ended = apply(lastReveal, transitionUpdate(lastReveal, GAME, { status: 'reveal', currentIndex: 2 }, NOW + 90_000))
    expect(ended.status).toBe('ended')
  })

  test('double appui sur le classement : un seul passage', () => {
    const scores = awaitingScores()
    const expected = { status: 'scores' as const, currentIndex: 0 }
    const next = apply(scores, transitionUpdate(scores, GAME, expected, NOW + 1_000))
    expect(transitionUpdate(next, GAME, expected, NOW + 1_050)).toBeNull()
  })

  test('pause puis reprise pendant l’attente du classement : il reste en attente et ne repart pas', () => {
    const scores = awaitingScores()
    const paused = apply(scores, pauseUpdate(scores, NOW + 5_000))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'scores', remainingMs: 0 })
    const resumed = apply(paused, resumeUpdate(paused, NOW + 600_000))
    expect(resumed).toMatchObject({ status: 'scores', phaseEndsAt: 0 })
    expect(nextDeadline(resumed)).toBeNull()
    expect(hostControls(resumed).awaitingNext).toBe('nextQuestion')
  })

  test('joueur qui se reconnecte pendant l’attente du classement : l’état suffit à afficher l’attente', () => {
    const scores = awaitingScores()
    // Le téléphone ne garde rien en mémoire : il relit status et settings, et isAwaitingHost suffit.
    expect(isAwaitingHost({ status: scores.status, settings: scores.settings })).toBe(true)
  })

  test('double appui : un seul passage (le second ne correspond plus à l’état attendu)', () => {
    const reveal = awaitingReveal()
    const expected = { status: 'reveal' as const, currentIndex: 0 }
    const scores = apply(reveal, transitionUpdate(reveal, GAME, expected, NOW + 1_000))
    expect(transitionUpdate(scores, GAME, expected, NOW + 1_050)).toBeNull()
  })

  test('bouton de l’hôte nommé d’après sa destination : classement, question suivante, classement final', () => {
    expect(hostControls(awaitingReveal()).awaitingNext).toBe('ranking')
    expect(hostControls(awaitingScores()).awaitingNext).toBe('nextQuestion')
    const beforeLast = awaitingScores({ currentIndex: 1, answers: { 1: {} } })
    expect(hostControls(beforeLast).awaitingNext).toBe('nextQuestion')
    const lastReveal = awaitingReveal({ currentIndex: 2, answers: { 2: {} } })
    expect(hostControls(lastReveal).awaitingNext).toBe('finalRanking')
  })

  test('pause puis reprise pendant l’attente : la révélation reste en attente et ne repart pas', () => {
    const reveal = awaitingReveal()
    const paused = apply(reveal, pauseUpdate(reveal, NOW + 5_000))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'reveal', remainingMs: 0 })
    const resumed = apply(paused, resumeUpdate(paused, NOW + 600_000))
    expect(resumed).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    expect(resumed.pausedFrom).toBeUndefined()
    expect(nextDeadline(resumed)).toBeNull()
    expect(hostControls(resumed).awaitingNext).toBe('ranking')
  })

  test('appui pendant la pause : aucun bouton proposé, et la transition est ignorée', () => {
    const reveal = awaitingReveal()
    const paused = apply(reveal, pauseUpdate(reveal, NOW + 5_000))
    expect(hostControls(paused)).toMatchObject({ awaitingNext: null, skip: null, canResume: true })
    expect(transitionUpdate(paused, GAME, { status: 'reveal', currentIndex: 0 }, NOW + 6_000)).toBeNull()
  })

  test('joueurs et TV : pas de « phase bloquée » pendant l’attente, pas de compte à rebours', () => {
    const reveal = awaitingReveal()
    expect(isPhaseStale(reveal, NOW + 3_600_000)).toBe(false)
    expect(nextQuestionCountdown(reveal)).toBeNull()
  })

  test('classement en attente : ni compte à rebours, ni annonce « Question N », ni phase bloquée', () => {
    const scores = awaitingScores()
    expect(nextQuestionCountdown(scores)).toBeNull()
    expect(isAnnouncingNextQuestion(scores, NOW + 3_600_000)).toBe(false)
    expect(isPhaseStale(scores, NOW + 3_600_000)).toBe(false)
  })

  test('bonus de rapidité inchangé : calculé à la fin de la question, pas pendant l’attente', () => {
    const withStep = buildReveal(GAME[0], questionSession(true)).results[PLAYER]
    const without = buildReveal(GAME[0], questionSession(false)).results[PLAYER]
    expect(withStep).toEqual(without)
    expect(withStep.points).toBeGreaterThan(100)
  })
})

// 3-2-1 entre deux questions (spec 5.1), après « Question suivante » depuis le classement.
function countdown(overrides: Partial<Session> = {}): Session {
  const scores = awaitingScores(overrides)
  return apply(scores, transitionUpdate(scores, GAME, { status: 'scores', currentIndex: scores.currentIndex }, NOW + 90_000))
}

describe('Pas à pas : 3-2-1 avant chaque question suivante', () => {
  const CLICK = NOW + 90_000

  test('l’action de l’hôte lance un 3-2-1 de 3 s, déjà sur la question suivante, sans rien publier de la question', () => {
    const starting = countdown()
    expect(starting).toMatchObject({ status: 'starting', currentIndex: 1, phaseStartedAt: CLICK, phaseEndsAt: CLICK + STARTING_DURATION_S * 1000 })
    expect(starting.currentQuestion).toBeUndefined()
    expect(starting.reveal).toBeUndefined()
    expect(nextDeadline(starting)).toBe(starting.phaseEndsAt)
    expect(isAwaitingHost(starting)).toBe(false)
  })

  test('équité : le chrono de la question part à son affichage, à la fin du 3-2-1 (pas au clic de l’hôte)', () => {
    const starting = countdown()
    const shownAt = starting.phaseEndsAt + 40
    const question = apply(starting, transitionUpdate(starting, GAME, { status: 'starting', currentIndex: 1 }, shownAt))
    expect(question).toMatchObject({ status: 'question', currentIndex: 1, phaseStartedAt: shownAt })
    expect(question.phaseEndsAt).toBe(shownAt + (GAME[1].timeLimit ?? QUESTION_DURATION_S.choice) * 1000)
    expect(question.currentQuestion?.text).toBe(GAME[1].text)
  })

  test('mode automatique : pas de 3-2-1, le classement mène directement à la question suivante', () => {
    expect(nextPhase('scores', { answerMode: 'choice', currentIndex: 0, questionCount: 3 })).toMatchObject({ status: 'question', currentIndex: 1 })
    expect(nextPhase('scores', { answerMode: 'choice', currentIndex: 0, questionCount: 3, stepByStep: true })).toEqual({
      status: 'starting',
      currentIndex: 1,
      durationS: STARTING_DURATION_S,
    })
  })

  test('tous les jeux : choix, réponse libre, Bluff et Dessine-moi passent par le 3-2-1 ; Suspense aussi', () => {
    for (const answerMode of ['choice', 'free', 'bluff', 'draw'] as const) {
      expect(nextPhase('scores', { answerMode, currentIndex: 0, questionCount: 3, stepByStep: true })?.status).toBe('starting')
      expect(nextPhase('starting', { answerMode, currentIndex: 1, questionCount: 3, stepByStep: true })).toMatchObject({ status: 'question', currentIndex: 1 })
    }
    expect(nextPhase('reveal', { answerMode: 'choice', currentIndex: 0, questionCount: 3, stepByStep: true, suspense: true })).toMatchObject({
      status: 'starting',
      currentIndex: 1,
    })
  })

  test('lancement inchangé : le 3-2-1 du début mène à la question 1', () => {
    expect(nextPhase('starting', { answerMode: 'choice', currentIndex: 0, questionCount: 3 })).toMatchObject({ status: 'question', currentIndex: 0 })
  })

  test('contrôles de l’hôte pendant le décompte : « Question suivante » (pas « question 1 »), pause possible, pas de gros bouton', () => {
    expect(hostControls(countdown())).toMatchObject({ skip: 'nextQuestion', canPause: true, awaitingNext: null })
    expect(hostControls(makeSession({ status: 'starting', currentIndex: 0, phaseEndsAt: NOW + 3_000 })).skip).toBe('firstQuestion')
  })

  test('pause puis reprise pendant le décompte : le temps restant est gardé, puis la question suivante', () => {
    const starting = countdown()
    const paused = apply(starting, pauseUpdate(starting, CLICK + 1_000))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'starting', remainingMs: 2_000, currentIndex: 1 })
    expect(hostControls(paused).skip).toBeNull()
    const resumed = apply(paused, resumeUpdate(paused, CLICK + 60_000))
    expect(resumed).toMatchObject({ status: 'starting', currentIndex: 1, phaseEndsAt: CLICK + 62_000 })
    const question = apply(resumed, transitionUpdate(resumed, GAME, { status: 'starting', currentIndex: 1 }, resumed.phaseEndsAt))
    expect(question).toMatchObject({ status: 'question', currentIndex: 1, phaseStartedAt: CLICK + 62_000 })
  })

  test('hôte parti pendant le décompte : absence affichée, phase bloquée signalée ; à son retour, la suite (jamais coincée en 3-2-1)', () => {
    const starting = countdown()
    expect(isHostAway({ ...starting, hostLeftAt: CLICK + 1_000 })).toBe(true)
    expect(isPhaseStale(starting, starting.phaseEndsAt + 5_000)).toBe(true)
    // Retour après une coupure vue par le téléphone : pause avec le temps qui restait, puis reprise.
    const paused = apply(starting, connectionLostPauseUpdate(starting, CLICK + 1_000))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'starting', remainingMs: 2_000 })
    const resumed = apply(paused, resumeUpdate(paused, CLICK + 300_000))
    const question = apply(resumed, transitionUpdate(resumed, GAME, { status: 'starting', currentIndex: 1 }, resumed.phaseEndsAt))
    expect(question).toMatchObject({ status: 'question', currentIndex: 1 })
    // Retour sans pause : l'échéance est passée, la question part aussitôt.
    expect(transitionUpdate(starting, GAME, { status: 'starting', currentIndex: 1 }, CLICK + 300_000)).toMatchObject({ status: 'question', currentIndex: 1 })
  })

  test('« Passer » pendant le décompte : la question tout de suite ; double appui ignoré', () => {
    const starting = countdown()
    const expected = { status: 'starting' as const, currentIndex: 1 }
    const question = apply(starting, transitionUpdate(starting, GAME, expected, CLICK + 500))
    expect(question).toMatchObject({ status: 'question', currentIndex: 1, phaseStartedAt: CLICK + 500 })
    expect(transitionUpdate(question, GAME, expected, CLICK + 550)).toBeNull()
  })
})

describe('Après la dernière question : directement l’écran de fin', () => {
  const context = { answerMode: 'choice' as const, questionCount: 3 }

  test('mode automatique : révélation de la dernière question → fin, sans classement intermédiaire', () => {
    expect(nextPhase('reveal', { ...context, currentIndex: 1 })).toMatchObject({ status: 'scores' })
    expect(nextPhase('reveal', { ...context, currentIndex: 2 })).toEqual({ status: 'ended', currentIndex: 2, durationS: null })
    // Suspense, Pas à pas, Bluff, blind test (mode choix) : même fin directe.
    expect(nextPhase('reveal', { ...context, currentIndex: 2, suspense: true }).status).toBe('ended')
    expect(nextPhase('reveal', { ...context, currentIndex: 2, stepByStep: true }).status).toBe('ended')
    expect(nextPhase('reveal', { answerMode: 'bluff', questionCount: 3, currentIndex: 2, choiceCount: 5 }).status).toBe('ended')
  })

  test('compte à rebours de la dernière révélation : jusqu’à l’écran de fin, sans durée de classement', () => {
    const reveal = makeSession({ status: 'reveal', currentIndex: 2, questionCount: 3, phaseStartedAt: NOW, phaseEndsAt: NOW + 6_000 })
    expect(nextQuestionCountdown(reveal)).toEqual({ startsAt: NOW, endsAt: NOW + 6_000, isLastQuestion: true })
  })

  test('partie à une seule question : question → révélation → fin', () => {
    const single = questionSession(false, { questionCount: 1 })
    const reveal = apply(single, transitionUpdate(single, GAME.slice(0, 1), { status: 'question', currentIndex: 0 }, NOW))
    expect(reveal.status).toBe('reveal')
    expect(hostControls(reveal).skip).toBe('finalRanking')
    const ended = apply(reveal, transitionUpdate(reveal, GAME.slice(0, 1), { status: 'reveal', currentIndex: 0 }, NOW + 10_000))
    expect(ended.status).toBe('ended')
  })
})
