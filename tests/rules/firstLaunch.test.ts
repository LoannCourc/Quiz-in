// Première création de partie après une installation vierge (émulateurs Auth et Database, SDK modulaire de l'app).
// Au premier lancement, plusieurs écrans demandent la connexion anonyme en même temps (accueil : interrupteurs
// config/…, catalogue). Avec une connexion par appelant, plusieurs comptes étaient créés et la base pouvait rester
// authentifiée avec l'un d'eux pendant que l'app écrivait la partie au nom d'un autre : PERMISSION_DENIED.
// shared/signIn.ts partage une seule connexion. Base : espace de noms par défaut de l'émulateur, où
// database.rules.json s'applique (tests/rules/rules.test.ts utilise un autre espace de noms).
//
// Rapide par défaut (5 installations). Mesure avant/après sur 30 installations :
//   FIRST_LAUNCH_RUNS=30 FIRST_LAUNCH_COMPARE=1 npm test
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, inMemoryPersistence, initializeAuth, onIdTokenChanged, signInAnonymously, type User } from 'firebase/auth'
import { connectDatabaseEmulator, get, getDatabase, onValue, ref, serverTimestamp, set } from 'firebase/database'
import { afterAll, describe, expect, test } from 'vitest'

import { DEFAULT_SESSION_SETTINGS } from '../../shared/constants'
import { createEnsureSignedIn } from '../../shared/signIn'
import { DEFAULT_SOUND_SETTINGS } from '../../shared/sound'

const PROJECT = 'demo-quiz-in'
const RUNS = Number(process.env.FIRST_LAUNCH_RUNS) || 5
const COMPARE = process.env.FIRST_LAUNCH_COMPARE === '1'
// Écrans de l'accueil et du catalogue qui demandent la connexion à l'ouverture.
const STARTUP_READS = ['config/blindTestEnabled', 'config/drawEnabled', 'quizzes']
// Temps laissé à l'utilisateur pour choisir un quiz avant « Choisir ce quiz ».
const BROWSE_MS = 2000

const apps: FirebaseApp[] = []
afterAll(async () => {
  for (const app of apps) await deleteApp(app)
})

type Mode = 'shared' | 'perCaller'

// Une installation neuve : app Firebase à part, aucune session enregistrée, connexion anonyme comme l'app
// (shared/signIn.ts) ou comme avant le correctif (une connexion par appelant).
function freshInstall(name: string, mode: Mode) {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, databaseURL: `http://127.0.0.1:9000?ns=${PROJECT}-default-rtdb` }, name)
  apps.push(app)
  const auth = initializeAuth(app, { persistence: inMemoryPersistence })
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  const db = getDatabase(app)
  connectDatabaseEmulator(db, '127.0.0.1', 9000)
  const accounts = new Set<string>()
  onIdTokenChanged(auth, (user) => {
    if (user) accounts.add(user.uid)
  })
  const ensureSignedIn: () => Promise<User> =
    mode === 'shared'
      ? createEnsureSignedIn({ ready: () => auth.authStateReady(), current: () => auth.currentUser, signIn: async () => (await signInAnonymously(auth)).user })
      : async () => {
          await auth.authStateReady()
          return auth.currentUser ?? (await signInAnonymously(auth)).user
        }
  return { db, accounts, ensureSignedIn }
}

// Même lecture et même écriture que createGame (app/src/lib/createGame.ts), sans filet de sécurité.
async function firstCreation(install: ReturnType<typeof freshInstall>, code: string): Promise<boolean> {
  for (const path of STARTUP_READS) {
    void install.ensureSignedIn().then(() => onValue(ref(install.db, path), () => undefined, () => undefined))
  }
  await new Promise((resolve) => setTimeout(resolve, BROWSE_MS))
  const hostUid = (await install.ensureSignedIn()).uid
  if ((await get(ref(install.db, `sessions/${code}/hostUid`))).exists()) throw new Error(`code ${code} déjà pris`)
  try {
    await set(ref(install.db, `sessions/${code}`), {
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
    return true
  } catch {
    return false
  }
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const codeFor = (prefix: string, run: number) => `${prefix}${ALPHABET[Math.floor(run / ALPHABET.length)]}${ALPHABET[run % ALPHABET.length]}`

// Toutes les installations en même temps : RUNS installations durent environ BROWSE_MS.
async function measure(mode: Mode, prefix: string) {
  const runs = await Promise.all(
    Array.from({ length: RUNS }, async (_, run) => {
      const install = freshInstall(`${mode}-${run}`, mode)
      const created = await firstCreation(install, codeFor(prefix, run))
      return { created, accounts: install.accounts.size }
    }),
  )
  return { created: runs.filter((run) => run.created).length, maxAccounts: Math.max(...runs.map((run) => run.accounts)) }
}

describe('Première création de partie avec un nouvel utilisateur anonyme', () => {
  test(`connexion partagée (shared/signIn.ts) : ${RUNS} installations neuves, ${RUNS} créations, un seul compte chacune`, { timeout: 120_000 }, async () => {
    const result = await measure('shared', 'WX')
    console.log(`[firstLaunch] avec correctif : ${result.created}/${RUNS} créations, ${result.maxAccounts} compte(s) au plus par installation`)
    expect(result).toEqual({ created: RUNS, maxAccounts: 1 })
  })

  test.runIf(COMPARE)('mesure sans correctif (une connexion par appelant) : plusieurs comptes, échecs comptés', { timeout: 120_000 }, async () => {
    const result = await measure('perCaller', 'YZ')
    console.log(`[firstLaunch] sans correctif : ${result.created}/${RUNS} créations, ${result.maxAccounts} compte(s) au plus par installation`)
    expect(result.maxAccounts).toBeGreaterThan(1)
  })
})
