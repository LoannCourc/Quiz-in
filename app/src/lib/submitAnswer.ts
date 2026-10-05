import type { PlayerId } from '@shared/types';
import { get, ref, serverTimestamp, update } from 'firebase/database';

import { isPermissionDenied } from './errors';
import { db } from './firebase';
import { isFreeText, type GivenAnswer } from './playerGame';

// sent : réponse enregistrée (par cet appui ou un précédent) ; tooLate : refusée par les règles
// (temps écoulé, état qui n'est plus QUESTION) ; failed : erreur réseau, on peut réessayer.
export type SubmitOutcome = 'sent' | 'tooLate' | 'failed';

async function hasAnswered(code: string, uid: PlayerId, index: number): Promise<boolean> {
  try {
    const snapshot = await get(ref(db, `sessions/${code}/answeredBy/${index}/${uid}`));
    return snapshot.val() === true;
  } catch (error) {
    console.warn('[answer] Relecture de answeredBy impossible', error);
    return false;
  }
}

// Contenu écrit dans answers : index de la proposition, ou texte saisi (titre et artiste séparés
// pour un blind test « both » ; un champ vide n'est pas écrit).
function answerFields(given: GivenAnswer): { value: number | string; artist?: string } {
  if (!isFreeText(given)) return { value: given };
  const artist = given.artist?.trim();
  return artist ? { value: given.value.trim(), artist } : { value: given.value.trim() };
}

// Une seule écriture multi-chemins : la réponse et answeredBy sont acceptés ou refusés ensemble
// (les règles exigent les deux). submittedAt est l'heure du serveur, jamais celle du téléphone.
export async function submitAnswer(code: string, uid: PlayerId, index: number, given: GivenAnswer): Promise<SubmitOutcome> {
  try {
    await update(ref(db, `sessions/${code}`), {
      [`answers/${index}/${uid}`]: { ...answerFields(given), submittedAt: serverTimestamp() },
      [`answeredBy/${index}/${uid}`]: true,
    });
    return 'sent';
  } catch (error) {
    if (!isPermissionDenied(error)) return 'failed';
    // Refus des règles : une réponse existe déjà (autre onglet, double envoi), ou il est trop tard.
    // answeredBy fait foi : sans lui, c'est un refus, jamais un succès.
    return (await hasAnswered(code, uid, index)) ? 'sent' : 'tooLate';
  }
}
