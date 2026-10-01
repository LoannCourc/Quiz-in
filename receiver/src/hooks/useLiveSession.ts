import type { Session } from '@shared/types'
import { onValue, ref, type Unsubscribe } from 'firebase/database'
import { useEffect, useState } from 'react'

import { ensureSignedIn, getFirebase, MissingConfigError } from '../lib/firebase'

export type LoadErrorKind = 'missingConfig' | 'permissionDenied' | 'other'

export type LiveSessionState =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error'; errorKind: LoadErrorKind; detail: string }
  | { kind: 'ready'; session: Session }

export interface LiveSession {
  state: LiveSessionState
  // Faux tant que la première connexion n'a pas eu lieu, puis reflète .info/connected.
  hasConnectedOnce: boolean
  isConnected: boolean
  serverTimeOffsetMs: number
}

function toErrorState(error: unknown): LiveSessionState {
  const detail = error instanceof Error ? error.message : String(error)
  if (error instanceof MissingConfigError) return { kind: 'error', errorKind: 'missingConfig', detail }
  if (/permission[_ ]denied/i.test(detail)) return { kind: 'error', errorKind: 'permissionDenied', detail }
  return { kind: 'error', errorKind: 'other', detail }
}

// La base ne stocke pas les objets vides : une session sans joueur arrive sans « players ».
function toSession(raw: Session): Session {
  return { ...raw, players: raw.players ?? {} }
}

// Lecture seule et temps réel de sessions/{code}.
export function useLiveSession(roomCode: string): LiveSession {
  const [state, setState] = useState<LiveSessionState>({ kind: 'loading' })
  const [isConnected, setIsConnected] = useState(false)
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false)
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0)

  useEffect(() => {
    let unsubscribers: Unsubscribe[] = []
    let isActive = true

    ensureSignedIn()
      .then(() => {
        if (!isActive) return
        const { db } = getFirebase()
        unsubscribers = [
          onValue(
            ref(db, `sessions/${roomCode}`),
            (snapshot) =>
              setState(snapshot.exists() ? { kind: 'ready', session: toSession(snapshot.val()) } : { kind: 'notFound' }),
            (error) => setState(toErrorState(error)),
          ),
          onValue(ref(db, '.info/connected'), (snapshot) => {
            const connected = snapshot.val() === true
            setIsConnected(connected)
            if (connected) setHasConnectedOnce(true)
          }),
          onValue(ref(db, '.info/serverTimeOffset'), (snapshot) => setServerTimeOffsetMs(snapshot.val() ?? 0)),
        ]
      })
      .catch((error: unknown) => {
        if (isActive) setState(toErrorState(error))
      })

    return () => {
      isActive = false
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [roomCode])

  return { state, hasConnectedOnce, isConnected, serverTimeOffsetMs }
}
