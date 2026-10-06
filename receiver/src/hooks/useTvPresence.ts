import { onDisconnect, ref, remove, set } from 'firebase/database'
import { useEffect } from 'react'

import { getFirebase } from '../lib/firebase'

// Signale la TV dans sessions/{code}/tvPresence/{uid} tant que la partie est affichée et la connexion
// active (les téléphones masquent alors l'énoncé du Bluff, lu sur la TV). onDisconnect : le serveur
// retire le nœud de lui-même si la TV disparaît (box éteinte, réseau coupé, page fermée). Réarmé à
// chaque reconnexion, comme la présence des joueurs.
export function useTvPresence(roomCode: string, isActive: boolean): void {
  useEffect(() => {
    const { auth, db } = getFirebase()
    const uid = auth.currentUser?.uid
    if (!isActive || !uid) return
    const presenceRef = ref(db, `sessions/${roomCode}/tvPresence/${uid}`)
    const disconnect = onDisconnect(presenceRef)
    disconnect
      .remove()
      .then(() => set(presenceRef, true))
      .catch((error: unknown) => console.warn('[tv] Présence non écrite', error))
    return () => {
      disconnect.cancel().catch(() => {})
      remove(presenceRef).catch(() => {})
    }
  }, [roomCode, isActive])
}
