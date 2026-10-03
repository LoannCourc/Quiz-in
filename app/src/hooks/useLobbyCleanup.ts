import { ghostPlayersToRemove, trackDisconnections, type DisconnectedSince } from '@shared/players';
import type { Session } from '@shared/types';
import { ref, update } from 'firebase/database';
import { useEffect, useRef } from 'react';

import { db } from '@/lib/firebase';

// Vérification régulière en lobby : un fantôme est retiré entre 30 et 35 s après sa déconnexion.
const CHECK_INTERVAL_MS = 5_000;

// En LOBBY seulement, l'hôte retire de players/ les joueurs déconnectés depuis plus de 30 s
// (joueurs fantômes : onglet fermé, téléphone en veille). L'heure de déconnexion n'est pas
// stockée dans la base : l'hôte la note lui-même en suivant la présence. Après le lancement,
// plus aucune suppression (spec 6.6 : un joueur déconnecté garde sa place).
export function useLobbyCleanup(code: string, session: Session): void {
  const disconnectedSince = useRef<DisconnectedSince>({});
  const latest = useRef(session);
  const isLobby = session.status === 'lobby';

  // Suivi de la présence à chaque nouvelle valeur de la session.
  useEffect(() => {
    latest.current = session;
    disconnectedSince.current = trackDisconnections(disconnectedSince.current, session.players, Date.now());
  }, [session]);

  useEffect(() => {
    if (!isLobby) return;
    const intervalId = setInterval(() => {
      const ghosts = ghostPlayersToRemove(latest.current, disconnectedSince.current, Date.now());
      if (ghosts.length === 0) return;
      // Un seul update multi-chemins : players/{uid} = null pour chaque fantôme.
      const removals = Object.fromEntries(ghosts.map((uid) => [`players/${uid}`, null]));
      update(ref(db, `sessions/${code}`), removals).catch((error: unknown) =>
        console.warn('[lobby] Retrait des joueurs déconnectés impossible', error),
      );
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [code, isLobby]);
}
