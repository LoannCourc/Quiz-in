import { ref, set } from 'firebase/database';

import { db } from '@/lib/firebase';

// Dessine-moi, côté joueur : ce que le téléphone sait de la manche en cours, et l'envoi du dessin.
export interface PlayerDraw {
  // Mot de la manche : seulement pour le dessinateur (null tant qu'il n'est pas lu, ou pour les autres).
  word: string | null;
  // Envoi d'un paquet du dessin (clé = son numéro). Les règles le refusent hors de la manche du joueur.
  onChunk: (chunk: { seq: number; data: string }) => void;
}

export function writeDrawingChunk(code: string, seq: number, data: string): void {
  set(ref(db, `sessions/${code}/drawing/${seq}`), data).catch((error: unknown) => {
    // Paquet refusé (manche finie entre-temps) : rien à faire, la TV n'en a plus besoin.
    if (__DEV__) console.warn('[dessin] Paquet refusé', seq, error);
  });
}
