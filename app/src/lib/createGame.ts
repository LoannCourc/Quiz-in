import { AUTH_RETRY_DELAY_MS, CREATE_GAME_TIMEOUT_MS, PLAYERS_SITE_URL, RECEIVER_CODE_PARAM, RECEIVER_SITE_URL } from '@shared/constants';
import { claimRoomCode, createGameFailureOf, createGameReference, withTimeout, type CreateGameFailure, type CreateGameProblem } from '@shared/gameCreation';
import { generateRoomCode } from '@shared/roomCode';
import type { SessionSettings, SoundSettings } from '@shared/types';
import { get, ref, serverTimestamp, set } from 'firebase/database';

import { auth, db, ensureSignedIn } from './firebase';

// Échec de la création, avec sa cause (useStartGame choisit le message) et sa ligne « Réf. » (étape et code
// technique, jamais l'uid ni le code de la partie).
export class CreateGameError extends Error {
  readonly failure: CreateGameFailure;
  readonly reference: string;
  constructor(readonly problem: CreateGameProblem) {
    super(problem.failure);
    this.failure = problem.failure;
    this.reference = createGameReference(problem);
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

// Filet de sécurité d'une écriture refusée alors que le code est libre : jeton rafraîchi, puis court délai pour
// que la connexion à la base reprenne le bon compte.
async function refreshAuth(): Promise<void> {
  const user = auth.currentUser;
  if (user) await withTimeout(user.getIdToken(true), CREATE_GAME_TIMEOUT_MS);
  await new Promise((resolve) => setTimeout(resolve, AUTH_RETRY_DELAY_MS));
}

// Crée la session initiale en LOBBY, avec le son de la TV choisi par l'hôte, et renvoie son code. Chaque accès
// à Firebase a un délai (hors ligne, une écriture ne répond jamais) ; la cause d'un échec est classée par
// claimRoomCode (shared/gameCreation.ts). La référence est écrite dans le journal du téléphone, aussi en release
// (adb logcat -s ReactNativeJS) ; l'erreur complète seulement en développement.
export async function createGame(quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]): Promise<string> {
  const fail = (problem: CreateGameProblem): never => {
    const error = new CreateGameError(problem);
    console.warn(`[create] Partie non créée (${problem.failure}) · Réf. : ${error.reference}`);
    if (__DEV__) console.warn('[create] Détail', problem.cause);
    throw error;
  };
  let hostUid: string;
  try {
    hostUid = (await withTimeout(ensureSignedIn(), CREATE_GAME_TIMEOUT_MS)).uid;
  } catch (error) {
    return fail({ failure: createGameFailureOf(error), stage: 'connexion', cause: error });
  }
  const outcome = await claimRoomCode({
    generateCode: () => generateRoomCode(),
    // On ne peut pas lire sessions/CODE d'un bloc sans en être l'hôte ; hostUid est lisible par tous.
    isCodeTaken: async (code) => (await withTimeout(get(ref(db, `sessions/${code}/hostUid`)), CREATE_GAME_TIMEOUT_MS)).exists(),
    writeGame: (code) => withTimeout(set(ref(db, `sessions/${code}`), sessionWrite(hostUid, quizId, settings, sound, questionRefs)), CREATE_GAME_TIMEOUT_MS),
    refreshAuth,
  });
  return outcome.ok ? outcome.code : fail(outcome);
}

// Adresse à ouvrir sur la TV (ou un navigateur) pour afficher la partie.
export function receiverUrl(code: string): string {
  return `${RECEIVER_SITE_URL}/?${RECEIVER_CODE_PARAM}=${code}`;
}

// Adresse pour rejoindre la partie depuis un téléphone : la même que le QR code de la TV (spec 6.6).
export function joinUrl(code: string): string {
  return `${PLAYERS_SITE_URL}/join/${code}`;
}
