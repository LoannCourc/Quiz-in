import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { db, ensureSignedIn } from '@/lib/firebase';

export type LiveValue<T> =
  | { kind: 'loading' }
  | { kind: 'error'; detail: string }
  // value vaut null si rien n'existe à ce chemin.
  | { kind: 'ready'; value: T | null };

// Connexion anonyme, puis lecture en temps réel d'un chemin de la base.
// Le type T n'est pas vérifié à l'exécution : la forme est garantie par les règles ou l'import.
export function useLiveValue<T>(path: string): LiveValue<T> {
  const [state, setState] = useState<LiveValue<T>>({ kind: 'loading' });

  useEffect(() => {
    let unsubscribe = () => {};
    let isActive = true;
    const onError = (error: unknown) => setState({ kind: 'error', detail: toErrorMessage(error) });

    ensureSignedIn()
      .then(() => {
        if (!isActive) return;
        unsubscribe = onValue(
          ref(db, path),
          (snapshot) => setState({ kind: 'ready', value: snapshot.val() as T | null }),
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
  }, [path]);

  return state;
}
