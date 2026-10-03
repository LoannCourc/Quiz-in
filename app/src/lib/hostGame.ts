import {
  launchUpdate,
  transitionUpdate,
  type ExpectedPhase,
  type LaunchRefusal,
  type SessionUpdate,
} from '@shared/hostEngine';
import { parseQuestions } from '@shared/quizValidation';
import type { Question, Session } from '@shared/types';
import { get, ref, remove, update } from 'firebase/database';

import { warnIgnoredEntries } from './devLog';
import { db } from './firebase';

// Écritures de l'hôte pendant la partie. La logique (quoi écrire) est dans shared/hostEngine.ts ;
// ici, seulement la lecture et l'écriture dans Firebase.

// Questions du quiz, validées (les entrées mal formées sont ignorées). Lues par l'hôte seul.
export async function loadQuizQuestions(quizId: string): Promise<Question[]> {
  const snapshot = await get(ref(db, `questions/${quizId}`));
  const { valid, ignoredCount } = parseQuestions(snapshot.val());
  warnIgnoredEntries('Questions du quiz', ignoredCount);
  return valid;
}

export type LaunchOutcome = { ok: true } | { ok: false; reason: LaunchRefusal };

// Lancement : un seul update() (LOBBY → STARTING), ou la raison du refus.
export async function launchGame(
  code: string,
  session: Session,
  questions: readonly Question[],
  nowServer: number,
  limit?: number,
): Promise<LaunchOutcome> {
  const result = launchUpdate(session, questions, nowServer, limit);
  if (!result.ok) return result;
  await update(ref(db, `sessions/${code}`), result.update);
  return { ok: true };
}

// toStatus : état atteint quand la transition a été écrite.
export type TransitionOutcome =
  | { result: 'applied'; toStatus: string }
  | { result: 'ignored' | 'missing' };

// Transition : on relit la session (pas l'instantané du rendu), on calcule l'update depuis
// l'état attendu, puis un seul update() multi-chemins. null → transition déjà faite : ignorée.
// canWrite est revérifié juste avant l'écriture : hors ligne, update() serait mis en file
// d'attente et partirait en retard au retour du réseau.
export async function runTransition(
  code: string,
  questions: readonly Question[],
  expected: ExpectedPhase,
  nowServer: number,
  canWrite: () => boolean,
): Promise<TransitionOutcome> {
  const snapshot = await get(ref(db, `sessions/${code}`));
  if (!snapshot.exists()) return { result: 'missing' };
  // Forme garantie par les règles de validation ; seul l'hôte lit la session d'un bloc.
  const session = snapshot.val() as Session;
  const changes = transitionUpdate({ ...session, players: session.players ?? {} }, questions, expected, nowServer);
  if (!changes || !canWrite()) return { result: 'ignored' };
  await update(ref(db, `sessions/${code}`), changes);
  return { result: 'applied', toStatus: String(changes.status) };
}

// Action ponctuelle de l'hôte (Pause, Reprise, Terminer, Rejouer) : on relit la session, on
// calcule l'update avec la fonction pure de shared/hostEngine.ts, puis un seul update().
// Faux si l'action n'a plus de sens (session absente ou déjà dans un autre état).
export async function applyHostAction(
  code: string,
  buildUpdate: (session: Session, nowServer: number) => SessionUpdate | null,
  nowServer: number,
): Promise<boolean> {
  const snapshot = await get(ref(db, `sessions/${code}`));
  if (!snapshot.exists()) return false;
  // Forme garantie par les règles de validation ; seul l'hôte lit la session d'un bloc.
  const session = snapshot.val() as Session;
  const changes = buildUpdate({ ...session, players: session.players ?? {} }, nowServer);
  if (!changes) return false;
  await update(ref(db, `sessions/${code}`), changes);
  return true;
}

// Quitter : suppression de toute la partie (réponses comprises). Joueurs et TV affichent alors
// « La partie est terminée. Merci d'avoir joué ! ».
export async function deleteGame(code: string): Promise<void> {
  await remove(ref(db, `sessions/${code}`));
}
