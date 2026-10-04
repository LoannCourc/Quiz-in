import {
  PLAYERS_SITE_URL,
  RECEIVER_CODE_PARAM,
  RECEIVER_SITE_URL,
  ROOM_CODE_MAX_ATTEMPTS,
} from '@shared/constants';
import { generateRoomCode } from '@shared/roomCode';
import type { SessionSettings } from '@shared/types';
import { get, ref, serverTimestamp, set } from 'firebase/database';

import { isPermissionDenied } from './errors';
import { db, ensureSignedIn } from './firebase';

export class NoFreeRoomCodeError extends Error {}

// Tente d'occuper un code. Faux s'il est déjà pris (par n'importe quel hôte).
async function tryClaimCode(code: string, hostUid: string, quizId: string, settings: SessionSettings) {
  // On ne peut pas lire sessions/CODE d'un bloc sans en être l'hôte ; hostUid est lisible par tous.
  const existingHost = await get(ref(db, `sessions/${code}/hostUid`));
  if (existingHost.exists()) return false;
  try {
    await set(ref(db, `sessions/${code}`), {
      hostUid,
      quizId,
      status: 'lobby',
      settings,
      currentIndex: 0,
      phaseStartedAt: serverTimestamp(),
      // Le lobby n'a pas de fin automatique.
      phaseEndsAt: 0,
    });
    return true;
  } catch (error) {
    // Un autre hôte a pris le code entre la lecture et l'écriture : les règles refusent.
    if (isPermissionDenied(error)) return false;
    throw error;
  }
}

// Crée la session initiale en LOBBY et renvoie son code (au plus ROOM_CODE_MAX_ATTEMPTS tirages).
export async function createGame(quizId: string, settings: SessionSettings): Promise<string> {
  const user = await ensureSignedIn();
  for (let attempt = 0; attempt < ROOM_CODE_MAX_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    if (await tryClaimCode(code, user.uid, quizId, settings)) return code;
  }
  throw new NoFreeRoomCodeError();
}

// Adresse à ouvrir sur la TV (ou un navigateur) pour afficher la partie.
export function receiverUrl(code: string): string {
  return `${RECEIVER_SITE_URL}/?${RECEIVER_CODE_PARAM}=${code}`;
}

// Adresse pour rejoindre la partie depuis un téléphone : la même que le QR code de la TV (spec 6.6).
export function joinUrl(code: string): string {
  return `${PLAYERS_SITE_URL}/join/${code}`;
}
