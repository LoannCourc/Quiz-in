import type { PublicSession } from '@shared/types'
import { onValue, ref, type Database, type Unsubscribe } from 'firebase/database'
import { useEffect, useState } from 'react'

import { ensureSignedIn, getFirebase, MissingConfigError } from '../lib/firebase'

export type LoadErrorKind = 'missingConfig' | 'permissionDenied' | 'other'

export type LiveSessionState =
  | { kind: 'loading' }
  | { kind: 'notFound' }
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

// Champs lisibles par la TV. Les règles interdisent de lire sessions/{code} d'un bloc
// (answers est réservé à l'hôte) : on s'abonne donc à chaque champ séparément.
const PUBLIC_FIELDS = [
  'hostUid',
  'quizId',
  'status',
  'settings',
  'currentIndex',
  'phaseStartedAt',
  'phaseEndsAt',
  'pausedFrom',
  'remainingMs',
  'currentQuestion',
  'reveal',
  'players',
  'answeredBy',
] as const satisfies readonly (keyof PublicSession)[]

type PublicField = (typeof PUBLIC_FIELDS)[number]
type FieldValues = Partial<Record<PublicField, unknown>>

// status est toujours écrit par l'hôte : s'il manque, la session n'existe pas.
// La base ne stocke pas les objets vides : players et reveal.stats peuvent manquer.
function toSessionState(values: FieldValues): LiveSessionState {
  if (values.status == null) return { kind: 'notFound' }
  // Forme garantie par les règles de validation de la base (database.rules.json).
  const session = values as PublicSession
  const reveal = session.reveal && { ...session.reveal, stats: session.reveal.stats ?? {} }
  return { kind: 'ready', session: { ...session, players: session.players ?? {}, reveal } }
}

function subscribeToFields(
  db: Database,
  roomCode: string,
  onChange: (state: LiveSessionState) => void,
): Unsubscribe[] {
  const values: FieldValues = {}
  const received = new Set<PublicField>()

  return PUBLIC_FIELDS.map((field) =>
    onValue(
      ref(db, `sessions/${roomCode}/${field}`),
      (snapshot) => {
        values[field] = snapshot.val() ?? undefined
        received.add(field)
        // On attend la première valeur de chaque champ pour ne pas afficher une session incomplète.
        if (received.size === PUBLIC_FIELDS.length) onChange(toSessionState(values))
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
