import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

// Vrai si l'hôte a exclu ce joueur de la partie (sessions/{code}/banned/{uid}, lisible par lui seul).
// uid null (session pas encore lue) : faux. Lecture refusée ou impossible : faux (les règles empêchent de
// toute façon un joueur exclu de revenir).
export function useIsRemoved(code: string, uid: string | null): boolean {
  const [removed, setRemoved] = useState<{ key: string; value: boolean } | null>(null);
  const key = uid ? `${code}/${uid}` : '';

  useEffect(() => {
    if (!uid) return;
    return onValue(
      ref(db, `sessions/${code}/banned/${uid}`),
      (snapshot) => setRemoved({ key: `${code}/${uid}`, value: snapshot.val() === true }),
      (error) => {
        if (__DEV__) console.warn('[rejoindre] Exclusion illisible', error);
      },
    );
  }, [code, uid]);

  return removed !== null && removed.key === key && removed.value;
}
