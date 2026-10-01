import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

// Version Android/iOS : la session est enregistrée dans AsyncStorage pour survivre
// au redémarrage de l'app. Metro choisit createAuth.web.ts pour le web.
export function createAuth(app: FirebaseApp): Auth {
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
