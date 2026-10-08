import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { loadPlayedQuizzes } from '@/lib/playedQuizzes';

// Quiz déjà faits sur ce téléphone, relus chaque fois que l'écran revient au premier plan (retour d'une
// partie vers le catalogue).
export function usePlayedQuizzes(): ReadonlySet<string> {
  const [played, setPlayed] = useState<ReadonlySet<string>>(() => new Set());
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadPlayedQuizzes().then((loaded) => {
        if (isActive) setPlayed(loaded);
      });
      return () => {
        isActive = false;
      };
    }, []),
  );
  return played;
}
