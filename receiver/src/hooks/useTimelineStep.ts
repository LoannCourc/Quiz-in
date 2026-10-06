import { useEffect, useState } from 'react'

import { useServerTimeOffset } from '../lib/serverTime'

function countPassed(marksMs: readonly number[], elapsedMs: number): number {
  return marksMs.filter((mark) => mark <= elapsedMs).length
}

// Nombre d'instants du calendrier déjà atteints (marksMs : en ms depuis phaseStartedAt, croissants).
// Un seul minuteur, programmé pour l'instant suivant exactement : les cartes du Bluff se retournent à
// leur heure, même toutes les 0,4 s (une horloge à 250 ms les ferait tomber de façon irrégulière).
export function useTimelineStep(phaseStartedAt: number, marksMs: readonly number[]): number {
  const offsetMs = useServerTimeOffset()
  // Le tableau est recréé à chaque rendu ; sa valeur en texte ne change qu'avec le calendrier.
  const marksKey = marksMs.join(',')
  const [step, setStep] = useState(() => countPassed(marksMs, Date.now() + offsetMs - phaseStartedAt))

  useEffect(() => {
    const marks = marksKey === '' ? [] : marksKey.split(',').map(Number)
    let timeoutId: ReturnType<typeof setTimeout>
    const scheduleNext = () => {
      const elapsed = Date.now() + offsetMs - phaseStartedAt
      const count = countPassed(marks, elapsed)
      setStep(count)
      if (count < marks.length) timeoutId = setTimeout(scheduleNext, Math.max(0, marks[count] - elapsed))
    }
    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [phaseStartedAt, offsetMs, marksKey])

  return step
}
