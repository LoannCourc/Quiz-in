import type { ValidationDecisions } from '@shared/freeAnswers';
import {
  audioUrlUpdate,
  launchUpdate,
  transitionUpdate,
  type AudioUrls,
  type ExpectedPhase,
  type LaunchAudio,
  type LaunchRefusal,
  type SessionUpdate,
} from '@shared/hostEngine';
import { parseQuestions } from '@shared/quizValidation';
import { launchTeamDraw } from '@shared/teams';
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
  audio?: LaunchAudio,
): Promise<LaunchOutcome> {
  // Groupe « Au hasard » sans tirage de l'hôte : équipes tirées d'abord (écrites encore en lobby).
  const draw = launchTeamDraw(session);
  const result = launchUpdate(draw?.session ?? session, questions, nowServer, limit, audio);
  if (!result.ok) return result;
  if (draw) await update(ref(db, `sessions/${code}`), draw.update);
  await update(ref(db, `sessions/${code}`), result.update);
  return { ok: true };
}

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
  audioUrls: AudioUrls = {},
  decisions: ValidationDecisions = {},
): Promise<void> {
  const snapshot = await get(ref(db, `sessions/${code}`));
  if (!snapshot.exists()) return;
  // Forme garantie par les règles de validation ; seul l'hôte lit la session d'un bloc.
  const session = snapshot.val() as Session;
  const changes = transitionUpdate(
    { ...session, players: session.players ?? {} },
    questions,
    expected,
    nowServer,
    audioUrls,
    decisions,
  );
  if (!changes || !canWrite()) return;
  await update(ref(db, `sessions/${code}`), changes);
}

// Blind test : republie l'adresse renouvelée de l'extrait en cours (question, révélation, pause),
// pour que la TV ne tombe jamais sur une adresse expirée, même après une longue pause.
export async function publishAudioUrl(code: string, questions: readonly Question[], audioUrls: AudioUrls): Promise<void> {
  const snapshot = await get(ref(db, `sessions/${code}`));
  if (!snapshot.exists()) return;
  const changes = audioUrlUpdate(snapshot.val() as Session, questions, audioUrls);
  if (changes) await update(ref(db, `sessions/${code}`), changes);
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
