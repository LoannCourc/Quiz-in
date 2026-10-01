import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export class MissingConfigError extends Error {}

interface FirebaseServices {
  auth: Auth
  db: Database
}

let services: FirebaseServices | null = null

// Initialisation à la première utilisation seulement : le mode démo fonctionne sans .env.
export function getFirebase(): FirebaseServices {
  if (services) return services

  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missingKeys.length > 0) {
    throw new MissingConfigError(`Configuration Firebase incomplète dans receiver/.env : ${missingKeys.join(', ')}`)
  }

  const app = initializeApp(firebaseConfig)
  // Sur le web, getAuth conserve la session anonyme dans le navigateur.
  services = { auth: getAuth(app), db: getDatabase(app) }
  return services
}

export async function ensureSignedIn(): Promise<void> {
  const { auth } = getFirebase()
  await auth.authStateReady()
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
}
