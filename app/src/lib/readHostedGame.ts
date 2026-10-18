import type { ResumeRead } from '@shared/hostEngine';
import type { GameStatus } from '@shared/types';
import { get, ref } from 'firebase/database';

import { db } from './firebase';

// Lecture de la partie : au-delà, elle compte comme échouée (doute, nouvel essai).
export const READ_TIMEOUT_MS = 8_000;

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Délai dépassé')), ms))]);
}

// Partie gardée sur ce téléphone (« Reprendre la partie », écran de l'hôte qui ne peut pas la lire).
// Champs publics seulement : hostUid, status et hostLeftAt. Toute erreur (refus au relancement, avant que la
// connexion porte l'authentification ; réseau ; délai) donne « failed », jamais « missing ».
export async function readHostedGame(code: string): Promise<ResumeRead> {
  try {
    const [hostUid, status, hostLeftAt] = await withTimeout(
      Promise.all([
        get(ref(db, `sessions/${code}/hostUid`)),
        get(ref(db, `sessions/${code}/status`)),
        get(ref(db, `sessions/${code}/hostLeftAt`)),
      ]),
      READ_TIMEOUT_MS,
    );
    if (!hostUid.exists()) return { kind: 'missing' };
    return {
      kind: 'found',
      game: {
        hostUid: hostUid.val() as string,
        status: status.val() as GameStatus,
        hostLeftAt: typeof hostLeftAt.val() === 'number' ? (hostLeftAt.val() as number) : undefined,
      },
    };
  } catch (error) {
    console.warn('[resume] Lecture de la partie à reprendre impossible : nouvel essai', error);
    return { kind: 'failed' };
  }
}
