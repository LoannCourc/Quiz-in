import { onDisconnect, ref, remove, set } from 'firebase/database'
import { useEffect, useState } from 'react'

import { getFirebase } from '../lib/firebase'

// Signale la TV dans sessions/{code}/tvPresence/{uid} tant que la partie est affichée et la connexion
// active (les téléphones masquent alors l'énoncé du Bluff, lu sur la TV). onDisconnect : le serveur
// retire le nœud de lui-même si la TV disparaît (box éteinte, réseau coupé, page fermée). Réarmé à
// chaque reconnexion, comme la présence des joueurs. Renvoie vrai une fois la présence écrite : les
// champs réservés à la TV (nextAudio) ne sont lisibles qu'à partir de là.
export function useTvPresence(roomCode: string, isActive: boolean): boolean {
  // Présence écrite pour cette partie et cette connexion (clé), faux sinon.
  const [writtenFor, setWrittenFor] = useState<string | null>(null)
  const key = `${roomCode}:${isActive}`

  useEffect(() => {
    const { auth, db } = getFirebase()
    const uid = auth.currentUser?.uid
    if (!isActive || !uid) return
    let isCurrent = true
    const presenceRef = ref(db, `sessions/${roomCode}/tvPresence/${uid}`)
    const disconnect = onDisconnect(presenceRef)
    disconnect
      .remove()
      .then(() => set(presenceRef, true))
      .then(() => {
        if (isCurrent) setWrittenFor(`${roomCode}:true`)
      })
      .catch((error: unknown) => console.warn('[tv] Présence non écrite', error))
    return () => {
      isCurrent = false
      setWrittenFor(null)
      disconnect.cancel().catch(() => {})
      remove(presenceRef).catch(() => {})
    }
  }, [roomCode, isActive])

  return isActive && writtenFor === key
}
