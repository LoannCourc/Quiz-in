// Premier chargement d'un joueur (QR code scanné, navigateur vierge) : connexion anonyme, puis lecture aussitôt de tous
// les champs publics, comme usePlayerSession (émulateurs Auth et Database, SDK modulaire de l'app). Mesure : une lecture
// part-elle avant que la base ait reçu le jeton, donc refusée, alors que la partie existe ?
//   FIRST_JOIN_RUNS=100 npm test -- firstJoin
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, inMemoryPersistence, initializeAuth, signInAnonymously } from 'firebase/auth'
import { connectDatabaseEmulator, getDatabase, onValue, ref, serverTimestamp, set } from 'firebase/database'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import { PUBLIC_SESSION_FIELDS } from '../../shared/publicFields'
import { DEFAULT_SOUND_SETTINGS } from '../../shared/sound'

const PROJECT = 'demo-quiz-in'
const RUNS = Number(process.env.FIRST_JOIN_RUNS) || 5
const CODE = 'QRJN'
const apps: FirebaseApp[] = []

function install(name: string) {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, databaseURL: `http://127.0.0.1:9000?ns=${PROJECT}-default-rtdb` }, name)
  apps.push(app)
  const auth = initializeAuth(app, { persistence: inMemoryPersistence })
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  const db = getDatabase(app)
  connectDatabaseEmulator(db, '127.0.0.1', 9000)
  return { auth, db }
}

// Toutes les lectures ouvertes juste après la connexion : refusées (noms des champs) ou non.
async function firstLoad(name: string, warmConnection: boolean): Promise<string[]> {
  const { auth, db } = install(name)
  // Connexion à la base déjà ouverte avant la connexion anonyme, comme une lecture lancée par un autre écran.
  if (warmConnection) onValue(ref(db, '.info/connected'), () => undefined)
  await auth.authStateReady()
  await signInAnonymously(auth)
  const refused = await Promise.all(
    PUBLIC_SESSION_FIELDS.map(
      (field) =>
        new Promise<string | null>((resolve) => {
          onValue(
            ref(db, `sessions/${CODE}/${field}`),
            () => resolve(null),
            () => resolve(field),
          )
        }),
    ),
  )
  return refused.filter((field): field is string => field !== null)
}

beforeAll(async () => {
  const { auth, db } = install('host')
  const hostUid = (await signInAnonymously(auth)).user.uid
  await set(ref(db, `sessions/${CODE}`), {
    hostUid,
    quizId: 'quiz-1',
    status: 'lobby',
    settings: DEFAULT_SESSION_SETTINGS,
    sound: DEFAULT_SOUND_SETTINGS,
    currentIndex: 0,
    phaseStartedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    phaseEndsAt: 0,
  })
})

afterAll(async () => {
  for (const app of apps) await deleteApp(app)
})

describe('Premier chargement d’un joueur : lecture juste après la connexion anonyme', () => {
  test.each([
    ['connexion à la base ouverte après', false],
    ['connexion à la base déjà ouverte', true],
  ])(`%s : ${RUNS} navigateurs vierges, aucune lecture refusée`, { timeout: 120_000 }, async (label, warm) => {
    const runs = await Promise.all(Array.from({ length: RUNS }, (_, run) => firstLoad(`${warm ? 'warm' : 'cold'}-${run}`, warm)))
    const failed = runs.filter((refused) => refused.length > 0)
    console.log(`[firstJoin] ${label} : ${failed.length}/${RUNS} premiers chargements avec une lecture refusée`, failed[0] ?? '')
    expect(failed).toEqual([])
  })
})
