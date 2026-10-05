import { cleanBluffText } from '@shared/bluff';
import type { BluffCheck, BluffEntry, PlayerId } from '@shared/types';
import { get, ref, serverTimestamp, set, update } from 'firebase/database';

import { isPermissionDenied } from './errors';
import { db } from './firebase';
import type { AnswerRefusal } from './playerGame';

// Bluff (spec 16), côté joueur : écrire sa fausse réponse, puis voter. La vérification de la
// proposition est faite par l'hôte (le téléphone ne connaît jamais la vraie réponse).

// Envoi de la proposition : l'écriture elle-même (le verdict arrive ensuite dans bluffChecks).
export type BluffSendState = { kind: 'idle' } | { kind: 'sending'; text: string } | { kind: 'failed'; text: string };

// Vote : choice est l'index du choix ; null après un rechargement (votedBy dit qu'on a voté, pas pour quoi).
export type BluffVoteState =
  | { kind: 'idle' }
  | { kind: 'sending'; choice: number }
  | { kind: 'sent'; choice: number | null }
  | { kind: 'refused'; choice: number; reason: AnswerRefusal };

// Tout ce que l'écran du joueur sait de son Bluff à la question en cours.
export interface PlayerBluff {
  entry: BluffEntry | null;
  check: BluffCheck | null;
  // Index de sa propre proposition parmi les choix du vote (grisée), null s'il n'en a pas.
  ownChoice: number | null;
  send: BluffSendState;
  vote: BluffVoteState;
  onSubmit: (text: string) => void;
  onVote: (choice: number) => void;
}

export type SubmitOutcome = 'sent' | 'tooLate' | 'failed';

// Proposition : réécrite après un refus, tant qu'il reste des essais (les règles le vérifient).
export async function submitBluff(code: string, uid: PlayerId, index: number, text: string): Promise<SubmitOutcome> {
  try {
    await set(ref(db, `sessions/${code}/bluffs/${index}/${uid}`), { text: cleanBluffText(text), submittedAt: serverTimestamp() });
    return 'sent';
  } catch (error) {
    return isPermissionDenied(error) ? 'tooLate' : 'failed';
  }
}

// Vote et votedBy en une seule écriture (les règles exigent les deux) ; refusé pour sa propre
// proposition, hors du vote, ou s'il a déjà voté (votedBy fait alors foi).
export async function submitVote(code: string, uid: PlayerId, index: number, choice: number): Promise<SubmitOutcome> {
  try {
    await update(ref(db, `sessions/${code}`), {
      [`votes/${index}/${uid}`]: { value: choice, submittedAt: serverTimestamp() },
      [`votedBy/${index}/${uid}`]: true,
    });
    return 'sent';
  } catch (error) {
    if (!isPermissionDenied(error)) return 'failed';
    try {
      const voted = await get(ref(db, `sessions/${code}/votedBy/${index}/${uid}`));
      return voted.val() === true ? 'sent' : 'tooLate';
    } catch {
      return 'tooLate';
    }
  }
}
