import { BLIND_TEST_ENABLED_PATH } from '@shared/constants'
import { onValue, ref, type Unsubscribe } from 'firebase/database'
import { useEffect, useState } from 'react'

import { ensureSignedIn, getFirebase } from '../lib/firebase'

export interface BlindTestInfo {
  // Interrupteur à distance (config/blindTestEnabled) : absent ou false = aucun son joué.
  isEnabled: boolean
  // Le quiz de la partie est un blind test (quizzes/{quizId}/gameType).
  isBlindTest: boolean
}

// Lu en temps réel : couper l'interrupteur en pleine partie arrête le son sur la TV.
export function useBlindTestInfo(quizId: string | undefined): BlindTestInfo {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isBlindTest, setIsBlindTest] = useState(false)

  useEffect(() => {
    let unsubscribers: Unsubscribe[] = []
    let isActive = true
    ensureSignedIn()
      .then(() => {
        if (!isActive) return
        const { db } = getFirebase()
        unsubscribers = [
          onValue(ref(db, BLIND_TEST_ENABLED_PATH), (snapshot) => setIsEnabled(snapshot.val() === true)),
          ...(quizId
            ? [onValue(ref(db, `quizzes/${quizId}/gameType`), (snapshot) => setIsBlindTest(snapshot.val() === 'blindTest'))]
            : []),
        ]
      })
      .catch((error: unknown) => console.warn('[blindtest] Lecture impossible', error))
    return () => {
      isActive = false
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [quizId])

  return { isEnabled, isBlindTest }
}
