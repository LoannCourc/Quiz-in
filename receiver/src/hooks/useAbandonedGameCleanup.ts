import { abandonedGameDeletableAt } from '@shared/hostAbsence'
import type { PublicSession } from '@shared/types'
import { ref, remove } from 'firebase/database'
import { useEffect } from 'react'

import { getFirebase } from '../lib/firebase'

// Marge après l'échéance : la règle exige strictement « après » (heure du serveur).
const CLEANUP_MARGIN_MS = 1_000

// TV : si l'hôte ne revient pas dans le délai (hostLeftAt + 5 min), supprime la partie, y compris
// en fin de partie (nettoyage, spec 6.6). Les joueurs essaient aussi : le premier réussit, les
// autres reçoivent un refus sans conséquence.
export function useAbandonedGameCleanup(
  roomCode: string,
  session: Pick<PublicSession, 'status' | 'hostLeftAt'> | null,
  serverOffsetMs: number,
): void {
  const deletableAt = session ? abandonedGameDeletableAt(session) : null

  useEffect(() => {
    if (deletableAt === null) return
    const delayMs = Math.max(0, deletableAt - (Date.now() + serverOffsetMs)) + CLEANUP_MARGIN_MS
    const timeoutId = setTimeout(() => {
      remove(ref(getFirebase().db, `sessions/${roomCode}`)).catch((error: unknown) =>
        console.warn('[absence] Suppression de la partie abandonnée refusée ou impossible', error),
      )
    }, delayMs)
    return () => clearTimeout(timeoutId)
  }, [roomCode, deletableAt, serverOffsetMs])
}
