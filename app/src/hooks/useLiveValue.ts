import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { getIsOnline, subscribeConnectivity } from '@/lib/connectivity';
import { toErrorMessage } from '@/lib/errors';
import { db, ensureSignedIn } from '@/lib/firebase';

export type LiveValue<T> =
  | { kind: 'loading' }
  | { kind: 'error'; detail: string }
  // value vaut null si rien n'existe à ce chemin ; wasRemoved : il existait puis a été supprimé.
  | { kind: 'ready'; value: T | null; wasRemoved: boolean };

// Connexion anonyme, puis lecture en temps réel d'un chemin de la base.
// Le type T n'est pas vérifié à l'exécution : la forme est garantie par les règles ou l'import.
// retriesOnReconnect : une lecture en erreur repart au retour du réseau (sinon l'erreur reste jusqu'au prochain montage).
export function useLiveValue<T>(path: string, retriesOnReconnect = false): LiveValue<T> {
  const [state, setState] = useState<LiveValue<T>>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const hasFailed = state.kind === 'error';

  useEffect(() => {
    if (!retriesOnReconnect || !hasFailed) return;
    return subscribeConnectivity(() => {
      if (getIsOnline()) setAttempt((count) => count + 1);
    });
  }, [retriesOnReconnect, hasFailed]);

  useEffect(() => {
    let unsubscribe = () => {};
    let isActive = true;
    let hasSeenValue = false;
    const onError = (error: unknown) => setState({ kind: 'error', detail: toErrorMessage(error) });

    ensureSignedIn()
      .then(() => {
        if (!isActive) return;
        unsubscribe = onValue(
          ref(db, path),
          (snapshot) => {
            const value = snapshot.val() as T | null;
            if (value !== null) hasSeenValue = true;
            setState({ kind: 'ready', value, wasRemoved: value === null && hasSeenValue });
          },
          onError,
        );
      })
      .catch((error: unknown) => {
        if (isActive) onError(error);
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [path, attempt]);

  return state;
}
