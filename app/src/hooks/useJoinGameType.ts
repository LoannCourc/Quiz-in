import { isQuizGameType } from '@shared/quizValidation';
import type { PublicSession } from '@shared/types';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import type { GameType } from '@/constants/strings';
import { db } from '@/lib/firebase';

// Jeu d'une partie, pour la carte de « Rejoindre » (maquette J3). Dessine-moi et Bluff se lisent dans les
// réglages ; un quiz ou un blind test, dans la fiche du quiz (quizzes/{quizId}/gameType, lisible par
// tout utilisateur connecté). Quiz en attendant la fiche, ou si elle est illisible.
export function useJoinGameType(session: Pick<PublicSession, 'quizId' | 'settings'>): GameType {
  const fromSettings = session.settings.answerMode === 'draw' ? 'draw' : session.settings.answerMode === 'bluff' ? 'bluff' : null;
  const [fromQuiz, setFromQuiz] = useState<GameType>('quiz');

  useEffect(() => {
    if (fromSettings !== null) return;
    let isActive = true;
    get(ref(db, `quizzes/${session.quizId}/gameType`))
      .then((snapshot) => {
        const value: unknown = snapshot.val();
        if (isActive && isQuizGameType(value)) setFromQuiz(value);
      })
      .catch((error: unknown) => {
        if (__DEV__) console.warn('[join] Type de jeu illisible', error);
      });
    return () => {
      isActive = false;
    };
  }, [fromSettings, session.quizId]);

  return fromSettings ?? fromQuiz;
}
