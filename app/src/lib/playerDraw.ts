import type { DrawHint } from '@shared/types';
import { ref, serverTimestamp, set } from 'firebase/database';

import { db } from '@/lib/firebase';

// Devineur : où en est le joueur dans la manche en cours.
export interface DrawGuessState {
  // Dernier verdict de l'hôte (count : numéro de l'essai jugé) ; null avant le premier.
  hint: DrawHint | null;
  // Essais déjà envoyés (au moins le numéro du dernier jugé, après un rechargement de la page).
  used: number;
  // Dernier mot envoyé depuis cet écran (null après un rechargement).
  lastText: string | null;
  // Envoyé, pas encore jugé.
  isPending: boolean;
  // Heure locale à partir de laquelle un nouvel essai est accepté (1,5 s entre deux).
  nextAllowedAt: number;
  // Dernier envoi refusé par la base (manche finie, réseau).
  hasFailed: boolean;
  // Trouvé (verdict de l'hôte, ou drawFound public).
  isFound: boolean;
}

// Dessine-moi, côté joueur : ce que le téléphone sait de la manche en cours, et ce qu'il envoie.
export interface PlayerDraw {
  // Mot de la manche : seulement pour le dessinateur (null tant qu'il n'est pas lu, ou pour les autres).
  word: string | null;
  // Envoi d'un paquet du dessin (clé = son numéro). Les règles le refusent hors de la manche du joueur.
  onChunk: (chunk: { seq: number; data: string }) => void;
  // Dessinateur : « Changer de mot », une fois, avant son premier trait.
  canChangeWord: boolean;
  onChangeWord: () => void;
  guess: DrawGuessState;
  onGuess: (text: string) => void;
}

export function writeDrawingChunk(code: string, seq: number, data: string): void {
  set(ref(db, `sessions/${code}/drawing/${seq}`), data).catch((error: unknown) => {
    // Paquet refusé (manche finie entre-temps) : rien à faire, la TV n'en a plus besoin.
    if (__DEV__) console.warn('[dessin] Paquet refusé', seq, error);
  });
}

// Essai numéroté, à l'heure du serveur : les règles vérifient le numéro et l'écart de 1,5 s.
export function writeDrawGuess(code: string, uid: string, text: string, count: number): Promise<void> {
  return set(ref(db, `sessions/${code}/drawGuess/${uid}`), { text, count, at: serverTimestamp() });
}

// Demande du dessinateur ; l'hôte choisit le nouveau mot et efface la demande.
export function requestWordChange(code: string): Promise<void> {
  return set(ref(db, `sessions/${code}/drawWordChange`), true);
}
