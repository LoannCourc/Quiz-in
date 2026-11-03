import { TV_SESSION_FIELDS } from '@shared/publicFields'
import type { PublicAudio } from '@shared/types'
import { onValue, ref } from 'firebase/database'
import { useEffect, useState } from 'react'

import { getFirebase } from '../lib/firebase'

// Blind test : extrait de la question suivante (sessions/{code}/nextAudio), publié par l'hôte dès la
// révélation, lisible par la TV présente seulement. Écouté une fois la présence écrite (isPresent) ; un
// refus (règles pas encore déployées, présence perdue) ou un hôte plus ancien (champ absent) laissent null :
// la TV charge alors l'extrait au début de la question, comme avant.
const FIELD: (typeof TV_SESSION_FIELDS)[number] = 'nextAudio'

function isPublicAudio(value: unknown): value is PublicAudio {
  if (typeof value !== 'object' || value === null) return false
  const { url, startS, durationS } = value as Record<string, unknown>
  return typeof url === 'string' && url.startsWith('https://') && typeof startS === 'number' && typeof durationS === 'number'
}

export function useNextAudio(roomCode: string, isPresent: boolean): PublicAudio | null {
  const [state, setState] = useState<{ key: string; audio: PublicAudio | null } | null>(null)
  const key = `${roomCode}:${isPresent}`

  useEffect(() => {
    if (!isPresent) return
    const { db } = getFirebase()
    return onValue(
      ref(db, `sessions/${roomCode}/${FIELD}`),
      (snapshot) => {
        const value: unknown = snapshot.val()
        setState({ key: `${roomCode}:true`, audio: isPublicAudio(value) ? value : null })
      },
      // Refusé : rien à précharger (écoute annulée par Firebase ; relancée à la prochaine présence écrite).
      () => setState({ key: `${roomCode}:true`, audio: null }),
    )
  }, [roomCode, isPresent])

  return state?.key === key ? state.audio : null
}
