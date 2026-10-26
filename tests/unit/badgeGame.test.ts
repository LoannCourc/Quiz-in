// Badges : parties complètes déroulées par le moteur de l'hôte (launchUpdate, transitionUpdate, vérification
// des propositions du Bluff, jugement des essais de Dessine-moi), observées par chaque téléphone à travers la
// session publique seulement (champs de PUBLIC_SESSION_FIELDS), puis comptées comme le fait l'app.
import { describe, expect, test } from 'vitest'

import { applyFinishedGame, emptyBadgeState, type BadgeGame, type BadgeRole, type BadgeState } from '../../shared/badges'
import { finishedGameOf, parseTrackedGame, trackSession, type TrackedGame } from '../../shared/badgeTracking'
import { bluffChecksUpdate, isBluffQuestion } from '../../shared/bluff'
import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import { drawGameQuestions } from '../../shared/drawGame'
import { drawHintsUpdate } from '../../shared/drawGuess'
import { changeGameUpdate, endUpdate, launchUpdate, nextDeadline, transitionUpdate, type SessionUpdate } from '../../shared/hostEngine'
import { PUBLIC_SESSION_FIELDS, toPublicSession } from '../../shared/publicFields'
import { settingsForGameType } from '../../shared/quizCatalog'
import type { GameQuestion, PlayerId, PublicSession, Session, SessionSettings } from '../../shared/types'
import { BLUFF_QUESTIONS, HOST, makeSession, player, QUESTIONS } from './engineFixtures'

const CODE = 'ABCD'
const OPEN: readonly BadgeGame[] = ['quiz', 'bluff', 'draw']
const DAY = '2026-10-23'
// Trois joueurs ; l'hôte ne joue pas (organisateur), sauf mention contraire.
const [ANNA, BEN, CLEO] = ['anna', 'ben', 'cleo']
const PLAYERS = { [ANNA]: player('Anna'), [BEN]: player('Ben'), [CLEO]: player('Cléo') }

function apply(session: Session, update: SessionUpdate | null): Session {
  if (!update) return session
  const next = structuredClone(session) as unknown as Record<string, unknown>
  for (const [path, value] of Object.entries(update)) {
    const keys = path.split('/')
    let node = next
    for (const key of keys.slice(0, -1)) {
      if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
      node = node[key] as Record<string, unknown>
    }
    const last = keys[keys.length - 1]
    if (value === null) delete node[last]
    else node[last] = structuredClone(value)
  }
  return next as unknown as Session
}

// Ce que lit un téléphone de joueur ou la TV : champ par champ, la liste publique seulement.
function publicView(session: Session): PublicSession {
  const fields = Object.fromEntries(PUBLIC_SESSION_FIELDS.map((field) => [field, session[field]]))
  const view = toPublicSession(fields)
  if (!view) throw new Error('session publique illisible')
  return view
}

// Un téléphone : sa partie suivie et ses badges, comme useBadgeTracking et badgeStore.
interface Phone {
  uid: PlayerId
  role: BadgeRole
  answerMs: number
  tracked: TrackedGame | null
  // Dernière partie suivie écrite dans le stockage (saveTrackedGame), avant qu'elle soit comptée.
  stored: TrackedGame | null
  badges: BadgeState
}

function phone(uid: PlayerId, role: BadgeRole = 'player', answerMs = 4_000): Phone {
  return { uid, role, answerMs, tracked: null, stored: null, badges: emptyBadgeState() }
}

function observe(phones: Phone[], session: Session) {
  const view = publicView(session)
  for (const device of phones) {
    device.tracked = trackSession(device.tracked, view, { code: CODE, uid: device.uid, role: device.role, answerMs: () => device.answerMs })
    if (device.tracked) device.stored = JSON.parse(JSON.stringify(device.tracked)) as TrackedGame
    const finished = finishedGameOf(device.tracked, view, { code: CODE, uid: device.uid, localDay: DAY })
    if (!finished) continue
    device.badges = applyFinishedGame(device.badges, finished, OPEN, 0).state
    device.tracked = null
  }
}

// Écritures des joueurs pendant la question (réponse, proposition, essai) ou le vote.
interface Script {
  question?: (session: Session) => SessionUpdate
  vote?: (session: Session) => SessionUpdate
  // Arrêt (« Terminer la partie ») à cette question, avant sa révélation.
  endAt?: number
}

// Partie du lancement à l'écran de fin, les minuteurs pris à leur échéance.
function runGame(start: Session, questions: readonly GameQuestion[], script: Script, phones: Phone[], limit?: number): Session {
  let now = start.phaseStartedAt + 1_000
  const launch = launchUpdate(start, questions, now, limit, undefined, () => 0.3)
  if (!launch.ok) throw new Error(`lancement refusé : ${launch.reason}`)
  let session = apply(start, launch.update)
  observe(phones, session)
  const acted = new Set<string>()
  for (let step = 0; step < 500 && session.status !== 'ended'; step++) {
    const key = `${session.status}:${session.currentIndex}`
    if (session.status === 'question' && script.endAt === session.currentIndex) {
      session = apply(session, endUpdate(session, now))
      break
    }
    if (!acted.has(key)) {
      acted.add(key)
      if (session.status === 'question' && script.question) session = apply(session, script.question(session))
      if (session.status === 'vote' && script.vote) session = apply(session, script.vote(session))
    }
    // Travail de l'hôte entre deux échéances (useBluffChecks, useDrawJudging).
    const question = questions[session.currentIndex]
    if (session.status === 'question' && question && isBluffQuestion(question)) session = apply(session, bluffChecksUpdate(session, question))
    session = apply(session, drawHintsUpdate(session))
    observe(phones, session)
    const deadline = nextDeadline(session)
    if (deadline === null) throw new Error(`partie bloquée en ${key}`)
    now = Math.max(now, deadline) + 1
    session = apply(session, transitionUpdate(session, questions, { status: session.status, currentIndex: session.currentIndex }, now))
    observe(phones, session)
  }
  observe(phones, session)
  return session
}

// Quiz : Anna a tout juste, Ben une sur deux, Cléo tout faux.
const quizAnswers: Script = {
  question: (session) => {
    const index = session.currentIndex
    const at = session.phaseStartedAt + 1_500
    const choice = (correct: boolean) => ({ value: correct ? 1 : 0, submittedAt: at })
    return {
      [`answers/${index}/${ANNA}`]: choice(true),
      [`answers/${index}/${BEN}`]: choice(index % 2 === 0),
      [`answers/${index}/${CLEO}`]: choice(false),
      [`answeredBy/${index}/${ANNA}`]: true,
      [`answeredBy/${index}/${BEN}`]: true,
      [`answeredBy/${index}/${CLEO}`]: true,
    }
  },
}

const QUIZ = QUESTIONS.slice(0, 10)

describe('Badges, partie complète : Quiz', () => {
  test('3 joueurs et l’hôte organisateur : parties jouées, victoire, défaites, Sans faute, réponse rapide', () => {
    const phones = [phone(ANNA, 'player', 1_500), phone(BEN), phone(CLEO), phone(HOST, 'organizer')]
    const end = runGame(makeSession({ players: PLAYERS }), QUIZ, quizAnswers, phones, 10)
    expect(end.status).toBe('ended')
    const [anna, ben, cleo, host] = phones.map((device) => device.badges.counters)
    expect(anna).toMatchObject({ completed: 1, wins: 1, losses: 0, winStreak: 1, maxPlayers: 3, perfect: 1, fastestCorrectMs: 1_500, maxQuizQuestions: 10 })
    expect(anna.perGame.quiz).toBe(1)
    expect(ben).toMatchObject({ completed: 1, wins: 0, losses: 1, perfect: 0, fastestCorrectMs: 4_000 })
    expect(cleo).toMatchObject({ completed: 1, wins: 0, losses: 1, fastestCorrectMs: null })
    expect(host).toMatchObject({ completed: 1, wins: 0, losses: 0, maxPlayers: 3, perfect: 0, fastestCorrectMs: null })
    expect(host.perGame.quiz).toBe(1)
    expect(phones[0].badges.unlocked).toHaveProperty('perfect')
    expect(phones[0].badges.unlocked).toHaveProperty('lightning.1')
  })

  test('« Terminer la partie » à la 6e question : rien de compté, série intacte', () => {
    const phones = [phone(ANNA), phone(HOST, 'organizer')]
    const end = runGame(makeSession({ players: PLAYERS }), QUIZ, { ...quizAnswers, endAt: 5 }, phones, 10)
    expect(end.status).toBe('ended')
    expect(phones.map((device) => device.badges.counters.completed)).toEqual([0, 0])
  })

  test('doubles comptes : écran de fin rechargé, app relancée, puis « Changer de jeu » avec le même code', () => {
    const anna = phone(ANNA)
    const first = runGame(makeSession({ players: PLAYERS }), QUIZ, quizAnswers, [anna], 10)
    expect(anna.badges.counters.completed).toBe(1)

    // Écran de fin rechargé plusieurs fois (nouvelle session publique identique) : rien de plus.
    observe([anna], first)
    observe([anna], { ...first })
    // App relancée sur l'écran de fin alors que le stockage garde encore la partie suivie (arrêt entre
    // l'écriture des badges et l'oubli de la partie) : déjà comptée, refusée par son identifiant.
    expect(anna.stored?.revealed).toContain(9)
    const relaunched: Phone = { ...anna, tracked: parseTrackedGame(anna.stored) }
    expect(relaunched.tracked).not.toBeNull()
    observe([relaunched], first)
    expect(relaunched.badges.counters.completed).toBe(1)

    // Changer de jeu : même code, nouvelle partie, nouvelle heure de fin → comptée.
    const lobby = apply(first, changeGameUpdate(first, 'quiz-1', DEFAULT_SESSION_SETTINGS, first.phaseStartedAt + 60_000))
    expect(lobby.status).toBe('lobby')
    observe([relaunched], lobby)
    const second = runGame(lobby, QUIZ, quizAnswers, [relaunched], 10)
    expect(second.phaseStartedAt).not.toBe(first.phaseStartedAt)
    expect(relaunched.badges.counters).toMatchObject({ completed: 2, wins: 2, winStreak: 2 })
  })
})

describe('Badges, partie complète : Bluff', () => {
  const settings: SessionSettings = settingsForGameType(DEFAULT_SESSION_SETTINGS, 'bluff')
  const proposals = { [ANNA]: 'Monopolis', [BEN]: 'Capitale Ville', [CLEO]: 'Rue Royale' }

  // Ben et Cléo votent pour la fausse réponse d'Anna ; Anna trouve la vraie.
  const script: Script = {
    question: (session) =>
      Object.fromEntries(
        Object.entries(proposals).map(([uid, text]) => [`bluffs/${session.currentIndex}/${uid}`, { text, submittedAt: session.phaseStartedAt + 1_000 }]),
      ),
    vote: (session) => {
      const choices = session.currentQuestion?.choices ?? []
      const index = session.currentIndex
      const vote = (text: string) => ({ value: choices.indexOf(text), submittedAt: session.phaseStartedAt + 1_000 })
      return {
        [`votes/${index}/${ANNA}`]: vote(BLUFF_QUESTIONS[index].answer),
        [`votes/${index}/${BEN}`]: vote(proposals[ANNA]),
        [`votes/${index}/${CLEO}`]: vote(proposals[ANNA]),
        [`votedBy/${index}/${ANNA}`]: true,
        [`votedBy/${index}/${BEN}`]: true,
        [`votedBy/${index}/${CLEO}`]: true,
      }
    },
  }

  test('joueurs piégés comptés par la session publique, victoire de celle qui piège', () => {
    const phones = [phone(ANNA), phone(BEN), phone(CLEO), phone(HOST, 'organizer')]
    runGame(makeSession({ players: PLAYERS, settings }), BLUFF_QUESTIONS, script, phones)
    const [anna, ben, cleo, host] = phones.map((device) => device.badges.counters)
    expect(anna).toMatchObject({ completed: 1, wins: 1, bluffFooled: 2 * BLUFF_QUESTIONS.length, fastestCorrectMs: null })
    expect(anna.perGame.bluff).toBe(1)
    expect(ben).toMatchObject({ completed: 1, losses: 1, bluffFooled: 0 })
    expect(cleo).toMatchObject({ completed: 1, losses: 1, bluffFooled: 0 })
    expect(host).toMatchObject({ completed: 1, bluffFooled: 0, maxPlayers: 3 })
    expect(host.perGame.bluff).toBe(1)
  })
})

describe('Badges, partie complète : Dessine-moi', () => {
  const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, answerMode: 'draw' }
  const rounds = drawGameQuestions(CODE, 3)

  // Les deux devineurs trouvent le mot à chaque manche.
  const script: Script = {
    question: (session) => {
      const word = session.drawSecret?.word
      const drawer = session.drawTurn?.drawer
      if (!word || !drawer) throw new Error('manche sans mot ni dessinateur')
      return Object.fromEntries(
        Object.keys(PLAYERS)
          .filter((uid) => uid !== drawer)
          .map((uid) => [`drawGuess/${uid}`, { text: word, count: 1, at: session.phaseStartedAt + 3_000 }]),
      )
    },
  }

  test('dessins devinés comptés pour chaque dessinateur ; l’organisateur n’en reçoit pas', () => {
    const phones = [phone(ANNA), phone(BEN), phone(CLEO), phone(HOST, 'organizer')]
    const end = runGame(makeSession({ players: PLAYERS, settings }), rounds, script, phones)
    expect(end.status).toBe('ended')
    const counters = phones.map((device) => device.badges.counters)
    for (const player of counters.slice(0, 3)) {
      expect(player).toMatchObject({ completed: 1, drawGuessed: 2 })
      expect(player.perGame.draw).toBe(1)
    }
    expect(counters.slice(0, 3).reduce((total, player) => total + player.wins, 0)).toBeGreaterThanOrEqual(1)
    expect(counters[3]).toMatchObject({ completed: 1, drawGuessed: 0, wins: 0, losses: 0 })
  })
})

describe('Badges, partie complète : l’hôte qui joue', () => {
  test('compté une fois, en joueur (un seul suivi sur son téléphone)', () => {
    const players = { ...PLAYERS, [HOST]: player('Hôte') }
    const host = phone(HOST, 'player')
    runGame(makeSession({ players }), QUIZ, quizAnswers, [host], 10)
    expect(host.badges.counters).toMatchObject({ completed: 1, losses: 1, maxPlayers: 4 })
  })
})
