import type { PlayerId, PublicSession } from '@shared/types';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { loadChoice, saveChoice } from '@/lib/answerStorage';
import { db } from '@/lib/firebase';
import { IDLE_ANSWER, type AnswerState } from '@/lib/playerGame';
import { submitAnswer } from '@/lib/submitAnswer';

// État local rattaché à une question : il repart de « idle » dès que currentIndex change.
// phaseEndsAt : fin de la phase au moment de l'appui (elle change à la reprise d'une pause).
interface LocalAnswer {
  index: number;
  phaseEndsAt: number;
  state: AnswerState;
}

function currentAnswer(local: LocalAnswer, index: number, phaseEndsAt: number): AnswerState {
  if (local.index !== index) return IDLE_ANSWER;
  // « Trop tard » reçu juste avant une pause : la reprise rouvre la question, on peut répondre.
  const isStaleRefusal = local.state.kind === 'refused' && local.state.reason === 'tooLate' && local.phaseEndsAt !== phaseEndsAt;
  return isStaleRefusal ? IDLE_ANSWER : local.state;
}

// Vrai tant que le téléphone est connecté à Firebase (.info/connected). Supposé vrai au départ :
// la session vient d'être lue, la connexion existe.
function useIsConnected(): boolean {
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => onValue(ref(db, '.info/connected'), (snapshot) => setIsConnected(snapshot.val() === true)), []);
  return isConnected;
}

// Réponse du joueur à la question courante : envoi, refus, et choix retrouvé après rechargement.
export function useAnswer(code: string, uid: PlayerId, session: PublicSession) {
  const [local, setLocal] = useState<LocalAnswer>({ index: -1, phaseEndsAt: 0, state: IDLE_ANSWER });
  const isConnected = useIsConnected();
  // Toujours la question courante lue dans la session publique, jamais une valeur mémorisée.
  const index = session.currentIndex;
  const { phaseEndsAt } = session;
  const answer = currentAnswer(local, index, phaseEndsAt);

  // Après un rechargement : answeredBy dit qu'on a répondu ; on retrouve le choix sur l'appareil.
  const needsStoredChoice = session.answeredBy?.[index]?.[uid] === true && answer.kind === 'idle';
  useEffect(() => {
    if (!needsStoredChoice) return;
    let isActive = true;
    loadChoice(code, index).then((choice) => {
      if (isActive && choice !== null) setLocal({ index, phaseEndsAt, state: { kind: 'sent', choice } });
    });
    return () => {
      isActive = false;
    };
  }, [needsStoredChoice, code, index, phaseEndsAt]);

  function onAnswer(choice: number) {
    if (answer.kind === 'sending' || answer.kind === 'sent') return;
    if (session.status !== 'question') {
      setLocal({ index, phaseEndsAt, state: { kind: 'refused', choice, reason: 'tooLate' } });
      return;
    }
    // Hors connexion, Firebase garderait l'écriture en attente sans fin : on propose de réessayer.
    if (!isConnected) {
      setLocal({ index, phaseEndsAt, state: { kind: 'refused', choice, reason: 'failed' } });
      return;
    }
    setLocal({ index, phaseEndsAt, state: { kind: 'sending', choice } });
    void saveChoice(code, index, choice);
    submitAnswer(code, uid, index, choice).then((outcome) =>
      setLocal({
        index,
        phaseEndsAt,
        state: outcome === 'sent' ? { kind: 'sent', choice } : { kind: 'refused', choice, reason: outcome },
      }),
    );
  }

  return { answer, onAnswer };
}
