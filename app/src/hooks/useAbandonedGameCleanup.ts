import { abandonedGameDeletableAt } from '@shared/hostAbsence';
import type { PublicSession } from '@shared/types';
import { useEffect } from 'react';

import { deleteAbandonedGame } from '@/lib/hostAbsence';

// Marge après l'échéance : la règle exige strictement « après » (heure du serveur).
const CLEANUP_MARGIN_MS = 1_000;

// Joueur : si l'hôte ne revient pas dans le délai (hostLeftAt + 5 min), supprime la partie, y
// compris en fin de partie (nettoyage). Plusieurs joueurs et la TV peuvent essayer : le premier
// réussit, les autres reçoivent un refus sans conséquence. Si l'hôte revient avant, hostLeftAt
// est effacé : l'échéance disparaît (et les règles refuseraient de toute façon).
export function useAbandonedGameCleanup(
  code: string,
  session: Pick<PublicSession, 'status' | 'hostLeftAt'> | null,
  serverOffsetMs: number,
): void {
  const deletableAt = session ? abandonedGameDeletableAt(session) : null;

  useEffect(() => {
    if (deletableAt === null) return;
    const delayMs = Math.max(0, deletableAt - (Date.now() + serverOffsetMs)) + CLEANUP_MARGIN_MS;
    const timeoutId = setTimeout(() => {
      deleteAbandonedGame(code).catch((error: unknown) =>
        console.warn('[absence] Suppression de la partie abandonnée refusée ou impossible', error),
      );
    }, delayMs);
    return () => clearTimeout(timeoutId);
  }, [code, deletableAt, serverOffsetMs]);
}
