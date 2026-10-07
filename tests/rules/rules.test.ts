// Tests des règles de sécurité Realtime Database (database.rules.json), contre l'émulateur local.
// Projet fictif « demo-quiz-in » : l'émulateur refuse tout accès à un vrai projet Firebase.
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import {
  endUpdate,
  launchUpdate,
  pauseUpdate,
  replayUpdate,
  resumeUpdate,
  selectGameQuestions,
  transitionUpdate,
  validateUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import { bluffChecksUpdate } from '../../shared/bluff'
import { BLUFF_MAX_ATTEMPTS, HOST_DISCONNECT_TIMEOUT_S } from '../../shared/constants'
import { hostReturnUpdate } from '../../shared/hostAbsence'
import { DrawingDoc, DrawingWriter } from '../../shared/drawing/encoding'
import { drawGameQuestions } from '../../shared/drawGame'
import { drawHintsUpdate } from '../../shared/drawGuess'
import { PUBLIC_SESSION_FIELDS, toPublicSession, type PublicField } from '../../shared/publicFields'
import { rankingStreakBadges, revealStreak } from '../../shared/streak'
import { lateJoinerUpdate, launchTeamDraw, teamDrawUpdate, teamsValidatedUpdate } from '../../shared/teams'
import type { GameStatus, PublicSession, Session } from '../../shared/types'
import { BLUFF_QUESTIONS, makeSession, QUESTIONS } from '../unit/engineFixtures'

const PROJECT_ID = 'demo-quiz-in'
const CODE = 'K7PX'
const SESSION = `sessions/${CODE}`
const HOST = 'host-uid'
const PLAYER = 'player-uid'
const OTHER = 'other-uid'
const SERVER_TIME = firebase.database.ServerValue.TIMESTAMP

let env: RulesTestEnvironment

// Données de test volontairement libres : on veut aussi pouvoir écrire des données invalides.
type Data = Record<string, unknown>

function db(uid: string | null) {
  const context = uid === null ? env.unauthenticatedContext() : env.authenticatedContext(uid)
  return context.database()
}

// Écrit l'état initial sans passer par les règles, comme la console Firebase.
async function seed(data: Data) {
  await env.withSecurityRulesDisabled(async (context) => {
    await context.database().ref().set(data)
  })
}

async function readAsAdmin(path: string): Promise<unknown> {
  let value: unknown
  await env.withSecurityRulesDisabled(async (context) => {
    value = (await context.database().ref(path).once('value')).val()
  })
  return value
}

function session(overrides: Data = {}): Data {
  return {
    hostUid: HOST,
    quizId: 'quiz-1',
    status: 'question',
    settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false },
    currentIndex: 0,
    phaseStartedAt: Date.now() - 5_000,
    phaseEndsAt: Date.now() + 20_000,
    players: { [PLAYER]: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true } },
    ...overrides,
  }
}

function seedSession(overrides: Data = {}, extra: Data = {}) {
  return seed({ sessions: { [CODE]: session(overrides) }, ...extra })
}

// Réponse et answeredBy écrits ensemble (écriture multi-chemins), comme le fera le client joueur.
function submitAnswer(uid: string, index: number, value: unknown, answer: Data = {}) {
  return db(uid)
    .ref(SESSION)
    .update({
      [`answers/${index}/${uid}`]: { value, submittedAt: SERVER_TIME, ...answer },
      [`answeredBy/${index}/${uid}`]: true,
    })
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    database: {
      host: '127.0.0.1',
      port: 9000,
      rules: readFileSync(new URL('../../database.rules.json', import.meta.url), 'utf8'),
    },
  })
})

beforeEach(async () => {
  await env.clearDatabase()
})

afterAll(async () => {
  await env.cleanup()
})

describe('Lecture', () => {
  test('lire sessions en entier est refusé, même pour un hôte', async () => {
    await seedSession()
    await assertFails(db(HOST).ref('sessions').once('value'))
  })

  test("l'hôte lit sa session d'un bloc", async () => {
    await seedSession()
    await assertSucceeds(db(HOST).ref(SESSION).once('value'))
  })

  test("un joueur ne lit pas la session d'un bloc", async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(SESSION).once('value'))
  })

  test('un joueur lit les champs publics', async () => {
    await seedSession()
    for (const field of ['status', 'players', 'currentQuestion', 'answeredBy']) {
      await assertSucceeds(db(PLAYER).ref(`${SESSION}/${field}`).once('value'))
    }
  })

  test('un joueur ne lit pas answers', async () => {
    await seedSession({ answers: { 0: { [PLAYER]: { value: 1, submittedAt: 1 } } } })
    await assertFails(db(PLAYER).ref(`${SESSION}/answers`).once('value'))
    await assertFails(db(PLAYER).ref(`${SESSION}/answers/0/${PLAYER}`).once('value'))
  })

  test('un utilisateur non connecté ne lit rien', async () => {
    await seedSession()
    await assertFails(db(null).ref(`${SESSION}/status`).once('value'))
  })
})

describe('Catalogue', () => {
  const catalog = { questions: { 'quiz-1': { 0: { text: 'Q ?', correctIndex: 1 } } } }

  test('lecture de questions autorisée pour un utilisateur connecté', async () => {
    await seed(catalog)
    await assertSucceeds(db(PLAYER).ref('questions/quiz-1').once('value'))
  })

  test('écriture de questions refusée, même pour un hôte', async () => {
    await seed(catalog)
    await assertFails(db(HOST).ref('questions/quiz-1/0/correctIndex').set(2))
  })

  test('lecture de questions refusée sans connexion', async () => {
    await seed(catalog)
    await assertFails(db(null).ref('questions/quiz-1').once('value'))
  })
})

describe('Hôte et état de la partie', () => {
  test("création d'une session par son hôte", async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(session({ players: null })))
  })

  // Séquence exacte de app/src/lib/createGame.ts : lecture de hostUid, puis set de la session initiale.
  const initialSession = () => ({
    hostUid: HOST,
    quizId: 'culture-generale-1',
    status: 'lobby',
    settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false },
    currentIndex: 0,
    phaseStartedAt: SERVER_TIME,
    phaseEndsAt: 0,
  })

  test("lecture de hostUid d'un code libre autorisée (valeur nulle)", async () => {
    const snapshot = await assertSucceeds(db(HOST).ref(`${SESSION}/hostUid`).once('value'))
    expect(snapshot.val()).toBeNull()
  })

  test('création de la session initiale exacte acceptée', async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(initialSession()))
    expect(await readAsAdmin(`${SESSION}/status`)).toBe('lobby')
  })

  test("création sur un code déjà pris par un autre hôte refusée", async () => {
    await seedSession({ hostUid: OTHER, status: 'lobby' })
    await assertFails(db(HOST).ref(SESSION).set(initialSession()))
  })

  test("création d'une session au nom d'un autre refusée", async () => {
    await assertFails(db(PLAYER).ref(SESSION).set(session({ players: null })))
  })

  test('session existante : un autre utilisateur ne peut pas la remplacer', async () => {
    await seedSession()
    await assertFails(db(OTHER).ref(SESSION).set(session({ hostUid: OTHER, players: null })))
  })

  test("l'hôte fait avancer l'état", async () => {
    await seedSession()
    await assertSucceeds(db(HOST).ref(`${SESSION}/status`).set('reveal'))
  })

  test("écriture de l'état par un non-hôte refusée", async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(`${SESSION}/status`).set('reveal'))
    await assertFails(db(PLAYER).ref(`${SESSION}/currentIndex`).set(1))
    await assertFails(db(PLAYER).ref(`${SESSION}/reveal`).set({ correctAnswer: 'Mercure' }))
  })

  test('hostUid ne peut pas changer', async () => {
    await seedSession()
    await assertFails(db(HOST).ref(`${SESSION}/hostUid`).set(OTHER))
  })

  test('currentQuestion refuse la bonne réponse, même écrite par l’hôte', async () => {
    await seedSession()
    await assertFails(
      db(HOST)
        .ref(`${SESSION}/currentQuestion`)
        .set({ text: 'Q ?', difficulty: 1, timeLimit: 20, correctIndex: 1 }),
    )
  })

  test('statut inconnu refusé', async () => {
    await seedSession()
    await assertFails(db(HOST).ref(`${SESSION}/status`).set('finished'))
  })
})

describe('Blind test', () => {
  const URL = 'https://cdnt-preview.dzcdn.net/api/1/1/a.mp3?hdnea=exp=1791107825'
  const question = { text: 'Quel est ce morceau ?', difficulty: 1, timeLimit: 20 }
  // L'extrait dure tout le timer de la question (20 s) : début + timer ≤ 30 s.
  const audio = { url: URL, startS: 5, durationS: 20 }

  test('interrupteur config/blindTestEnabled : lisible connecté, jamais modifiable depuis l’app', async () => {
    await seed({ config: { blindTestEnabled: false } })
    await assertSucceeds(db(PLAYER).ref('config/blindTestEnabled').once('value'))
    await assertFails(db(null).ref('config/blindTestEnabled').once('value'))
    await assertFails(db(HOST).ref('config/blindTestEnabled').set(true))
  })

  test('currentQuestion accepte un extrait (adresse https, début et durée valides)', async () => {
    await seedSession()
    await assertSucceeds(db(HOST).ref(`${SESSION}/currentQuestion`).set({ ...question, audio }))
  })

  test('extrait refusé : adresse non https, plus long que le timer, dépassement de la preview, champ inconnu', async () => {
    await seedSession()
    const ref = db(HOST).ref(`${SESSION}/currentQuestion`)
    await assertFails(ref.set({ ...question, audio: { ...audio, url: 'http://exemple.fr/a.mp3' } }))
    await assertFails(ref.set({ ...question, audio: { ...audio, startS: 0, durationS: 25 } }))
    await assertFails(ref.set({ ...question, audio: { ...audio, startS: 11 } }))
    await assertSucceeds(ref.set({ ...question, audio: { ...audio, startS: 10 } }))
    await assertFails(ref.set({ ...question, audio: { ...audio, trackId: '6297555' } }))
  })

  test('adresse renouvelée seule par l’hôte, jamais par un joueur', async () => {
    await seedSession({ currentQuestion: { ...question, audio } })
    await assertSucceeds(db(HOST).ref(`${SESSION}/currentQuestion/audio/url`).set(`${URL}x`))
    await assertFails(db(PLAYER).ref(`${SESSION}/currentQuestion/audio/url`).set(`${URL}y`))
  })

  test('reveal accepte titre, artiste et source ; source inconnue refusée', async () => {
    await seedSession({ status: 'reveal' })
    const ref = db(HOST).ref(`${SESSION}/reveal`)
    const music = { title: 'Alors on danse', artist: 'Stromae', source: 'deezer' }
    await assertSucceeds(ref.set({ correctAnswer: 'Alors on danse – Stromae', music }))
    await assertFails(ref.set({ correctAnswer: 'X', music: { ...music, source: 'autre' } }))
  })
})

describe('Pas à pas (settings.stepByStep)', () => {
  const stepSettings = { answerMode: 'choice', speedBonus: true, control: false, teams: false, stepByStep: true }

  test('réglage booléen accepté à la création, valeur non booléenne refusée', async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(session({ players: null, settings: stepSettings })))
    await assertFails(db(HOST).ref(`${SESSION}/settings/stepByStep`).set('oui'))
  })

  test('partie sans le champ (créée avant ce réglage) : toujours valide', async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(session({ players: null })))
  })

  test('moteur : révélation en attente, pause, reprise, puis « Question suivante » acceptés par les règles', async () => {
    const gameQuestions = selectGameQuestions(QUESTIONS.slice(0, 2))
    const start = makeSession({
      status: 'question',
      currentIndex: 0,
      questionCount: 2,
      phaseStartedAt: Date.now() - 5_000,
      phaseEndsAt: Date.now() + 15_000,
      settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false, stepByStep: true },
    })
    await seed({ sessions: { [CODE]: start } })
    const read = async () => (await readAsAdmin(SESSION)) as Session
    const write = (update: SessionUpdate | null) => {
      expect(update).not.toBeNull()
      return assertSucceeds(db(HOST).ref(SESSION).update(update as SessionUpdate))
    }

    await write(transitionUpdate(await read(), gameQuestions, { status: 'question', currentIndex: 0 }, Date.now()))
    expect(await read()).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    await write(pauseUpdate(await read(), Date.now()))
    await write(resumeUpdate(await read(), Date.now()))
    expect(await read()).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    await write(transitionUpdate(await read(), gameQuestions, { status: 'reveal', currentIndex: 0 }, Date.now()))
    // Le classement attend lui aussi l'hôte ; pause et reprise le laissent en attente.
    expect(await read()).toMatchObject({ status: 'scores', phaseEndsAt: 0 })
    await write(pauseUpdate(await read(), Date.now()))
    await write(resumeUpdate(await read(), Date.now()))
    expect(await read()).toMatchObject({ status: 'scores', phaseEndsAt: 0 })
    await write(transitionUpdate(await read(), gameQuestions, { status: 'scores', currentIndex: 0 }, Date.now()))
    expect(await read()).toMatchObject({ status: 'question', currentIndex: 1 })
  })
})

describe('Suspense (settings.suspense)', () => {
  const suspenseSettings = { answerMode: 'choice', speedBonus: true, control: false, teams: false, suspense: true }

  test('réglage booléen accepté, valeur non booléenne refusée', async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(session({ players: null, settings: suspenseSettings })))
    await assertFails(db(HOST).ref(`${SESSION}/settings/suspense`).set(1))
  })

  test('moteur : révélation puis question suivante directement, accepté par les règles', async () => {
    const gameQuestions = selectGameQuestions(QUESTIONS.slice(0, 2))
    const start = makeSession({
      status: 'reveal',
      currentIndex: 0,
      questionCount: 2,
      phaseStartedAt: Date.now() - 5_000,
      phaseEndsAt: Date.now() + 1_000,
      settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false, suspense: true },
    })
    await seed({ sessions: { [CODE]: start } })
    const current = (await readAsAdmin(SESSION)) as Session
    const update = transitionUpdate(current, gameQuestions, { status: 'reveal', currentIndex: 0 }, Date.now())
    await assertSucceeds(db(HOST).ref(SESSION).update(update as SessionUpdate))
    expect(await readAsAdmin(SESSION)).toMatchObject({ status: 'question', currentIndex: 1 })
  })
})

describe('Nombre de questions (questionCount)', () => {
  // Écritures du lancement : un seul update() multi-chemins, comme le fera le moteur de l'hôte.
  function launch(uid: string, questionCount: unknown) {
    return db(uid)
      .ref(SESSION)
      .update({
        status: 'starting',
        questionCount,
        currentIndex: 0,
        phaseStartedAt: Date.now(),
        phaseEndsAt: Date.now() + 3_000,
      })
  }

  test('lecture par un joueur et par la TV (autre utilisateur connecté)', async () => {
    await seedSession({ questionCount: 10 })
    expect((await assertSucceeds(db(PLAYER).ref(`${SESSION}/questionCount`).once('value'))).val()).toBe(10)
    expect((await assertSucceeds(db(OTHER).ref(`${SESSION}/questionCount`).once('value'))).val()).toBe(10)
  })

  test('lecture refusée sans connexion', async () => {
    await seedSession({ questionCount: 10 })
    await assertFails(db(null).ref(`${SESSION}/questionCount`).once('value'))
  })

  test('écriture par un joueur refusée', async () => {
    await seedSession({ status: 'starting' })
    await assertFails(db(PLAYER).ref(`${SESSION}/questionCount`).set(10))
    await seedSession({ status: 'lobby' })
    await assertFails(launch(PLAYER, 10))
  })

  test("lancement par l'hôte : status starting et questionCount dans le même update", async () => {
    await seedSession({ status: 'lobby' })
    await assertSucceeds(launch(HOST, 10))
    expect(await readAsAdmin(`${SESSION}/questionCount`)).toBe(10)
  })

  test('écriture de questionCount en lobby, sans lancement, refusée', async () => {
    await seedSession({ status: 'lobby' })
    await assertFails(db(HOST).ref(`${SESSION}/questionCount`).set(10))
  })

  test('écriture de questionCount hors passage à starting refusée (pendant question)', async () => {
    await seedSession({ status: 'question', questionCount: 10 })
    await assertFails(db(HOST).ref(`${SESSION}/questionCount`).set(8))
    await assertFails(db(HOST).ref(SESSION).update({ currentIndex: 1, questionCount: 8 }))
  })

  test('valeurs 0, 51 et 2,5 refusées', async () => {
    for (const value of [0, 51, 2.5, '10']) {
      await seedSession({ status: 'lobby' })
      await assertFails(launch(HOST, value))
    }
  })

  test('update multi-chemins vers question sans toucher questionCount accepté', async () => {
    await seedSession({ status: 'starting', questionCount: 10 })
    await assertSucceeds(
      db(HOST)
        .ref(SESSION)
        .update({ status: 'question', currentIndex: 0, phaseStartedAt: Date.now(), phaseEndsAt: Date.now() + 20_000 }),
    )
    expect(await readAsAdmin(`${SESSION}/questionCount`)).toBe(10)
  })

  test("nouvelle valeur acceptée quand l'hôte relance une partie (lobby puis starting)", async () => {
    await seedSession({ status: 'lobby', questionCount: 10 })
    await assertSucceeds(launch(HOST, 7))
    expect(await readAsAdmin(`${SESSION}/questionCount`)).toBe(7)
  })
})

describe('Joueurs', () => {
  const entry = (name: string) => ({ name, avatar: '🐼', connected: true })

  test('inscription en lobby (écriture champ par champ)', async () => {
    await seedSession({ status: 'lobby' })
    await assertSucceeds(db(OTHER).ref(`${SESSION}/players/${OTHER}`).update(entry('Tom')))
  })

  // Les droits du joueur portent sur name, avatar et connected, pas sur l'entrée entière :
  // le client doit utiliser update() (vérifié champ par champ), pas set().
  test("inscription par remplacement de l'entrée entière (set) refusée", async () => {
    await seedSession({ status: 'lobby' })
    await assertFails(db(OTHER).ref(`${SESSION}/players/${OTHER}`).set(entry('Tom')))
  })

  test('inscription après le lancement refusée', async () => {
    await seedSession({ status: 'question' })
    await assertFails(db(OTHER).ref(`${SESSION}/players/${OTHER}`).update(entry('Tom')))
  })

  test('pseudo de 13 caractères refusé', async () => {
    await seedSession({ status: 'lobby' })
    await assertFails(db(OTHER).ref(`${SESSION}/players/${OTHER}`).update(entry('A'.repeat(13))))
  })

  test('pseudo de 1 caractère refusé, de 2 et 12 caractères accepté', async () => {
    await seedSession({ status: 'lobby' })
    const ref = db(OTHER).ref(`${SESSION}/players/${OTHER}`)
    await assertFails(ref.update(entry('A')))
    await assertSucceeds(ref.update(entry('Al')))
    await assertSucceeds(ref.update(entry('A'.repeat(12))))
  })

  test('pseudo entouré d’espaces refusé', async () => {
    await seedSession({ status: 'lobby' })
    await assertFails(db(OTHER).ref(`${SESSION}/players/${OTHER}`).update(entry(' Tom ')))
  })

  test("inscription au nom d'un autre joueur refusée", async () => {
    await seedSession({ status: 'lobby' })
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${OTHER}`).update(entry('Tom')))
  })

  // Modification du profil en lobby : même appel que le client (update sur name et avatar).
  const profile = { name: 'Léa B', avatar: '🐸' }

  test('modification du pseudo et de l’avatar acceptée en lobby', async () => {
    await seedSession({ status: 'lobby' })
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}`).update(profile))
    expect(await readAsAdmin(`${SESSION}/players/${PLAYER}`)).toMatchObject({ ...profile, connected: true })
  })

  test('modification de l’avatar seul acceptée en lobby', async () => {
    await seedSession({ status: 'lobby' })
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}`).update({ name: 'Léa', avatar: '🐸' }))
  })

  test('modification du profil refusée dès que la partie est lancée', async () => {
    for (const status of ['starting', 'question', 'paused', 'ended']) {
      await seedSession({ status })
      await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}`).update(profile))
    }
  })

  test("modification du profil d'un autre joueur refusée", async () => {
    await seedSession({ status: 'lobby' })
    await assertFails(db(OTHER).ref(`${SESSION}/players/${PLAYER}`).update(profile))
  })

  test('score écrit par un joueur refusé', async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/score`).set(9999))
  })

  test('rang écrit par un joueur refusé', async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/rank`).set(1))
  })

  test("l'hôte écrit score et rang", async () => {
    await seedSession()
    await assertSucceeds(db(HOST).ref(`${SESSION}/players/${PLAYER}`).update({ score: 180, rank: 1 }))
  })

  test('un joueur inscrit met à jour sa présence pendant la partie', async () => {
    await seedSession({ status: 'question' })
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/connected`).set(false))
  })
})

describe('Réponses', () => {
  test('réponse dans les temps acceptée, avec answeredBy', async () => {
    await seedSession()
    await assertSucceeds(submitAnswer(PLAYER, 0, 1))
  })

  test('réponse hors de l’état question refusée', async () => {
    for (const status of ['lobby', 'starting', 'reveal', 'scores', 'paused', 'ended']) {
      await seedSession({ status })
      await assertFails(submitAnswer(PLAYER, 0, 1))
    }
  })

  test('réponse à une autre question que la question courante refusée', async () => {
    await seedSession({ currentIndex: 2 })
    await assertFails(submitAnswer(PLAYER, 1, 1))
  })

  test('double réponse refusée', async () => {
    await seedSession()
    await assertSucceeds(submitAnswer(PLAYER, 0, 1))
    await assertFails(submitAnswer(PLAYER, 0, 2))
    await assertFails(db(PLAYER).ref(`${SESSION}/answers/0/${PLAYER}/value`).set(2))
  })

  test('réponse après phaseEndsAt + 1 s refusée', async () => {
    await seedSession({ phaseEndsAt: Date.now() - 5_000 })
    await assertFails(submitAnswer(PLAYER, 0, 1))
  })

  test('réponse juste après phaseEndsAt, dans la tolérance, acceptée', async () => {
    await seedSession({ phaseEndsAt: Date.now() - 200 })
    await assertSucceeds(submitAnswer(PLAYER, 0, 1))
  })

  test('horodatage fourni par le téléphone refusé', async () => {
    await seedSession()
    await assertFails(
      db(PLAYER)
        .ref(`${SESSION}/answers/0/${PLAYER}`)
        .set({ value: 1, submittedAt: Date.now() - 10_000 }),
    )
  })

  test('answeredBy sans answers refusé', async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(`${SESSION}/answeredBy/0/${PLAYER}`).set(true))
  })

  test('réponse au nom d’un autre joueur refusée', async () => {
    await seedSession()
    await assertFails(
      db(PLAYER)
        .ref(SESSION)
        .update({
          [`answers/0/${OTHER}`]: { value: 1, submittedAt: SERVER_TIME },
          [`answeredBy/0/${OTHER}`]: true,
        }),
    )
  })

  test('réponse d’un utilisateur non inscrit refusée', async () => {
    await seedSession()
    await assertFails(submitAnswer(OTHER, 0, 1))
  })

  test('un joueur ne peut pas écrire correct ni points', async () => {
    await seedSession()
    await assertFails(submitAnswer(PLAYER, 0, 1, { correct: true }))
    await assertFails(submitAnswer(PLAYER, 0, 1, { points: 200 }))
  })

  test('réponse libre de 60 caractères acceptée, de 61 refusée', async () => {
    await seedSession({ settings: { answerMode: 'free', speedBonus: true, control: false, teams: false } })
    await assertFails(submitAnswer(PLAYER, 0, 'a'.repeat(61)))
    await assertSucceeds(submitAnswer(PLAYER, 0, 'a'.repeat(60)))
  })

  test('index de proposition hors de 0 à 3 refusé', async () => {
    await seedSession()
    await assertFails(submitAnswer(PLAYER, 0, 4))
  })

  // Même écriture que app/src/lib/submitAnswer.ts : ce que la base contient ensuite.
  test('le client enregistre exactement value, submittedAt (heure du serveur) et answeredBy', async () => {
    await seedSession()
    const before = Date.now()
    await assertSucceeds(submitAnswer(PLAYER, 0, 1))
    const answer = (await readAsAdmin(`${SESSION}/answers/0/${PLAYER}`)) as Data
    expect(Object.keys(answer).sort()).toEqual(['submittedAt', 'value'])
    expect(answer.value).toBe(1)
    expect(answer.submittedAt).toBeTypeOf('number')
    expect(answer.submittedAt as number).toBeGreaterThanOrEqual(before - 1_000)
    expect(await readAsAdmin(`${SESSION}/answeredBy/0/${PLAYER}`)).toBe(true)
  })

  test('la proposition 0 est acceptée', async () => {
    await seedSession()
    await assertSucceeds(submitAnswer(PLAYER, 0, 0))
  })

  // Après un refus, le client relit answeredBy pour distinguer « déjà répondu » de « trop tard ».
  test('après un refus, le joueur lit sa propre entrée answeredBy', async () => {
    await seedSession()
    const answeredBy = db(PLAYER).ref(`${SESSION}/answeredBy/0/${PLAYER}`)
    expect((await assertSucceeds(answeredBy.once('value'))).val()).toBeNull()
    await submitAnswer(PLAYER, 0, 1)
    await assertFails(submitAnswer(PLAYER, 0, 2))
    expect((await assertSucceeds(answeredBy.once('value'))).val()).toBe(true)
  })

  test("l'hôte inscrit comme joueur répond avec la même écriture", async () => {
    await seedSession({
      players: { [HOST]: { name: 'Hôte', avatar: '🐸', score: 0, rank: 1, connected: true } },
    })
    await assertSucceeds(submitAnswer(HOST, 0, 3))
    expect(await readAsAdmin(`${SESSION}/answeredBy/0/${HOST}`)).toBe(true)
  })

  test("l'hôte complète la réponse avec correct et points", async () => {
    await seedSession()
    await submitAnswer(PLAYER, 0, 1)
    await assertSucceeds(db(HOST).ref(`${SESSION}/answers/0/${PLAYER}`).update({ correct: true, points: 180 }))
  })
})

describe('Parcours complet', () => {
  test('un joueur s’inscrit en lobby, puis répond dans les temps', async () => {
    await seedSession({ status: 'lobby', players: null })
    await assertSucceeds(
      db(OTHER).ref(`${SESSION}/players/${OTHER}`).update({ name: 'Tom', avatar: '🐼', connected: true }),
    )
    await assertSucceeds(
      db(HOST)
        .ref(SESSION)
        .update({ status: 'question', currentIndex: 0, phaseEndsAt: Date.now() + 20_000 }),
    )
    await assertSucceeds(submitAnswer(OTHER, 0, 2))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/answeredBy/0/${OTHER}`).once('value'))
  })
})

describe('Présence (onDisconnect)', () => {
  // Le serveur exécute l'écriture après la déconnexion : on attend qu'elle apparaisse.
  async function waitForValue(path: string, expected: unknown) {
    for (let attempt = 0; attempt < 50; attempt++) {
      if ((await readAsAdmin(path)) === expected) return
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`${path} n'a pas pris la valeur ${String(expected)}`)
  }

  test('connected passe à false quand le joueur se déconnecte', async () => {
    await seedSession()
    const playerDb = db(PLAYER)
    const connectedRef = playerDb.ref(`${SESSION}/players/${PLAYER}/connected`)
    await assertSucceeds(connectedRef.onDisconnect().set(false))
    playerDb.goOffline()
    await waitForValue(`${SESSION}/players/${PLAYER}/connected`, false)
    expect(await readAsAdmin(`${SESSION}/players/${PLAYER}/connected`)).toBe(false)
  })

  // Séquence exacte du client joueur (app/src/lib/joinGame.ts puis hooks/usePresence.ts).
  test("inscription par update, puis présence : seul connected change à la déconnexion", async () => {
    await seedSession({ status: 'lobby', players: null })
    const playerDb = db(OTHER)
    const playerRef = playerDb.ref(`${SESSION}/players/${OTHER}`)
    await assertSucceeds(playerRef.update({ name: 'Tom', avatar: '🐼', connected: true }))
    await assertSucceeds(playerRef.child('connected').onDisconnect().set(false))
    await assertSucceeds(playerRef.child('connected').set(true))
    playerDb.goOffline()
    await waitForValue(`${SESSION}/players/${OTHER}/connected`, false)
    expect(await readAsAdmin(`${SESSION}/players/${OTHER}`)).toEqual({ name: 'Tom', avatar: '🐼', connected: false })
  })

  test("onDisconnect sur la présence d'un autre joueur refusé", async () => {
    await seedSession()
    await assertFails(db(OTHER).ref(`${SESSION}/players/${PLAYER}/connected`).onDisconnect().set(false))
  })
})

// Chaque update() produit par le moteur de l'hôte (shared/hostEngine.ts), exécuté avec l'identité
// de l'hôte sur une session réaliste : les règles doivent l'accepter. La console Firebase
// contourne les règles ; sans ces tests, un refus n'apparaîtrait qu'en pleine partie.
describe("Moteur de l'hôte : updates acceptés par les règles", () => {
  // Partie courte de 2 questions pour parcourir toutes les transitions jusqu'à la fin.
  const gameQuestions = selectGameQuestions(QUESTIONS.slice(0, 2))

  async function readSession(): Promise<Session> {
    return (await readAsAdmin(SESSION)) as Session
  }

  async function applyAsHost(update: SessionUpdate | null): Promise<Session> {
    expect(update).not.toBeNull()
    await assertSucceeds(db(HOST).ref(SESSION).update(update as SessionUpdate))
    return readSession()
  }

  // Transition depuis l'état stocké, comme le fera le moteur.
  async function advance(session: Session, expectedStatus: GameStatus): Promise<Session> {
    expect(session.status).toBe(expectedStatus)
    const expected = { status: session.status, currentIndex: session.currentIndex }
    return applyAsHost(transitionUpdate(session, gameQuestions, expected, Date.now()))
  }

  async function seedLobby() {
    const lobby = makeSession({ phaseStartedAt: Date.now() })
    await seed({ sessions: { [CODE]: lobby } })
    return readSession()
  }

  test('partie complète : lancement, questions, réponses, révélations, classements, fin (sans classement après la dernière question)', async () => {
    let session = await seedLobby()

    const launch = launchUpdate(session, QUESTIONS.slice(0, 2), Date.now())
    expect(launch.ok).toBe(true)
    session = await applyAsHost(launch.ok ? launch.update : null)
    expect(session).toMatchObject({ status: 'starting', questionCount: 2 })

    for (let index = 0; index < gameQuestions.length; index++) {
      session = await advance(session, index === 0 ? 'starting' : 'scores')
      expect(session).toMatchObject({ status: 'question', currentIndex: index })

      // Réponses des joueurs, écrites comme le client joueur (même update multi-chemins).
      await assertSucceeds(submitAnswer(PLAYER, index, 1))
      await assertSucceeds(submitAnswer(HOST, index, 0))
      session = await readSession()

      session = await advance(session, 'question')
      expect(session.status).toBe('reveal')
      expect(session.answers?.[index]?.[PLAYER]).toMatchObject({ value: 1, correct: true })
      expect(session.players[PLAYER].rank).toBe(1)
      expect(session.players[PLAYER].streak).toBe(index + 1)

      // Après la dernière question : directement la fin, sans classement intermédiaire.
      session = await advance(session, 'reveal')
      expect(session.status).toBe(index + 1 < gameQuestions.length ? 'scores' : 'ended')
    }

    expect(session).toMatchObject({ status: 'ended' })
    expect(session.currentQuestion).toBeUndefined()
    expect(session.reveal).toBeUndefined()
  })

  // Vrai chemin des séries (spec 18) : l'hôte écrit, la TV et un joueur lisent les champs publics un par
  // un comme leurs applications (PUBLIC_SESSION_FIELDS, toPublicSession), puis le classement de la TV
  // choisit ses badges (rankingStreakBadges). Aucune donnée injectée à la main.
  async function readPublicSession(uid: string): Promise<PublicSession> {
    const values: Partial<Record<PublicField, unknown>> = {}
    for (const field of PUBLIC_SESSION_FIELDS) {
      values[field] = (await db(uid).ref(`${SESSION}/${field}`).once('value')).val() ?? undefined
    }
    const publicSession = toPublicSession(values)
    expect(publicSession).not.toBeNull()
    return publicSession as PublicSession
  }

  test('séries : écrites par l’hôte qui joue, reçues par la TV, les joueurs et l’hôte, badge au résultat et au classement dès 3', async () => {
    const questions = QUESTIONS.slice(0, 6)
    const gameQuestions6 = selectGameQuestions(questions)
    let session = await seedLobby()
    const launch = launchUpdate(session, questions, Date.now())
    session = await applyAsHost(launch.ok ? launch.update : null)
    const step = (from: GameStatus) => {
      expect(session.status).toBe(from)
      return applyAsHost(transitionUpdate(session, gameQuestions6, { status: session.status, currentIndex: session.currentIndex }, Date.now()))
    }
    session = await step('starting')
    for (let index = 0; index < 5; index++) {
      // L'hôte joue et répond juste (1) à chaque fois ; Léa se trompe à la première (0), puis répond juste.
      await assertSucceeds(submitAnswer(HOST, index, 1))
      await assertSucceeds(submitAnswer(PLAYER, index, index === 0 ? 0 : 1))
      session = await readSession()
      session = await step('question')
      expect(session.status).toBe('reveal')
      const hostStreak = index + 1
      const playerStreak = index
      const badge = (streak: number) => (streak >= 3 ? streak : null)
      // Écran de résultat : le joueur lit les champs un par un (site des joueurs), l'hôte qui joue lit sa
      // session d'un bloc (son app).
      expect(revealStreak(await readPublicSession(PLAYER), PLAYER)).toBe(badge(playerStreak))
      expect(revealStreak(await readSession(), HOST)).toBe(badge(hostStreak))
      session = await step('reveal')
      expect(session.status).toBe('scores')
      for (const reader of ['tv-uid', PLAYER]) {
        const seen = await readPublicSession(reader)
        expect(seen.players[HOST].streak).toBe(hostStreak)
        expect(seen.players[PLAYER].streak).toBe(playerStreak)
        const expected: Record<string, number> = {}
        if (hostStreak >= 3) expected[HOST] = hostStreak
        if (playerStreak >= 3) expected[PLAYER] = playerStreak
        expect(rankingStreakBadges(seen)).toEqual(expected)
      }
      session = await step('scores')
    }
    // Lectures champ par champ, deux lecteurs, cinq questions : plus long que la limite par défaut.
  }, 30_000)

  test('pause et reprise dans chaque état où elles sont possibles', async () => {
    let session = await seedLobby()
    const launch = launchUpdate(session, QUESTIONS.slice(0, 2), Date.now())
    session = await applyAsHost(launch.ok ? launch.update : null)

    for (const status of ['starting', 'question', 'reveal', 'scores'] as const) {
      expect(session.status).toBe(status)
      session = await applyAsHost(pauseUpdate(session, Date.now()))
      expect(session).toMatchObject({ status: 'paused', pausedFrom: status })

      session = await applyAsHost(resumeUpdate(session, Date.now()))
      expect(session.status).toBe(status)
      expect(session.pausedFrom).toBeUndefined()
      expect(session.remainingMs).toBeUndefined()

      if (status === 'question') await assertSucceeds(submitAnswer(PLAYER, 0, 1))
      session = await advance(await readSession(), status)
    }
  })

  test('un joueur ne peut pas jouer le rôle du moteur', async () => {
    const session = await seedLobby()
    const launch = launchUpdate(session, QUESTIONS.slice(0, 2), Date.now())
    expect(launch.ok).toBe(true)
    await assertFails(db(PLAYER).ref(SESSION).update(launch.ok ? launch.update : {}))
  })
})

// Joueurs fantômes : l'hôte retire de players/ un joueur déconnecté depuis plus de 30 s (lobby).
describe('Retrait des joueurs fantômes en lobby', () => {
  test("l'hôte supprime players/{uid} en lobby (un seul update multi-chemins)", async () => {
    await seedSession({ status: 'lobby', players: { [PLAYER]: { name: 'Léa', avatar: '🦊', connected: false } } })
    await assertSucceeds(db(HOST).ref(SESSION).update({ [`players/${PLAYER}`]: null }))
    expect(await readAsAdmin(`${SESSION}/players/${PLAYER}`)).toBeNull()
  })

  test('un joueur ne peut pas supprimer un autre joueur', async () => {
    await seedSession({ status: 'lobby', players: { [PLAYER]: { name: 'Léa', avatar: '🦊', connected: false } } })
    await assertFails(db(OTHER).ref(`${SESSION}/players/${PLAYER}`).remove())
  })

  test('joueur retiré : sa présence ne recrée pas une entrée incomplète', async () => {
    await seedSession({ status: 'lobby', players: null })
    const connectedRef = db(PLAYER).ref(`${SESSION}/players/${PLAYER}/connected`)
    await assertFails(connectedRef.set(true))
    await assertFails(connectedRef.onDisconnect().set(false))
  })

  test('joueur retiré : il peut se réinscrire tant que la partie est en lobby', async () => {
    await seedSession({ status: 'lobby', players: null })
    await assertSucceeds(
      db(PLAYER).ref(`${SESSION}/players/${PLAYER}`).update({ name: 'Léa', avatar: '🦊', connected: true }),
    )
  })
})

// D4 : contrôles de l'hôte (Terminer, Rejouer, Quitter), exécutés avec l'identité de l'hôte.
describe("Contrôles de l'hôte : Terminer, Rejouer, Quitter", () => {
  const twoQuestions = QUESTIONS.slice(0, 2)

  async function readSession(): Promise<Session> {
    return (await readAsAdmin(SESSION)) as Session
  }

  async function applyAsHost(update: SessionUpdate | null): Promise<Session> {
    expect(update).not.toBeNull()
    await assertSucceeds(db(HOST).ref(SESSION).update(update as SessionUpdate))
    return readSession()
  }

  // Partie lancée puis amenée jusqu'à la question 0.
  async function seedQuestion(): Promise<Session> {
    await seed({ sessions: { [CODE]: makeSession({ phaseStartedAt: Date.now() }) } })
    let session = await readSession()
    const launch = launchUpdate(session, twoQuestions, Date.now())
    session = await applyAsHost(launch.ok ? launch.update : null)
    const game = selectGameQuestions(twoQuestions)
    return applyAsHost(transitionUpdate(session, game, { status: 'starting', currentIndex: 0 }, Date.now()))
  }

  test('Terminer pendant une question : accepté, puis plus aucune réponse acceptée', async () => {
    let session = await seedQuestion()
    session = await applyAsHost(endUpdate(session, Date.now()))
    expect(session.status).toBe('ended')
    await assertFails(submitAnswer(PLAYER, 0, 1))
  })

  test('Terminer pendant la pause : accepté, état de pause effacé', async () => {
    let session = await seedQuestion()
    session = await applyAsHost(pauseUpdate(session, Date.now()))
    session = await applyAsHost(endUpdate(session, Date.now()))
    expect(session).toMatchObject({ status: 'ended' })
    expect(session.pausedFrom).toBeUndefined()
  })

  test('Rejouer : retour au lobby accepté (questionCount effacé), profil modifiable, relance acceptée', async () => {
    let session = await seedQuestion()
    session = await applyAsHost(endUpdate(session, Date.now()))
    session = await applyAsHost(replayUpdate(session, Date.now()))
    expect(session.status).toBe('lobby')
    expect(session.questionCount).toBeUndefined()
    expect(session.players[PLAYER].score).toBeUndefined()
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/avatar`).set('🐼'))
    const relaunch = launchUpdate(session, QUESTIONS.slice(0, 1), Date.now())
    session = await applyAsHost(relaunch.ok ? relaunch.update : null)
    expect(session).toMatchObject({ status: 'starting', questionCount: 1 })
  })

  test("Quitter : l'hôte supprime toute la session, un joueur ne le peut pas", async () => {
    await seedQuestion()
    await assertFails(db(PLAYER).ref(SESSION).remove())
    await assertSucceeds(db(HOST).ref(SESSION).remove())
    expect(await readAsAdmin(SESSION)).toBeNull()
  })
})

// D5 : hôte absent. hostLeftAt est écrit par l'onDisconnect de l'hôte ; au-delà du délai, un
// joueur ou la TV peut supprimer toute la session (et rien d'autre).
describe('Hôte absent : hostLeftAt et suppression après délai', () => {
  const TIMEOUT_MS = HOST_DISCONNECT_TIMEOUT_S * 1000

  async function waitForNumber(path: string): Promise<number> {
    for (let attempt = 0; attempt < 50; attempt++) {
      const value = await readAsAdmin(path)
      if (typeof value === 'number') return value
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`${path} n'a pas été écrit`)
  }

  test('hostLeftAt lisible par un joueur et par la TV, non modifiable par un joueur', async () => {
    await seedSession({ hostLeftAt: Date.now() - 1_000 })
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/hostLeftAt`).once('value'))
    await assertSucceeds(db(OTHER).ref(`${SESSION}/hostLeftAt`).once('value'))
    await assertFails(db(PLAYER).ref(`${SESSION}/hostLeftAt`).set(firebase.database.ServerValue.TIMESTAMP))
  })

  test("l'onDisconnect de l'hôte écrit hostLeftAt (heure du serveur) quand il se déconnecte", async () => {
    await seedSession()
    const hostDb = db(HOST)
    await assertSucceeds(hostDb.ref(SESSION).onDisconnect().update({ hostLeftAt: SERVER_TIME }))
    hostDb.goOffline()
    const hostLeftAt = await waitForNumber(`${SESSION}/hostLeftAt`)
    expect(Math.abs(hostLeftAt - Date.now())).toBeLessThan(10_000)
  })

  test('hostLeftAt dans le futur refusé, même pour l’hôte', async () => {
    await seedSession()
    await assertFails(db(HOST).ref(`${SESSION}/hostLeftAt`).set(Date.now() + 60_000))
  })

  test('suppression par un joueur refusée avant le délai (même valeur que la constante)', async () => {
    await seedSession({ hostLeftAt: Date.now() - TIMEOUT_MS + 30_000 })
    await assertFails(db(PLAYER).ref(SESSION).remove())
  })

  test('suppression acceptée après le délai, par un joueur ou par la TV', async () => {
    await seedSession({ hostLeftAt: Date.now() - TIMEOUT_MS - 5_000 })
    await assertSucceeds(db(PLAYER).ref(SESSION).remove())
    await seedSession({ status: 'ended', hostLeftAt: Date.now() - TIMEOUT_MS - 5_000 })
    await assertSucceeds(db(OTHER).ref(SESSION).remove())
  })

  test('suppression refusée sans hostLeftAt (hôte présent ou revenu)', async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(SESSION).remove())
  })

  test('après le délai, un joueur ne peut toujours rien écrire d’autre que la suppression', async () => {
    await seedSession({ hostLeftAt: Date.now() - TIMEOUT_MS - 5_000 })
    await assertFails(db(PLAYER).ref(`${SESSION}/status`).set('ended'))
    await assertFails(db(PLAYER).ref(SESSION).update({ status: 'ended' }))
    await assertFails(db(PLAYER).ref(`${SESSION}/players`).remove())
  })

  test("retour de l'hôte : pause recalculée et hostLeftAt effacé, accepté", async () => {
    const hostLeftAt = Date.now() - 20_000
    await seedSession({ hostLeftAt, phaseEndsAt: hostLeftAt + 12_000 })
    const session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(db(HOST).ref(SESSION).update(hostReturnUpdate(session) ?? {}))
    const after = (await readAsAdmin(SESSION)) as Session
    expect(after).toMatchObject({ status: 'paused', pausedFrom: 'question', remainingMs: 12_000 })
    expect(after.hostLeftAt).toBeUndefined()
  })

  test("Quitter : l'onDisconnect annulé ne recrée pas de hostLeftAt orphelin", async () => {
    await seedSession()
    const hostDb = db(HOST)
    const sessionRef = hostDb.ref(SESSION)
    await assertSucceeds(sessionRef.onDisconnect().update({ hostLeftAt: SERVER_TIME }))
    await assertSucceeds(sessionRef.onDisconnect().cancel())
    await assertSucceeds(sessionRef.remove())
    hostDb.goOffline()
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    expect(await readAsAdmin(SESSION)).toBeNull()
  })
})

describe('Réponse libre et Contrôle', () => {
  const FREE_SETTINGS = { answerMode: 'free', speedBonus: true, control: false, teams: false }
  const CONTROL_SETTINGS = { ...FREE_SETTINGS, control: true }

  test('saisie de 1 à 60 caractères acceptée, au-delà refusée', async () => {
    await seedSession({ settings: FREE_SETTINGS })
    await assertFails(submitAnswer(PLAYER, 0, 'x'.repeat(61)))
    await assertFails(submitAnswer(PLAYER, 0, ''))
    await assertSucceeds(submitAnswer(PLAYER, 0, 'x'.repeat(60)))
  })

  test('blind test « both » : titre et artiste, ou artiste seul ; pas d’artiste sans texte', async () => {
    await seedSession({ settings: FREE_SETTINGS })
    await assertFails(submitAnswer(PLAYER, 0, 'Satisfaction', { artist: 'y'.repeat(61) }))
    await assertFails(submitAnswer(PLAYER, 0, 1, { artist: 'Stones' }))
    await assertSucceeds(submitAnswer(PLAYER, 0, '', { artist: 'Stones' }))
    expect(await readAsAdmin(`${SESSION}/answers/0/${PLAYER}/artist`)).toBe('Stones')
  })

  test('un joueur ne peut écrire ni correct, ni points, ni partial, ni fullPoints', async () => {
    await seedSession({ settings: FREE_SETTINGS })
    for (const field of [{ partial: true }, { fullPoints: 200 }, { correct: true }, { points: 100 }]) {
      await assertFails(submitAnswer(PLAYER, 0, 'Canberra', field))
    }
  })

  test('aucune réponse pendant la validation', async () => {
    await seedSession({ settings: CONTROL_SETTINGS, status: 'validation', phaseEndsAt: 0 })
    await assertFails(submitAnswer(PLAYER, 0, 'Canberra'))
  })

  test('currentQuestion.ask : titre, artiste ou les deux seulement', async () => {
    await seedSession({ settings: FREE_SETTINGS })
    const ref = db(HOST).ref(`${SESSION}/currentQuestion`)
    const question = { text: 'Quel est ce morceau ?', difficulty: 1, timeLimit: 30 }
    await assertSucceeds(ref.set({ ...question, ask: 'both' }))
    await assertFails(ref.set({ ...question, ask: 'album' }))
  })

  test('révélation : groupes de réponses bien formés seulement, 8 au plus', async () => {
    await seedSession({ settings: FREE_SETTINGS, status: 'reveal' })
    const ref = db(HOST).ref(`${SESSION}/reveal`)
    const group = { value: 'Canberra', playerIds: [PLAYER], verdict: 'correct' }
    await assertSucceeds(ref.set({ correctAnswer: 'Canberra', stats: { freeAnswers: [group] } }))
    await assertFails(ref.set({ correctAnswer: 'Canberra', stats: { freeAnswers: [{ ...group, verdict: 'maybe' }] } }))
    await assertFails(ref.set({ correctAnswer: 'Canberra', stats: { freeAnswers: [{ playerId: PLAYER, value: 'x' }] } }))
    await assertFails(ref.set({ correctAnswer: 'Canberra', stats: { freeAnswers: Array(9).fill(group) } }))
    const partial = { correct: false, points: 75, partial: true, parts: { title: true, artist: false } }
    await assertSucceeds(ref.set({ correctAnswer: 'Canberra', stats: {}, results: { [PLAYER]: partial } }))
    await assertFails(ref.set({ correctAnswer: 'Canberra', stats: {}, results: { [PLAYER]: { ...partial, parts: { title: true } } } }))
  })

  test('moteur : question → validation → révélation → classement, accepté par les règles', async () => {
    const questions = selectGameQuestions(QUESTIONS.slice(0, 2))
    const start = Date.now()
    await seed({
      sessions: {
        [CODE]: makeSession({
          status: 'question',
          settings: { answerMode: 'free', speedBonus: true, control: true, teams: false },
          questionCount: 2,
          phaseStartedAt: start - 5_000,
          phaseEndsAt: start + 25_000,
        }),
      },
    })
    await assertSucceeds(submitAnswer(PLAYER, 0, 'Juste 0'))
    await assertSucceeds(submitAnswer(HOST, 0, 'Juste O'))
    const hostRef = db(HOST).ref(SESSION)

    let session = (await readAsAdmin(SESSION)) as Session
    const toValidation = transitionUpdate(session, questions, { status: 'question', currentIndex: 0 }, Date.now())
    await assertSucceeds(hostRef.update(toValidation ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    expect(session).toMatchObject({ status: 'validation', phaseEndsAt: 0 })
    expect(session.answers?.[0]?.[PLAYER]?.fullPoints).toBeGreaterThan(100)

    await assertSucceeds(hostRef.update(pauseUpdate(session, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(resumeUpdate(session, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    expect(session).toMatchObject({ status: 'validation', phaseEndsAt: 0 })

    await assertSucceeds(hostRef.update(validateUpdate(session, questions, { main: { 'juste o': false } }, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    expect(session.status).toBe('reveal')
    expect(session.reveal?.results?.[PLAYER]?.correct).toBe(true)
    expect(session.reveal?.results?.[HOST]).toEqual({ correct: false, points: 0 })
    expect(session.reveal?.stats.freeAnswers).toHaveLength(2)

    const toScores = transitionUpdate(session, questions, { status: 'reveal', currentIndex: 0 }, Date.now())
    await assertSucceeds(hostRef.update(toScores ?? {}))
  })
})

describe('Groupe (équipes)', () => {
  const TEAM_SETTINGS = { answerMode: 'choice', speedBonus: true, control: false, teams: true, teamMode: 'players', teamCount: 2 }
  const lobbyPlayers = {
    [HOST]: { name: 'Hôte', avatar: '🐸', connected: true },
    [PLAYER]: { name: 'Léa', avatar: '🦊', connected: true },
    [OTHER]: { name: 'Tom', avatar: '🐼', connected: true },
  }

  function seedTeamLobby(settings: Data = {}) {
    return seedSession({ status: 'lobby', phaseEndsAt: 0, settings: { ...TEAM_SETTINGS, ...settings }, players: lobbyPlayers })
  }

  test('« Ils choisissent » : un joueur choisit sa propre équipe en lobby, et la change', async () => {
    await seedTeamLobby()
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('pink'))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('cyan'))
  })

  test('jamais l’équipe d’un autre joueur, ni hors du mode « Ils choisissent »', async () => {
    await seedTeamLobby()
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${OTHER}/team`).set('pink'))
    await seedTeamLobby({ teamMode: 'random' })
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('pink'))
  })

  test('équipe inconnue, ou au-delà du nombre d’équipes (Or dès 3, Vert à 4), refusée', async () => {
    await seedTeamLobby()
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('purple'))
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('gold'))
    await seedTeamLobby({ teamCount: 3 })
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('gold'))
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('green'))
  })

  test('après le lancement, personne ne change d’équipe, pas même l’hôte', async () => {
    await seedSession({ settings: TEAM_SETTINGS, players: { [PLAYER]: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true, team: 'pink' } } })
    await assertFails(db(PLAYER).ref(`${SESSION}/players/${PLAYER}/team`).set('cyan'))
    await assertFails(db(HOST).ref(`${SESSION}/players/${PLAYER}/team`).set('cyan'))
  })

  test('classement des équipes : forme vérifiée, lisible par les joueurs, écrit par l’hôte seul', async () => {
    await seedSession({ settings: TEAM_SETTINGS })
    await assertSucceeds(db(HOST).ref(`${SESSION}/teams/pink`).set({ score: 75.5, rank: 1 }))
    await assertFails(db(HOST).ref(`${SESSION}/teams/purple`).set({ score: 1, rank: 1 }))
    await assertFails(db(PLAYER).ref(`${SESSION}/teams/pink`).set({ score: 999, rank: 1 }))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/teams`).once('value'))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/teamPoints`).once('value'))
  })

  // TV et joueurs lisent la partie champ par champ (PUBLIC_SESSION_FIELDS) : chaque champ doit être
  // lisible par un utilisateur connecté qui n'est pas dans la partie (la TV), sinon son écran reste vide.
  test('chaque champ public, équipes comprises, est lisible par la TV', async () => {
    await seedSession({ settings: TEAM_SETTINGS, teams: { pink: { score: 442, rank: 1 } }, teamPoints: { 0: { pink: 442 } }, teamPresence: { 0: { [PLAYER]: true } }, teamDrawAt: 1 })
    for (const field of PUBLIC_SESSION_FIELDS) {
      await assertSucceeds(db('tv-uid').ref(`${SESSION}/${field}`).once('value'))
    }
    expect(((await db('tv-uid').ref(`${SESSION}/teams/pink`).once('value')).val() as Data).score).toBe(442)
  })

  test('« Au hasard » sans tirage : équipes écrites en lobby, puis lancement, acceptés par les règles', async () => {
    await seedSession({ status: 'lobby', phaseEndsAt: 0, settings: { ...TEAM_SETTINGS, teamMode: 'random' }, players: {
      ...lobbyPlayers,
      'p4-uid': { name: 'Noé', avatar: '🦖', connected: true },
    } })
    const hostRef = db(HOST).ref(SESSION)
    const session = (await readAsAdmin(SESSION)) as Session
    const draw = launchTeamDraw(session)
    expect(draw).not.toBeNull()
    const launch = launchUpdate(draw?.session ?? session, QUESTIONS.slice(0, 2), Date.now())
    expect(launch.ok).toBe(true)
    await assertSucceeds(hostRef.update(draw?.update ?? {}))
    await assertSucceeds(hostRef.update(launch.ok ? launch.update : {}))
    expect(await readAsAdmin(`${SESSION}/players/p4-uid/team`)).toMatch(/^(pink|cyan)$/)
  })

  test('moteur : tirage, lancement, réponses et révélation avec équipes, acceptés par les règles', async () => {
    await seedSession({ status: 'lobby', phaseEndsAt: 0, settings: { ...TEAM_SETTINGS, teamMode: 'random' }, players: {
      ...lobbyPlayers,
      'p4-uid': { name: 'Noé', avatar: '🦖', connected: true },
    } })
    const hostRef = db(HOST).ref(SESSION)
    let session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(teamDrawUpdate(session, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    // « Valider les équipes » : l'heure de validation est publiée (son de la TV), lisible par la TV.
    const validated = teamsValidatedUpdate(session, Date.now())
    expect(validated).not.toBeNull()
    await assertSucceeds(hostRef.update(validated ?? {}))
    await assertSucceeds(db('tv-uid').ref(`${SESSION}/teamsValidatedAt`).once('value'))
    session = (await readAsAdmin(SESSION)) as Session
    const launch = launchUpdate(session, QUESTIONS.slice(0, 2), Date.now())
    expect(launch.ok).toBe(true)
    await assertSucceeds(hostRef.update(launch.ok ? launch.update : {}))

    session = (await readAsAdmin(SESSION)) as Session
    const questions = selectGameQuestions(QUESTIONS.slice(0, 2))
    await assertSucceeds(hostRef.update(transitionUpdate(session, questions, { status: 'starting', currentIndex: 0 }, Date.now()) ?? {}))
    await assertSucceeds(submitAnswer(PLAYER, 0, 1))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(transitionUpdate(session, questions, { status: 'question', currentIndex: 0 }, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    expect(session.status).toBe('reveal')
    expect(Object.keys(session.teams ?? {}).sort()).toEqual(['cyan', 'pink'])
    expect(session.teamPresence?.[0]).toBeDefined()
  })
})

describe('Bluff', () => {
  const BLUFF_SETTINGS = { answerMode: 'bluff', speedBonus: true, control: false, teams: false }
  const bluffPlayers = {
    [PLAYER]: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true },
    [OTHER]: { name: 'Tom', avatar: '🐼', score: 0, rank: 1, connected: true },
  }

  function seedWriting(extra: Data = {}) {
    return seedSession({ settings: BLUFF_SETTINGS, players: bluffPlayers, ...extra })
  }

  function writeBluff(uid: string, text: string, index = 0) {
    return db(uid).ref(`${SESSION}/bluffs/${index}/${uid}`).set({ text, submittedAt: SERVER_TIME })
  }

  // Vote et votedBy écrits ensemble, comme le fera le client joueur.
  function castVote(uid: string, value: number, index = 0) {
    return db(uid)
      .ref(SESSION)
      .update({ [`votes/${index}/${uid}`]: { value, submittedAt: SERVER_TIME }, [`votedBy/${index}/${uid}`]: true })
  }

  const voting = {
    status: 'vote',
    settings: BLUFF_SETTINGS,
    players: bluffPlayers,
    currentQuestion: { text: 'Question ?', difficulty: 2, timeLimit: 45, choices: ['Vraie', 'Monopolis', 'Leurre'] },
    bluffChoices: { 0: [{ text: 'Vraie', kind: 'truth' }, { text: 'Monopolis', kind: 'bluff', authors: [PLAYER] }, { text: 'Leurre', kind: 'decoy' }] },
    bluffOwn: { 0: { [PLAYER]: 1 } },
  }

  test('un joueur écrit sa proposition pendant l’écriture d’un Bluff, jamais celle d’un autre ni au-delà de 100 caractères', async () => {
    await seedWriting()
    await assertSucceeds(writeBluff(PLAYER, 'Monopolis'))
    await assertFails(db(PLAYER).ref(`${SESSION}/bluffs/0/${OTHER}`).set({ text: 'Usurpée', submittedAt: SERVER_TIME }))
    await assertFails(writeBluff(OTHER, 'x'.repeat(101)))
    await assertSucceeds(writeBluff(OTHER, 'Il a fini sa vie en vendant des parapluies sur les quais de Seine, ruiné par un pari stupide.'))
    await assertFails(writeBluff(OTHER, 'Mauvaise question', 1))
  })

  test('hors de l’écriture, ou hors d’un Bluff : refusé', async () => {
    await seedWriting({ status: 'vote' })
    await assertFails(writeBluff(PLAYER, 'Monopolis'))
    await seedSession({ players: bluffPlayers })
    await assertFails(writeBluff(PLAYER, 'Monopolis'))
  })

  test('réécriture permise après un refus, jamais après l’acceptation ni après ' + BLUFF_MAX_ATTEMPTS + ' refus', async () => {
    await seedWriting({ bluffChecks: { 0: { [PLAYER]: { verdict: 'truth', refusals: 1, submittedAt: 1 }, [OTHER]: { verdict: 'ok', refusals: 0, submittedAt: 1 } } } })
    await assertSucceeds(writeBluff(PLAYER, 'Monopolis'))
    await assertFails(writeBluff(OTHER, 'Autre idée'))
    await seedWriting({ bluffChecks: { 0: { [PLAYER]: { verdict: 'truth', refusals: BLUFF_MAX_ATTEMPTS, submittedAt: 1 } } } })
    await assertFails(writeBluff(PLAYER, 'Monopolis'))
  })

  test('chacun ne lit que sa proposition, son verdict et son propre choix ; auteurs et votes réservés à l’hôte', async () => {
    await seedSession({
      ...voting,
      bluffs: { 0: { [PLAYER]: { text: 'Monopolis', submittedAt: 1 } } },
      bluffChecks: { 0: { [PLAYER]: { verdict: 'ok', refusals: 0, submittedAt: 1 } } },
      bluffedBy: { 0: { [PLAYER]: true } },
      votes: { 0: { [OTHER]: { value: 1, submittedAt: 1 } } },
      bluffPoints: { 0: { [PLAYER]: 500 } },
    })
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/bluffs/0/${PLAYER}`).once('value'))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/bluffChecks/0/${PLAYER}`).once('value'))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/bluffOwn/0/${PLAYER}`).once('value'))
    await assertFails(db(OTHER).ref(`${SESSION}/bluffs/0/${PLAYER}`).once('value'))
    await assertFails(db(OTHER).ref(`${SESSION}/bluffChecks/0/${PLAYER}`).once('value'))
    await assertFails(db(OTHER).ref(`${SESSION}/bluffOwn/0/${PLAYER}`).once('value'))
    for (const node of ['bluffs', 'bluffChecks', 'bluffOwn', 'bluffChoices', 'votes', 'bluffPoints']) {
      await assertFails(db(PLAYER).ref(`${SESSION}/${node}`).once('value'))
    }
    await assertSucceeds(db(OTHER).ref(`${SESSION}/bluffedBy`).once('value'))
    await assertSucceeds(db(OTHER).ref(`${SESSION}/votedBy`).once('value'))
  })

  test('vote : une fois, pendant le vote, pour un choix qui existe et jamais pour sa propre proposition', async () => {
    await seedSession(voting)
    await assertFails(castVote(PLAYER, 1))
    await assertFails(castVote(PLAYER, 7))
    await assertSucceeds(castVote(PLAYER, 0))
    await assertFails(castVote(PLAYER, 2))
    await assertSucceeds(castVote(OTHER, 1))
    await seedSession({ ...voting, status: 'reveal' })
    await assertFails(castVote(OTHER, 0))
  })

  test('vote sans minuteur : accepté longtemps après le début (phaseEndsAt = 0), refusé en pause et une fois le vote clos', async () => {
    await seedSession({ ...voting, phaseStartedAt: Date.now() - 600_000, phaseEndsAt: 0 })
    await assertSucceeds(castVote(PLAYER, 0))
    await seedSession({ ...voting, status: 'paused', pausedFrom: 'vote', phaseEndsAt: 0, remainingMs: 0 })
    await assertFails(castVote(OTHER, 1))
    await seedSession({ ...voting, status: 'reveal', phaseEndsAt: 0 })
    await assertFails(castVote(OTHER, 1))
  })

  test('moteur : vérification, vote et révélation d’un Bluff acceptés par les règles', async () => {
    await seedSession({ status: 'lobby', phaseEndsAt: 0, settings: BLUFF_SETTINGS, players: bluffPlayers })
    const hostRef = db(HOST).ref(SESSION)
    let session = (await readAsAdmin(SESSION)) as Session
    const launch = launchUpdate(session, BLUFF_QUESTIONS, Date.now())
    await assertSucceeds(hostRef.update(launch.ok ? launch.update : {}))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(transitionUpdate(session, BLUFF_QUESTIONS, { status: 'starting', currentIndex: 0 }, Date.now()) ?? {}))
    await assertSucceeds(writeBluff(PLAYER, 'Monopolis'))
    await assertSucceeds(writeBluff(OTHER, "The Landlord's Game"))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(bluffChecksUpdate(session, BLUFF_QUESTIONS[0]) ?? {}))
    await assertSucceeds(writeBluff(OTHER, 'Rue Royale'))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(bluffChecksUpdate(session, BLUFF_QUESTIONS[0]) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(transitionUpdate(session, BLUFF_QUESTIONS, { status: 'question', currentIndex: 0 }, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    expect(session.status).toBe('vote')
    const own = session.bluffOwn?.[0] ?? {}
    await assertSucceeds(castVote(PLAYER, own[OTHER]))
    await assertSucceeds(castVote(OTHER, own[PLAYER]))
    session = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(transitionUpdate(session, BLUFF_QUESTIONS, { status: 'vote', currentIndex: 0 }, Date.now()) ?? {}))
    session = (await readAsAdmin(SESSION)) as Session
    expect(session.status).toBe('reveal')
    expect(session.bluffPoints?.[0]).toEqual({ [PLAYER]: 500, [OTHER]: 500 })
  })
})

describe('Son de la TV (sound)', () => {
  const sound = { music: true, effects: false, volume: 60 }

  test('écrit par l’hôte à la création et en pleine partie, lisible par la TV', async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(session({ players: null, sound })))
    await assertSucceeds(db(HOST).ref(`${SESSION}/sound`).set({ ...sound, volume: 100 }))
    expect(((await db('tv-uid').ref(`${SESSION}/sound`).once('value')).val() as Data).volume).toBe(100)
  })

  test('ni joueur ni autre utilisateur ne peut le modifier', async () => {
    await seedSession({ sound })
    await assertFails(db(PLAYER).ref(`${SESSION}/sound`).set({ ...sound, volume: 0 }))
    await assertFails(db(OTHER).ref(`${SESSION}/sound/music`).set(false))
  })

  test('forme invalide refusée', async () => {
    await seedSession({ sound })
    await assertFails(db(HOST).ref(`${SESSION}/sound`).set({ ...sound, volume: 101 }))
    await assertFails(db(HOST).ref(`${SESSION}/sound`).set({ ...sound, volume: 50.5 }))
    await assertFails(db(HOST).ref(`${SESSION}/sound`).set({ music: true, effects: true }))
    await assertFails(db(HOST).ref(`${SESSION}/sound`).set({ ...sound, extra: 1 }))
    await assertFails(db(HOST).ref(`${SESSION}/sound/music`).set('oui'))
  })

  test('partie sans réglage du son (créée avant) : toujours valide', async () => {
    await assertSucceeds(db(HOST).ref(SESSION).set(session({ players: null })))
  })
})

describe('Série (players/{uid}/streak)', () => {
  const STREAK_PATH = `${SESSION}/players/${PLAYER}/streak`

  test('l’hôte écrit un entier de 0 à 50, lisible par un autre joueur et la TV', async () => {
    await seedSession({ status: 'reveal' })
    await assertSucceeds(db(HOST).ref(STREAK_PATH).set(0))
    await assertSucceeds(db(HOST).ref(STREAK_PATH).set(5))
    await assertSucceeds(db(HOST).ref(STREAK_PATH).set(50))
    expect((await db(OTHER).ref(STREAK_PATH).once('value')).val()).toBe(50)
    expect((await db('tv-uid').ref(STREAK_PATH).once('value')).val()).toBe(50)
  })

  test('valeur invalide refusée : négative, décimale, au-delà de 50, texte', async () => {
    await seedSession({ status: 'reveal' })
    for (const value of [-1, 1.5, 51, 'x']) {
      await assertFails(db(HOST).ref(STREAK_PATH).set(value))
    }
  })

  test('un joueur ne peut écrire ni sa série ni celle d’un autre', async () => {
    await seedSession({ status: 'reveal' })
    await assertFails(db(PLAYER).ref(STREAK_PATH).set(3))
    await assertFails(db(OTHER).ref(STREAK_PATH).set(0))
  })

  test('Rejouer : l’hôte la supprime', async () => {
    await seedSession({ status: 'ended', players: { [PLAYER]: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true, streak: 4 } } })
    await assertSucceeds(db(HOST).ref(STREAK_PATH).remove())
  })
})

describe('Groupe : validation des équipes (teamsValidatedAt)', () => {
  test('écrit par l’hôte, nombre seulement ; jamais par un joueur', async () => {
    await seedSession({ status: 'lobby', phaseEndsAt: 0 })
    await assertSucceeds(db(HOST).ref(`${SESSION}/teamsValidatedAt`).set(Date.now()))
    await assertFails(db(HOST).ref(`${SESSION}/teamsValidatedAt`).set('maintenant'))
    await assertFails(db(PLAYER).ref(`${SESSION}/teamsValidatedAt`).set(Date.now()))
  })

  test('retardataires placés par l’hôte après la validation (Or et Vert compris) : accepté par les règles', async () => {
    const teams = ['pink', 'cyan', 'gold', 'green'] as const
    const players: Data = {}
    for (let index = 0; index < 8; index++) players[`p${index}`] = { name: `Joueur ${index}`, avatar: '🦊', connected: true, team: teams[index % 4] }
    players.late0 = { name: 'Tard 1', avatar: '🐸', connected: true }
    players.late1 = { name: 'Tard 2', avatar: '🐸', connected: true }
    players.late2 = { name: 'Tard 3', avatar: '🐸', connected: true }
    await seedSession({
      status: 'lobby',
      phaseEndsAt: 0,
      settings: { answerMode: 'choice', speedBonus: true, control: false, teams: true, teamMode: 'random', teamCount: 4 },
      players,
      teamDrawAt: Date.now() - 60_000,
      teamsValidatedAt: Date.now() - 30_000,
    })
    const session = (await readAsAdmin(SESSION)) as Session
    const update = lateJoinerUpdate(session)
    expect(update).toMatchObject({ 'players/late0/team': 'pink', 'players/late1/team': 'cyan', 'players/late2/team': 'gold' })
    await assertSucceeds(db(HOST).ref(SESSION).update(update ?? {}))
    // Un joueur ne se place pas lui-même hors du mode « Ils choisissent ».
    await assertFails(db('late9').ref(`${SESSION}/players/late9/team`).set('green'))
  })
})

// Hôte qui joue (2 joueurs : l'hôte + 1) : sa proposition, écrite avec l'heure du serveur, lui arrive
// d'abord avec une estimation locale, puis avec la vraie valeur. Elle doit figurer dans les choix du
// vote comme celle de l'autre joueur ; le joueur ne peut pas voter pour la sienne.
describe('Bluff : hôte qui joue, 2 joueurs', () => {
  test('les deux propositions sont dans les choix ; chacun vote pour l’autre et le piège', async () => {
    const now = Date.now()
    await seedSession({
      settings: { answerMode: 'bluff', speedBonus: false, control: false, teams: false },
      questionCount: 1,
      currentQuestion: { text: BLUFF_QUESTIONS[0].text, difficulty: 2, timeLimit: 60 },
      phaseStartedAt: now - 1_000,
      phaseEndsAt: now + 60_000,
      players: {
        [HOST]: { name: 'Hôte', avatar: '🐸', score: 0, rank: 1, connected: true },
        [PLAYER]: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true },
      },
    })
    const hostRef = db(HOST).ref(SESSION)
    const stamps: number[] = []
    const refused: string[] = []
    let latest: Session | null = null
    // Comme l'app de l'hôte : session lue en temps réel, chaque nouvelle valeur jugée aussitôt.
    hostRef.on('value', (snapshot) => {
      latest = snapshot.val() as Session
      const stamp = latest.bluffs?.[0]?.[HOST]?.submittedAt
      if (stamp !== undefined && stamps.at(-1) !== stamp) stamps.push(stamp)
      const update = bluffChecksUpdate(latest, BLUFF_QUESTIONS[0])
      if (update) hostRef.update(update).catch((error: unknown) => refused.push(String(error)))
    })
    await db(PLAYER).ref(`${SESSION}/bluffs/0/${PLAYER}`).set({ text: 'Proposition de Léa', submittedAt: SERVER_TIME })
    await hostRef.child(`bluffs/0/${HOST}`).set({ text: 'Proposition de l’hôte', submittedAt: SERVER_TIME })
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    hostRef.off()
    const written = (await readAsAdmin(SESSION)) as Session
    expect(written.bluffChecks?.[0][HOST]).toMatchObject({ verdict: 'ok', submittedAt: written.bluffs?.[0][HOST].submittedAt })

    await assertSucceeds(hostRef.update(transitionUpdate(written, BLUFF_QUESTIONS.slice(0, 1), { status: 'question', currentIndex: 0 }, Date.now()) ?? {}))
    const voting = (await readAsAdmin(SESSION)) as Session
    const choices = voting.bluffChoices?.[0] ?? []
    const own = voting.bluffOwn?.[0] ?? {}
    expect(choices.filter((choice) => choice.kind === 'bluff').map((choice) => choice.text).sort()).toEqual(['Proposition de Léa', 'Proposition de l’hôte'])
    expect(choices[own[HOST]]?.authors).toEqual([HOST])
    expect(choices[own[PLAYER]]?.authors).toEqual([PLAYER])

    const castVote = (uid: string, value: number) =>
      db(uid).ref(SESSION).update({ [`votes/0/${uid}`]: { value, submittedAt: SERVER_TIME }, [`votedBy/0/${uid}`]: true })
    // Le joueur ne peut pas voter pour sa proposition (règles) ; l'hôte, autorité de la partie, n'en est pas
    // empêché par les règles : son écran grise sa proposition et le moteur ignore un tel vote (tests unitaires).
    await assertFails(castVote(PLAYER, own[PLAYER]))
    await assertSucceeds(castVote(HOST, own[PLAYER]))
    await assertSucceeds(castVote(PLAYER, own[HOST]))
    const voted = (await readAsAdmin(SESSION)) as Session
    await assertSucceeds(hostRef.update(transitionUpdate(voted, BLUFF_QUESTIONS.slice(0, 1), { status: 'vote', currentIndex: 0 }, Date.now()) ?? {}))
    // Chacun a piégé l'autre : 500 points chacun.
    expect(((await readAsAdmin(SESSION)) as Session).bluffPoints?.[0]).toEqual({ [HOST]: 500, [PLAYER]: 500 })
    // Le jugement de l'hôte n'a jamais été refusé par les règles (heure recopiée comprise).
    expect(refused).toEqual([])
    // Diagnostic : l'hôte voit sa propre proposition avec une heure estimée, puis celle du serveur.
    expect(stamps.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Dessine-moi (dessin en direct, lot 2)', () => {
  const DRAW_SETTINGS = { answerMode: 'draw', speedBonus: false, control: false, teams: false }
  const twoPlayers = {
    [PLAYER]: { name: 'Léa', avatar: '🦊', score: 0, rank: 1, connected: true },
    [OTHER]: { name: 'Tom', avatar: '🐼', score: 0, rank: 1, connected: true },
  }
  const round = (overrides: Data = {}) => ({
    settings: DRAW_SETTINGS,
    players: twoPlayers,
    currentQuestion: { text: 'Animal', difficulty: 1, timeLimit: 75 },
    drawTurn: { drawer: PLAYER, round: 0, wordLength: 4, category: 'Animal' },
    drawSecret: { word: 'chat', category: 'Animal' },
    ...overrides,
  })
  const chunk = (key: string) => `${SESSION}/drawing/${key}`

  test('le dessinateur envoie ses paquets pendant sa manche ; tout le monde les lit', async () => {
    await seedSession(round())
    await assertSucceeds(db(PLAYER).ref(chunk('0')).set('0:s0,1,1:a,a;1,1'))
    await assertSucceeds(db(PLAYER).ref(chunk('399')).set('b3:u'))
    expect((await db('tv-uid').ref(chunk('0')).once('value')).val()).toBe('0:s0,1,1:a,a;1,1')
    expect((await db(OTHER).ref(`${SESSION}/drawing`).once('value')).exists()).toBe(true)
  })

  test('refusé : autre joueur, paquet réécrit, trop long, mauvaise clé ou pas du texte, hors de la manche', async () => {
    await seedSession(round())
    await assertFails(db(OTHER).ref(chunk('0')).set('0:u'))
    await assertSucceeds(db(PLAYER).ref(chunk('1')).set('1:u'))
    await assertFails(db(PLAYER).ref(chunk('1')).set('1:x0'))
    await assertFails(db(PLAYER).ref(chunk('2')).set('2:' + 'a'.repeat(3999)))
    await assertFails(db(PLAYER).ref(chunk('400')).set('400:u'))
    await assertFails(db(PLAYER).ref(chunk('07')).set('7:u'))
    await assertFails(db(PLAYER).ref(chunk('3')).set(42))
    await seedSession(round({ status: 'reveal' }))
    await assertFails(db(PLAYER).ref(chunk('4')).set('4:u'))
  })

  test('le mot : lu par le dessinateur et l’hôte seulement, jamais par un autre joueur ni la TV', async () => {
    await seedSession(round())
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/drawSecret`).once('value'))
    await assertSucceeds(db(HOST).ref(`${SESSION}/drawSecret`).once('value'))
    await assertFails(db(OTHER).ref(`${SESSION}/drawSecret`).once('value'))
    await assertFails(db('tv-uid').ref(`${SESSION}/drawSecret`).once('value'))
    await assertFails(db(PLAYER).ref(`${SESSION}/drawSecret`).set({ word: 'chien', category: 'Animal' }))
  })

  test('manche publique (dessinateur, catégorie, nombre de lettres) : lue par tous, écrite par l’hôte seul', async () => {
    await seedSession(round())
    expect((await db('tv-uid').ref(`${SESSION}/drawTurn`).once('value')).val()).toMatchObject({ drawer: PLAYER, wordLength: 4 })
    await assertFails(db(PLAYER).ref(`${SESSION}/drawTurn/drawer`).set(OTHER))
    await assertFails(db(HOST).ref(`${SESSION}/drawTurn`).set({ drawer: 'inconnu', round: 0, wordLength: 4, category: 'Animal' }))
  })

  const guess = (uid: string, count: number, text = 'chien') =>
    db(uid).ref(`${SESSION}/drawGuess/${uid}`).set({ text, count, at: SERVER_TIME })
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  test('essais : un devineur, numérotés de 1 à 15, 1,5 s d’écart au moins ; jamais le dessinateur', async () => {
    await seedSession(round())
    await assertSucceeds(guess(OTHER, 1))
    await assertFails(guess(OTHER, 2))
    await sleep(1_600)
    await assertFails(guess(OTHER, 3))
    await assertSucceeds(guess(OTHER, 2))
    await assertFails(guess(PLAYER, 1))
    await assertFails(db(OTHER).ref(`${SESSION}/drawGuess/${OTHER}`).set({ text: 'x'.repeat(41), count: 3, at: SERVER_TIME }))
    // Seul l'hôte lit les essais.
    await assertFails(db('tv-uid').ref(`${SESSION}/drawGuess`).once('value'))
    await assertFails(db(PLAYER).ref(`${SESSION}/drawGuess/${OTHER}`).once('value'))
  })

  test('essais : plus rien après avoir trouvé, ni après le 15e, ni hors de la manche', async () => {
    await seedSession(round({ drawFound: { [OTHER]: Date.now() } }))
    await assertFails(guess(OTHER, 1))
    await seedSession(round({ drawGuess: { [OTHER]: { text: 'x', count: 15, at: Date.now() - 5_000 } } }))
    await assertFails(guess(OTHER, 16))
    await seedSession(round({ status: 'reveal' }))
    await assertFails(guess(OTHER, 1))
  })

  test('Groupe : seule l’équipe du dessinateur devine', async () => {
    const third = 'third-uid'
    await seedSession(
      round({
        settings: { ...DRAW_SETTINGS, teams: true, teamCount: 2 },
        players: {
          [PLAYER]: { ...twoPlayers[PLAYER], team: 'pink' },
          [OTHER]: { ...twoPlayers[OTHER], team: 'cyan' },
          [third]: { name: 'Zoé', avatar: '🦄', score: 0, rank: 1, connected: true, team: 'pink' },
        },
      }),
    )
    await assertFails(guess(OTHER, 1))
    await assertSucceeds(guess(third, 1))
  })

  test('verdict : lu par le joueur seul ; « a trouvé » lu par tous ; points des manches écrits par l’hôte', async () => {
    await seedSession(round({ drawHint: { [OTHER]: { count: 1, verdict: 'close' } }, drawFound: { [OTHER]: 1 } }))
    await assertSucceeds(db(OTHER).ref(`${SESSION}/drawHint/${OTHER}`).once('value'))
    await assertFails(db(PLAYER).ref(`${SESSION}/drawHint/${OTHER}`).once('value'))
    expect((await db('tv-uid').ref(`${SESSION}/drawFound`).once('value')).val()).toEqual({ [OTHER]: 1 })
    await assertFails(db(OTHER).ref(`${SESSION}/drawFound/${OTHER}`).set(2))
    await assertSucceeds(db(HOST).ref(`${SESSION}/drawPoints/0/${OTHER}`).set(820))
    await assertSucceeds(db(HOST).ref(`${SESSION}/reveal`).set({ correctAnswer: 'chat', stats: { drawCancelled: true } }))
  })

  test('changement de mot : le dessinateur, une fois, avant son premier trait', async () => {
    await seedSession(round())
    await assertFails(db(OTHER).ref(`${SESSION}/drawWordChange`).set(true))
    await assertSucceeds(db(PLAYER).ref(`${SESSION}/drawWordChange`).set(true))
    await assertFails(db(PLAYER).ref(`${SESSION}/drawWordChange`).set(true))
    await seedSession(round({ drawing: { 0: '0:u' } }))
    await assertFails(db(PLAYER).ref(`${SESSION}/drawWordChange`).set(true))
    await seedSession(round({ drawTurn: { drawer: PLAYER, round: 0, wordLength: 4, category: 'Animal', changedWord: true } }))
    await assertFails(db(PLAYER).ref(`${SESSION}/drawWordChange`).set(true))
  })

  test('partie réelle : lancement, manche, paquets du dessinateur, révélation, manche suivante (moteur et règles)', async () => {
    const questions = drawGameQuestions(CODE)
    await seed({ sessions: { [CODE]: makeSession({ settings: DRAW_SETTINGS as Session['settings'], phaseStartedAt: Date.now() }) } })
    const asHost = async (update: SessionUpdate | null) => {
      expect(update).not.toBeNull()
      await assertSucceeds(db(HOST).ref(SESSION).update(update as SessionUpdate))
      return (await readAsAdmin(SESSION)) as Session
    }
    let session = (await readAsAdmin(SESSION)) as Session
    const launch = launchUpdate(session, questions, Date.now())
    session = await asHost(launch.ok ? launch.update : null)
    const step = async () => (session = await asHost(transitionUpdate(session, questions, { status: session.status, currentIndex: session.currentIndex }, Date.now())))
    await step()
    expect(session.status).toBe('question')
    const drawer = session.drawTurn?.drawer as string
    expect(drawer).not.toBe(HOST)
    // Le dessinateur dessine ; la TV lit le dessin et le reconstruit.
    const writer = new DrawingWriter()
    writer.beginStroke(1, 1, 10, 10)
    writer.extendStroke(200, 10)
    writer.endStroke()
    writer.fill(5, [3, 4, 10])
    for (const { seq, data } of writer.flush()) await assertSucceeds(db(drawer).ref(chunk(String(seq))).set(data))
    const seen = (await db('tv-uid').ref(`${SESSION}/drawing`).once('value')).val() as Record<string, string> | string[]
    const doc = new DrawingDoc()
    for (const data of Object.values(seen)) if (typeof data === 'string') doc.applyChunk(data)
    expect(doc.ops.map((op) => op.kind)).toEqual(['stroke', 'fill'])
    // Un devineur trouve le mot ; l'hôte juge son essai (verdict et « a trouvé »).
    const guesser = [PLAYER, OTHER].find((uid) => uid !== drawer) as string
    await assertSucceeds(db(guesser).ref(`${SESSION}/drawGuess/${guesser}`).set({ text: questions[0].word, count: 1, at: SERVER_TIME }))
    session = (await readAsAdmin(SESSION)) as Session
    session = await asHost(drawHintsUpdate(session))
    expect(session.drawHint?.[guesser]).toEqual({ count: 1, verdict: 'found' })
    await step()
    expect(session.reveal?.correctAnswer).toBe(questions[0].word)
    expect(session.drawPoints?.[0]?.[guesser]).toBeGreaterThanOrEqual(400)
    // Classement, puis manche suivante.
    await step()
    expect(session.status).toBe('scores')
    await step()
    expect(session).toMatchObject({ status: 'question', currentIndex: 1 })
    expect(session.drawing).toBeUndefined()
  })
})

describe('Présence de la TV (tvPresence)', () => {
  const TV = 'tv-uid'
  const presence = (uid: string) => `${SESSION}/tvPresence/${uid}`

  test('la TV écrit puis retire son propre nœud ; lecture par les joueurs', async () => {
    await seedSession()
    await assertSucceeds(db(TV).ref(presence(TV)).set(true))
    expect((await db(PLAYER).ref(`${SESSION}/tvPresence`).once('value')).val()).toEqual({ [TV]: true })
    await assertSucceeds(db(TV).ref(presence(TV)).remove())
  })

  test('retrait automatique à la déconnexion (onDisconnect) autorisé', async () => {
    await seedSession()
    await assertSucceeds(db(TV).ref(presence(TV)).onDisconnect().remove())
  })

  test("écriture du nœud d'une autre TV refusée, y compris son retrait", async () => {
    await seedSession({ tvPresence: { [OTHER]: true } })
    await assertFails(db(TV).ref(presence(OTHER)).set(true))
    await assertFails(db(TV).ref(presence(OTHER)).remove())
    await assertFails(db(PLAYER).ref(`${SESSION}/tvPresence`).set({ [PLAYER]: true }))
  })

  test('un joueur inscrit ou l’hôte ne se déclarent pas TV', async () => {
    await seedSession()
    await assertFails(db(PLAYER).ref(presence(PLAYER)).set(true))
    await assertFails(db(HOST).ref(presence(HOST)).set(true))
    await assertFails(db(HOST).ref(presence(TV)).set(false))
    // L'hôte, autorité de la partie, peut écrire tout nœud valide de sa session (comme partout ailleurs).
    await assertSucceeds(db(HOST).ref(presence(TV)).set(true))
  })

  test('valeur autre que true refusée ; non connecté refusé', async () => {
    await seedSession()
    await assertFails(db(TV).ref(presence(TV)).set('oui'))
    await assertFails(db(TV).ref(presence(TV)).set({ since: 1 }))
    await assertFails(db(null).ref(presence(TV)).set(true))
    await assertFails(db(null).ref(`${SESSION}/tvPresence`).once('value'))
  })

  test('pas de présence sur une partie inexistante (la session n’est pas recréée)', async () => {
    await assertFails(db(TV).ref(presence(TV)).set(true))
    expect(await readAsAdmin(SESSION)).toBeNull()
  })

  test('partie supprimée par l’hôte : le retrait tardif de la TV reste accepté', async () => {
    await seedSession({ tvPresence: { [TV]: true } })
    await assertSucceeds(db(HOST).ref(SESSION).remove())
    await assertSucceeds(db(TV).ref(presence(TV)).remove())
    expect(await readAsAdmin(SESSION)).toBeNull()
  })

  test('les champs publics, tvPresence compris, restent lisibles un par un par la TV', async () => {
    await seedSession({ tvPresence: { [TV]: true } })
    expect(PUBLIC_SESSION_FIELDS).toContain('tvPresence')
    for (const field of PUBLIC_SESSION_FIELDS) await assertSucceeds(db(TV).ref(`${SESSION}/${field}`).once('value'))
  })
})
