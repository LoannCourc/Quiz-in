import type { PublicSession } from '@shared/types'
import { useState } from 'react'

import { RingArcs } from '../components/Countdown'
import { useRemainingMs } from '../hooks/useRemainingMs'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import '../components/Countdown.css'
import './StartingScreen.css'

const SECOND_MS = 1000

export function StartingScreen({ session }: { session: PublicSession }) {
  const remainingMs = useRemainingMs(session.phaseEndsAt)
  const seconds = Math.max(1, Math.ceil(remainingMs / SECOND_MS))

  return (
    <main className="screen starting">
      <h1 className="hero-title">{strings.starting.getReady}</h1>
      <div className="countdown-ring starting-disc">
        {/* La clé change à chaque seconde : React recrée l'anneau et le chiffre, leurs animations rejouent. */}
        <SecondRing key={seconds} phaseEndsAt={session.phaseEndsAt} seconds={seconds} />
        <div className="countdown-center">
          <span key={seconds} className="starting-number">
            {seconds}
          </span>
        </div>
      </div>
      <p className="starting-hint">{strings.starting.firstQuestion}</p>
    </main>
  )
}

// Anneau qui se vide pendant la seconde du chiffre affiché, calé sur l'heure du serveur : délai négatif
// si la seconde a déjà commencé à l'affichage (TV ouverte en cours de route).
function SecondRing({ phaseEndsAt, seconds }: { phaseEndsAt: number; seconds: number }) {
  const offsetMs = useServerTimeOffset()
  const [elapsedMs] = useState(() => {
    const secondEndsAt = phaseEndsAt - (seconds - 1) * SECOND_MS
    return Math.min(SECOND_MS, Math.max(0, SECOND_MS - (secondEndsAt - estimateServerNow(offsetMs))))
  })
  return <RingArcs timing={{ animationDuration: `${SECOND_MS}ms`, animationDelay: `-${elapsedMs}ms` }} />
}
