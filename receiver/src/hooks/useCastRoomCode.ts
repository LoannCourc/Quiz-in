import { useEffect, useState } from 'react'

import { lastCastCode, onCastCode, startCastReceiver } from '../lib/castReceiver'

export type CastState =
  | { kind: 'starting' }
  | { kind: 'waiting' }
  | { kind: 'ready'; roomCode: string }
  | { kind: 'error'; detail: string }

// Mode Cast : démarre le récepteur, puis suit le code envoyé par l'hôte (un nouveau code
// remplace le précédent : nouvelle partie).
export function useCastRoomCode(): CastState {
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState(lastCastCode)

  useEffect(() => {
    const unsubscribe = onCastCode(setRoomCode)
    startCastReceiver()
      .then(() => setIsStarted(true))
      .catch((startError: unknown) => {
        console.error('[cast] Démarrage du récepteur impossible', startError)
        setError(String(startError))
      })
    return unsubscribe
  }, [])

  if (roomCode !== null) return { kind: 'ready', roomCode }
  if (error !== null) return { kind: 'error', detail: error }
  return isStarted ? { kind: 'waiting' } : { kind: 'starting' }
}
