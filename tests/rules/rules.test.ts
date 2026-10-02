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
