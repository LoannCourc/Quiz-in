import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

import { createAuth } from './createAuth';
import { traceJoin } from './devLog';

// Expo n'injecte une variable EXPO_PUBLIC_* que si elle est lue en toutes lettres
// (pas de déstructuration de process.env).
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigComplete(config: FirebaseOptions): void {
  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingKeys.length > 0) {
    throw new Error(`Configuration Firebase incomplète dans app/.env : ${missingKeys.join(', ')}`);
  }
}

assertConfigComplete(firebaseConfig);

// Au rechargement à chaud, ce module peut être réexécuté : on réutilise alors l'app
// et l'auth existantes, car Firebase refuse une seconde initialisation.
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

export const auth = isFirstInit ? createAuth(app) : getAuth(app);
export const db = getDatabase(app);

// Attend la restauration d'une éventuelle session enregistrée, sinon en crée une anonyme.
export async function ensureSignedIn(): Promise<User> {
  await auth.authStateReady();
  if (auth.currentUser) {
    traceJoin('session anonyme restaurée');
    return auth.currentUser;
  }
  traceJoin('aucune session enregistrée : création d’un utilisateur anonyme');
  const credential = await signInAnonymously(auth);
  return credential.user;
}
