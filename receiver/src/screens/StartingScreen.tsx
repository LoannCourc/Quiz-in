import { GO_DISPLAY_MS, msUntilNextStartingStep, STARTING_DIGIT_MS, startingStep, startingTimeline, type StartingStep } from '@shared/startingCountdown'
import type { PublicSession } from '@shared/types'
import { useEffect, useState } from 'react'

import { RingArcs } from '../components/Countdown'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import '../components/Countdown.css'
import './StartingScreen.css'

export function StartingScreen({ session }: { session: PublicSession }) {
  const step = useStartingStep(session.phaseEndsAt)
  const isGo = step === 'go'

  return (
    <main className="screen starting">
      <h1 className="hero-title">{strings.starting.getReady}</h1>
      <div className={isGo ? 'countdown-ring starting-disc is-go' : 'countdown-ring starting-disc'}>
        {/* La clé change à chaque étape : React recrée l'anneau et le texte, leurs animations rejouent. */}
        {!isGo && <DigitRing key={step} phaseEndsAt={session.phaseEndsAt} digit={step} />}
        <div className="countdown-center">
          <span key={step} className={isGo ? 'starting-number starting-go' : 'starting-number'}>
            {isGo ? strings.starting.go : step}
          </span>
        </div>
      </div>
      <p className="starting-hint">{strings.starting.firstQuestion}</p>
    </main>
  )
}

function remainingMs(phaseEndsAt: number, offsetMs: number): number {
  return Math.max(0, phaseEndsAt - estimateServerNow(offsetMs))
}

// Étape du 3-2-1 (chiffre ou « GO ! ») : un rendu à chaque changement, programmé au moment exact, calé
// sur l'heure du serveur comme le son (shared/startingCountdown.ts).
function useStartingStep(phaseEndsAt: number): StartingStep {
  const offsetMs = useServerTimeOffset()
  const [step, setStep] = useState(() => startingStep(remainingMs(phaseEndsAt, offsetMs)))

  useEffect(() => {
    const remaining = () => remainingMs(phaseEndsAt, offsetMs)
    let timeoutId: ReturnType<typeof setTimeout>
    const scheduleNext = () => {
      setStep(startingStep(remaining()))
      const waitMs = msUntilNextStartingStep(remaining())
      if (waitMs > 0) timeoutId = setTimeout(scheduleNext, waitMs + 5)
    }
    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [phaseEndsAt, offsetMs])

  return step
}

// Anneau qui se vide pendant le chiffre affiché : délai négatif si le chiffre a déjà commencé à
// l'affichage (TV ouverte en cours de route).
function DigitRing({ phaseEndsAt, digit }: { phaseEndsAt: number; digit: number }) {
  const offsetMs = useServerTimeOffset()
  const [elapsedMs] = useState(() => {
    const { digitsAt } = startingTimeline(phaseEndsAt)
    const startedAt = digitsAt[digitsAt.length - digit] ?? phaseEndsAt - GO_DISPLAY_MS
    return Math.min(STARTING_DIGIT_MS, Math.max(0, estimateServerNow(offsetMs) - startedAt))
  })
  return <RingArcs timing={{ animationDuration: `${STARTING_DIGIT_MS}ms`, animationDelay: `-${elapsedMs}ms` }} />
}
