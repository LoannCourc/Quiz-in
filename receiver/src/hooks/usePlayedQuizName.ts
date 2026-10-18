import { playedQuizName } from '@shared/quizCatalog'
import { parseQuizSummary } from '@shared/quizValidation'
import type { PublicSession, QuizSummary } from '@shared/types'
import { onValue, ref, type Unsubscribe } from 'firebase/database'
import { useEffect, useState } from 'react'

import { ensureSignedIn, getFirebase } from '../lib/firebase'
import { strings } from '../strings'

// Fiche du quiz joué (quizzes/{quizId}, lisible par la TV connectée), puis son nom : quiz fixe ou blind test
// seulement (playedQuizName). null tant qu'elle n'est pas lue, ou sans nom à afficher.
export function usePlayedQuizName(session: PublicSession): string | null {
  const [summary, setSummary] = useState<{ quizId: string; value: QuizSummary | null } | null>(null)
  const { quizId } = session

  useEffect(() => {
    let unsubscribe: Unsubscribe = () => {}
    let isActive = true
    ensureSignedIn()
      .then(() => {
        if (!isActive) return
        const { db } = getFirebase()
        unsubscribe = onValue(ref(db, `quizzes/${quizId}`), (snapshot) => setSummary({ quizId, value: parseQuizSummary(snapshot.val()) }))
      })
      .catch((error: unknown) => console.warn('[quiz] Fiche du quiz joué illisible', error))
    return () => {
      isActive = false
      unsubscribe()
    }
  }, [quizId])

  const name = summary?.quizId === quizId ? playedQuizName(summary.value, session.settings) : null
  return name && strings.playedQuiz(name.title, name.level)
}
