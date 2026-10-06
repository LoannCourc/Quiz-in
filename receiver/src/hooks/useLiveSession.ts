import { PUBLIC_SESSION_FIELDS, toPublicSession, type PublicField } from '@shared/publicFields'
import type { PublicSession } from '@shared/types'
import { onValue, ref, type Database, type Unsubscribe } from 'firebase/database'
import { useEffect, useState } from 'react'

import { ensureSignedIn, getFirebase, MissingConfigError } from '../lib/firebase'
import { perfMonitor } from '../lib/perf/perfMonitor'

export type LoadErrorKind = 'missingConfig' | 'permissionDenied' | 'other'

export type LiveSessionState =
  | { kind: 'loading' }
  // wasRemoved : la partie existait puis a été supprimée (l'hôte a quitté).
  | { kind: 'notFound'; wasRemoved: boolean }
  | { kind: 'error'; errorKind: LoadErrorKind; detail: string }
  | { kind: 'ready'; session: PublicSession }

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

// Champs lisibles par la TV : liste commune avec les joueurs (shared/publicFields.ts), un abonnement
// par champ (les règles interdisent de lire sessions/{code} d'un bloc).
const PUBLIC_FIELDS = PUBLIC_SESSION_FIELDS
type FieldValues = Partial<Record<PublicField, unknown>>

// status est toujours écrit par l'hôte : s'il manque, la session n'existe pas.
function toSessionState(values: FieldValues): LiveSessionState {
  const session = toPublicSession(values)
  return session ? { kind: 'ready', session } : { kind: 'notFound', wasRemoved: false }
}

function subscribeToFields(
  db: Database,
  roomCode: string,
  onChange: (state: LiveSessionState) => void,
): Unsubscribe[] {
  const values: FieldValues = {}
  const received = new Set<PublicField>()
  // Vrai dès que la partie a été affichée : sa disparition ensuite signifie « supprimée par l'hôte ».
  let hasSeenGame = false

  return PUBLIC_FIELDS.map((field) =>
    onValue(
      ref(db, `sessions/${roomCode}/${field}`),
      (snapshot) => {
        values[field] = snapshot.val() ?? undefined
        received.add(field)
        // On attend la première valeur de chaque champ pour ne pas afficher une session incomplète.
        if (received.size !== PUBLIC_FIELDS.length) return
        const state = toSessionState(values)
        if (state.kind === 'ready') {
          hasSeenGame = true
          // Heure de réception d'une nouvelle phase (panneau ?perf=1 ; sans effet s'il est éteint).
          perfMonitor.noteSession(state.session)
        }
        onChange(state.kind === 'notFound' ? { ...state, wasRemoved: hasSeenGame } : state)
      },
      (error) => onChange(toErrorState(error)),
    ),
  )
}

// Lecture seule et temps réel des champs publics de sessions/{code}.
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
          ...subscribeToFields(db, roomCode, setState),
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
