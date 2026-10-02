import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

// Décalage (ms) entre l'horloge du téléphone et celle du serveur Firebase : heure du serveur
// estimée = Date.now() + décalage. Les chronos se calculent ainsi sur l'heure du serveur.
export function useServerTimeOffset(): number {
  const [offsetMs, setOffsetMs] = useState(0);

  useEffect(
    () => onValue(ref(db, '.info/serverTimeOffset'), (snapshot) => setOffsetMs(snapshot.val() ?? 0)),
    [],
  );

  return offsetMs;
}
