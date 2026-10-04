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
  type SessionUpdate,
} from '../../shared/hostEngine'
import { HOST_DISCONNECT_TIMEOUT_S } from '../../shared/constants'
import { hostReturnUpdate } from '../../shared/hostAbsence'
import type { GameStatus, Session } from '../../shared/types'
import { makeSession, QUESTIONS } from '../unit/engineFixtures'

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
    expect((await read()).status).toBe('scores')
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

  test('partie complète : lancement, questions, réponses, révélations, classements, fin', async () => {
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

      session = await advance(session, 'reveal')
      expect(session.status).toBe('scores')
    }

    session = await advance(session, 'scores')
    expect(session).toMatchObject({ status: 'ended' })
    expect(session.currentQuestion).toBeUndefined()
    expect(session.reveal).toBeUndefined()
  })

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
