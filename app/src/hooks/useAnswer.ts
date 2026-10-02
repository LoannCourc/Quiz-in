import type { PlayerId, PublicSession } from '@shared/types';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { loadChoice, saveChoice } from '@/lib/answerStorage';
import { db } from '@/lib/firebase';
import { IDLE_ANSWER, type AnswerState } from '@/lib/playerGame';
import { submitAnswer } from '@/lib/submitAnswer';

// État local rattaché à une question : il repart de « idle » dès que currentIndex change.
interface LocalAnswer {
  index: number;
  state: AnswerState;
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
  const [local, setLocal] = useState<LocalAnswer>({ index: -1, state: IDLE_ANSWER });
  const isConnected = useIsConnected();
  // Toujours la question courante lue dans la session publique, jamais une valeur mémorisée.
  const index = session.currentIndex;
  const answer = local.index === index ? local.state : IDLE_ANSWER;

  // Après un rechargement : answeredBy dit qu'on a répondu ; on retrouve le choix sur l'appareil.
  const needsStoredChoice = session.answeredBy?.[index]?.[uid] === true && answer.kind === 'idle';
  useEffect(() => {
    if (!needsStoredChoice) return;
    let isActive = true;
    loadChoice(code, index).then((choice) => {
      if (isActive && choice !== null) setLocal({ index, state: { kind: 'sent', choice } });
    });
    return () => {
      isActive = false;
    };
  }, [needsStoredChoice, code, index]);

  function onAnswer(choice: number) {
    if (answer.kind === 'sending' || answer.kind === 'sent') return;
    if (session.status !== 'question') {
      setLocal({ index, state: { kind: 'refused', choice, reason: 'tooLate' } });
      return;
    }
    // Hors connexion, Firebase garderait l'écriture en attente sans fin : on propose de réessayer.
    if (!isConnected) {
      setLocal({ index, state: { kind: 'refused', choice, reason: 'failed' } });
      return;
    }
    setLocal({ index, state: { kind: 'sending', choice } });
    void saveChoice(code, index, choice);
    submitAnswer(code, uid, index, choice).then((outcome) =>
      setLocal({
        index,
        state: outcome === 'sent' ? { kind: 'sent', choice } : { kind: 'refused', choice, reason: outcome },
      }),
    );
  }

  return { answer, onAnswer };
}
