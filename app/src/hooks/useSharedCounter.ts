import { increment, onValue, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { db, ensureSignedIn } from '@/lib/firebase';

const COUNTER_PATH = 'debug/counter';

// Compteur de test partagé entre tous les appareils, mis à jour en temps réel.
export function useSharedCounter() {
  const [value, setValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const counterRef = ref(db, COUNTER_PATH);
    let unsubscribe = () => {};
    let isMounted = true;

    ensureSignedIn()
      .then(() => {
        if (!isMounted) return;
        unsubscribe = onValue(
          counterRef,
          (snapshot) => setValue(snapshot.val() ?? 0),
          (listenError) => setError(toErrorMessage(listenError)),
        );
      })
      .catch((signInError: unknown) => setError(toErrorMessage(signInError)));

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  function incrementCounter() {
    // increment() est appliqué par le serveur : deux appuis simultanés comptent bien pour 2.
    set(ref(db, COUNTER_PATH), increment(1)).catch((writeError: unknown) =>
      setError(toErrorMessage(writeError)),
    );
  }

  return { value, error, incrementCounter };
}
