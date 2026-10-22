import { trackPresence, type PresenceTracker } from '@shared/presence';
import type { PlayerId } from '@shared/types';
import { onDisconnect, onValue, ref, set } from 'firebase/database';
import { useEffect, useRef } from 'react';

import { db } from '@/lib/firebase';

// Présence du joueur (spec 7, shared/presence.ts) : à chaque (re)connexion à Firebase, on confie d'abord au
// serveur l'écriture connected = false à faire si la connexion est perdue (onDisconnect), puis on écrit
// connected = true. C'est le serveur qui exécute la première, même si le téléphone se met en veille.
// Monté une seule fois par partie (écran join/[code] ou host/[code] : salon, questions et fin y sont des vues) ;
// quand cet écran est quitté (Quitter, retour), le joueur est marqué absent tout de suite.
export function usePresence(code: string, uid: PlayerId | null): void {
  const tracker = useRef<PresenceTracker | null>(null);

  useEffect(() => {
    if (!uid) return;
    const connectedRef = ref(db, `sessions/${code}/players/${uid}/connected`);
    const current = trackPresence({
      watchConnection: (onConnected) =>
        onValue(ref(db, '.info/connected'), (snapshot) => {
          if (snapshot.val() === true) onConnected();
        }),
      armDisconnect: () => onDisconnect(connectedRef).set(false),
      cancelDisconnect: () => onDisconnect(connectedRef).cancel(),
      setConnected: (connected) => set(connectedRef, connected),
      // Sans conséquence pour l'affichage (la prochaine reconnexion réessaiera), mais signalé.
      warn: (error) => console.warn('[presence] Écriture de la présence refusée ou échouée', error),
    });
    tracker.current = current;
    // Changement de joueur ou partie supprimée : fin du suivi, sans rien écrire.
    return () => current.stop();
  }, [code, uid]);

  // Écran de la partie quitté : seulement au démontage, jamais à un changement de vue dans la partie.
  useEffect(
    () => () => {
      tracker.current?.leave();
    },
    [],
  );
}
