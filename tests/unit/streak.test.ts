import { describe, expect, test } from 'vitest'

import { QUESTION_DURATION_S } from '../../shared/constants'
import { replayUpdate, transitionUpdate, validateUpdate, type SessionUpdate } from '../../shared/hostEngine'
import { nextStreak, STREAK_MAX } from '../../shared/streak'
import type { Answer, BluffChoice, Player, PlayerId, Question, Session, SessionSettings } from '../../shared/types'
import { BLUFF_QUESTIONS, HOST, makeQuestion, makeSession, OTHER, player, PLAYER, QUESTIONS } from './engineFixtures'

const NOW = 2_000_000
const CHOICE: SessionSettings = { answerMode: 'choice', speedBonus: true, control: false, teams: false }
const FREE: SessionSettings = { answerMode: 'free', speedBonus: true, control: false, teams: false }
const CONTROL: SessionSettings = { ...FREE, control: true }
const BLUFF: SessionSettings = { answerMode: 'bluff', speedBonus: false, control: false, teams: false }

// Applique un update multi-chemins (chemins imbriqués compris), comme Firebase.
function apply(session: Session, update: SessionUpdate | null): Session {
  expect(update).not.toBeNull()
  const next = structuredClone(session) as unknown as Record<string, unknown>
  for (const [path, value] of Object.entries(update as SessionUpdate)) {
    const keys = path.split('/')
    let node = next
    for (const key of keys.slice(0, -1)) {
      node[key] = (node[key] as Record<string, unknown> | undefined) ?? {}
      node = node[key] as Record<string, unknown>
    }
    if (value === null) delete node[keys[keys.length - 1]]
    else node[keys[keys.length - 1]] = value
  }
  return next as unknown as Session
}

const streakOf = (session: Session, id: PlayerId) => session.players[id].streak ?? 0

// Question en cours (index 0) : joueurs avec leur série et leurs réponses.
function questionSession(settings: SessionSettings, players: Record<PlayerId, Player>, answers: Record<PlayerId, Answer>, overrides: Partial<Session> = {}): Session {
  const durationMs = QUESTION_DURATION_S[settings.answerMode] * 1000
  return makeSession({
    status: 'question',
    settings,
    currentIndex: 0,
    questionCount: 3,
    phaseStartedAt: NOW - durationMs,
    phaseEndsAt: NOW,
    players,
    answers: { 0: answers },
    ...overrides,
  })
}

const answer = (value: string | number, extra: Partial<Answer> = {}): Answer => ({ value, submittedAt: NOW - 5_000, ...extra })

function revealed(session: Session, questions: readonly Question[] = QUESTIONS): Session {
  return apply(session, transitionUpdate(session, questions, { status: session.status, currentIndex: session.currentIndex }, NOW + 1_000))
}

describe('Série : règle', () => {
  test('juste : +1 ; faux : 0 ; à moitié juste : inchangée', () => {
    expect(nextStreak(2, { correct: true, points: 100 }, true)).toBe(3)
    expect(nextStreak(undefined, { correct: true, points: 100 }, true)).toBe(1)
    expect(nextStreak(4, { correct: false, points: 0 }, true)).toBe(0)
    expect(nextStreak(4, { correct: false, points: 50, partial: true }, true)).toBe(4)
  })

  test('pas de réponse : 0 si connecté (temps écoulé ou question passée), inchangée si déconnecté', () => {
    expect(nextStreak(4, undefined, true)).toBe(0)
    expect(nextStreak(4, undefined, false)).toBe(4)
    expect(nextStreak(undefined, undefined, false)).toBe(0)
  })

  test('jamais au-delà du plafond (règles de la base)', () => {
    expect(nextStreak(STREAK_MAX, { correct: true, points: 100 }, true)).toBe(STREAK_MAX)
  })
})

describe('Série : écrite par le moteur à la révélation', () => {
  test('quiz classique : juste +1, faux 0, pas de réponse 0 ; joueur arrivé en cours (sans série) part de 0', () => {
    const session = questionSession(
      CHOICE,
      { [PLAYER]: player('Léa', { streak: 2 }), [OTHER]: player('Tom', { streak: 5 }), [HOST]: player('Hôte', { streak: 1 }), late: player('Zoé') },
      { [PLAYER]: answer(1), [OTHER]: answer(0), late: answer(1) },
    )
    const next = revealed(session)
    expect(streakOf(next, PLAYER)).toBe(3)
    expect(streakOf(next, OTHER)).toBe(0)
    // Hôte qui joue, connecté, sans réponse : 0.
    expect(streakOf(next, HOST)).toBe(0)
    expect(streakOf(next, 'late')).toBe(1)
  })

  test('déconnexion puis retour : la série d’un joueur absent sans réponse ne bouge pas, puis repart', () => {
    const away = questionSession(CHOICE, { [PLAYER]: player('Léa', { streak: 4, connected: false }), [OTHER]: player('Tom') }, { [OTHER]: answer(1) })
    const afterAbsence = revealed(away)
    expect(streakOf(afterAbsence, PLAYER)).toBe(4)
    // De retour à la question suivante, une bonne réponse la prolonge.
    const back = questionSession(CHOICE, { ...afterAbsence.players, [PLAYER]: { ...afterAbsence.players[PLAYER], connected: true } }, { [PLAYER]: answer(1) })
    expect(streakOf(revealed(back), PLAYER)).toBe(5)
  })

  test('Contrôle : rien pendant la validation, puis la correction validée par l’hôte (pas la réponse brute)', () => {
    const capital = makeQuestion(0, { text: 'Capitale de l’Australie ?', acceptedAnswers: ['Canberra'] })
    const session = questionSession(CONTROL, { [PLAYER]: player('Léa', { streak: 2 }), [OTHER]: player('Tom', { streak: 2 }) }, { [PLAYER]: answer('Canbeiro'), [OTHER]: answer('Canberra') })
    const validation = revealed(session, [capital])
    expect(validation.status).toBe('validation')
    expect(streakOf(validation, PLAYER)).toBe(2)
    // L'hôte accepte « Canbeiro » et refuse « Canberra » (cas d'école) : c'est sa décision qui compte.
    const reveal = apply(validation, validateUpdate(validation, [capital], { main: { canbeiro: true, canberra: false } }, NOW + 60_000))
    expect(streakOf(reveal, PLAYER)).toBe(3)
    expect(streakOf(reveal, OTHER)).toBe(0)
  })

  test('blind test « titre et artiste » : à moitié juste, la série ne monte ni ne retombe', () => {
    const music = { source: 'deezer' as const, id: '1', title: 'Satisfaction', artist: 'The Rolling Stones' }
    const blindTest = makeQuestion(0, { text: 'Quel est ce morceau ?', acceptedAnswers: ['Satisfaction'], music, ask: 'both' })
    const session = questionSession(
      FREE,
      { [PLAYER]: player('Léa', { streak: 3 }), [OTHER]: player('Tom', { streak: 3 }), [HOST]: player('Hôte', { streak: 3 }) },
      { [PLAYER]: answer('Satisfaction', { artist: 'Beatles' }), [OTHER]: answer('Satisfaction', { artist: 'Rolling Stones' }), [HOST]: answer('Yesterday', { artist: 'Beatles' }) },
    )
    const next = revealed(session, [blindTest])
    expect(next.reveal?.results?.[PLAYER]).toMatchObject({ partial: true })
    expect(streakOf(next, PLAYER)).toBe(3)
    expect(streakOf(next, OTHER)).toBe(4)
    expect(streakOf(next, HOST)).toBe(0)
  })

  test('Bluff : vote pour la vraie réponse +1 ; pour une fausse 0 ; pas de vote 0 ; piéger ne compte pas', () => {
    const choices: BluffChoice[] = [
      { text: BLUFF_QUESTIONS[0].answer, kind: 'truth' },
      { text: 'Leurre', kind: 'decoy' },
      { text: 'Piège de Tom', kind: 'bluff', authors: [OTHER] },
    ]
    const session = makeSession({
      status: 'vote',
      settings: BLUFF,
      currentIndex: 0,
      questionCount: 3,
      phaseEndsAt: 0,
      players: { [PLAYER]: player('Léa', { streak: 2 }), [OTHER]: player('Tom', { streak: 2 }), [HOST]: player('Hôte', { streak: 2 }), zoe: player('Zoé', { streak: 2 }) },
      currentQuestion: { text: BLUFF_QUESTIONS[0].text, difficulty: 3, timeLimit: 60, choices: choices.map((choice) => choice.text) },
      bluffChoices: { 0: choices },
      // Léa trouve la vraie réponse ; l'hôte tombe dans le piège de Tom ; Zoé vote pour le leurre ; Tom ne vote pas.
      votes: { 0: { [PLAYER]: { value: 0, submittedAt: NOW }, [HOST]: { value: 2, submittedAt: NOW }, zoe: { value: 1, submittedAt: NOW } } },
    })
    const next = revealed(session, BLUFF_QUESTIONS)
    expect(streakOf(next, PLAYER)).toBe(3)
    expect(streakOf(next, HOST)).toBe(0)
    expect(streakOf(next, 'zoe')).toBe(0)
    // Tom a piégé l'hôte (des points) mais n'a pas voté : 0.
    expect(streakOf(next, OTHER)).toBe(0)
    expect(next.players[OTHER].score).toBeGreaterThan(0)
  })

  test('Groupe, Suspense, Pas à pas : série individuelle, écrite à chaque révélation', () => {
    const settings: SessionSettings = { ...CHOICE, teams: true, teamCount: 2, suspense: true, stepByStep: true }
    const session = questionSession(settings, { [PLAYER]: player('Léa', { team: 'pink', streak: 1 }), [OTHER]: player('Tom', { team: 'pink', streak: 1 }) }, { [PLAYER]: answer(1), [OTHER]: answer(2) })
    const next = revealed(session)
    expect(streakOf(next, PLAYER)).toBe(2)
    expect(streakOf(next, OTHER)).toBe(0)
  })

  test('dernière question : la série est écrite avec le résultat, avant l’écran de fin', () => {
    const session = questionSession(CHOICE, { [PLAYER]: player('Léa', { streak: 6 }) }, { [PLAYER]: answer(1) }, { currentIndex: 2, answers: { 2: { [PLAYER]: answer(1) } } })
    expect(streakOf(revealed(session), PLAYER)).toBe(7)
  })

  test('Rejouer : toutes les séries remises à 0', () => {
    const ended = makeSession({ status: 'ended', players: { [PLAYER]: player('Léa', { streak: 6 }), [OTHER]: player('Tom', { streak: 3 }) } })
    const replayed = apply(ended, replayUpdate(ended, NOW))
    expect(replayed.players[PLAYER].streak).toBeUndefined()
    expect(replayed.players[OTHER].streak).toBeUndefined()
  })
})
