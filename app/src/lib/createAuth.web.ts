import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Version web : getAuth enregistre déjà la session dans le stockage du navigateur.
export function createAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}
