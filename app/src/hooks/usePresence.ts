import type { PlayerId } from '@shared/types';
import { onDisconnect, onValue, ref, set } from 'firebase/database';
import { useEffect } from 'react';

import { db } from '@/lib/firebase';

// Présence du joueur (spec 7) : à chaque (re)connexion à Firebase, on confie d'abord au serveur
// l'écriture connected = false à faire si la connexion est perdue (onDisconnect), puis on écrit
// connected = true. C'est le serveur qui exécute la première, même si le téléphone se met en veille.
export function usePresence(code: string, uid: PlayerId | null): void {
  useEffect(() => {
    if (!uid) return;
    const connectedRef = ref(db, `sessions/${code}/players/${uid}/connected`);

    return onValue(ref(db, '.info/connected'), (snapshot) => {
      if (snapshot.val() !== true) return;
      onDisconnect(connectedRef)
        .set(false)
        .then(() => set(connectedRef, true))
        .catch(() => {
          // Échec sans conséquence pour l'affichage : la prochaine reconnexion réessaiera.
        });
    });
  }, [code, uid]);
}
