import { CREATE_GAME_TIMEOUT_MS, PLAYERS_SITE_URL, RECEIVER_CODE_PARAM, RECEIVER_SITE_URL } from '@shared/constants';
import { claimRoomCode, createGameFailureOf, withTimeout, type CreateGameFailure } from '@shared/gameCreation';
import { generateRoomCode } from '@shared/roomCode';
import type { SessionSettings, SoundSettings } from '@shared/types';
import { get, ref, serverTimestamp, set } from 'firebase/database';

import { db, ensureSignedIn } from './firebase';

// Échec de la création, avec sa cause (useStartGame choisit le message).
export class CreateGameError extends Error {
  constructor(
    readonly failure: CreateGameFailure,
    readonly cause?: unknown,
  ) {
    super(failure);
  }
}

function sessionWrite(hostUid: string, quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]) {
  return {
    hostUid,
    quizId,
    status: 'lobby',
    settings,
    sound,
    currentIndex: 0,
    phaseStartedAt: serverTimestamp(),
    // Date de création, pour le nettoyage des parties de plus de 24 h (scripts/cleanup-sessions.mjs).
    createdAt: serverTimestamp(),
    // Le lobby n'a pas de fin automatique.
    phaseEndsAt: 0,
    // Thèmes du Quiz : questions déjà tirées sur la fiche (sinon, tirage au salon).
    ...(questionRefs && { questionRefs: [...questionRefs] }),
  };
}

// Crée la session initiale en LOBBY, avec le son de la TV choisi par l'hôte, et renvoie son code. Chaque accès
// à Firebase a un délai (hors ligne, une écriture ne répond jamais) ; la cause d'un échec est classée par
// claimRoomCode (shared/gameCreation.ts), l'erreur réelle notée dans la console en développement.
export async function createGame(quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]): Promise<string> {
  const fail = (failure: CreateGameFailure, cause: unknown): never => {
    if (__DEV__) console.warn(`[create] Partie non créée (${failure})`, cause);
    throw new CreateGameError(failure, cause);
  };
  let hostUid: string;
  try {
    hostUid = (await withTimeout(ensureSignedIn(), CREATE_GAME_TIMEOUT_MS)).uid;
  } catch (error) {
    return fail(createGameFailureOf(error), error);
  }
  const outcome = await claimRoomCode({
    generateCode: () => generateRoomCode(),
    // On ne peut pas lire sessions/CODE d'un bloc sans en être l'hôte ; hostUid est lisible par tous.
    isCodeTaken: async (code) => (await withTimeout(get(ref(db, `sessions/${code}/hostUid`)), CREATE_GAME_TIMEOUT_MS)).exists(),
    writeGame: (code) => withTimeout(set(ref(db, `sessions/${code}`), sessionWrite(hostUid, quizId, settings, sound, questionRefs)), CREATE_GAME_TIMEOUT_MS),
  });
  return outcome.ok ? outcome.code : fail(outcome.failure, outcome.cause);
}

// Adresse à ouvrir sur la TV (ou un navigateur) pour afficher la partie.
export function receiverUrl(code: string): string {
  return `${RECEIVER_SITE_URL}/?${RECEIVER_CODE_PARAM}=${code}`;
}

// Adresse pour rejoindre la partie depuis un téléphone : la même que le QR code de la TV (spec 6.6).
export function joinUrl(code: string): string {
  return `${PLAYERS_SITE_URL}/join/${code}`;
}
