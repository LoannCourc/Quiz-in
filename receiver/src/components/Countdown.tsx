import { useEffect, useState } from 'react'

import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import './Countdown.css'

const URGENT_THRESHOLD_S = 5

interface CountdownProps {
  phaseStartedAt: number
  phaseEndsAt: number
}

function remainingMs(phaseEndsAt: number, offsetMs: number): number {
  return Math.max(0, phaseEndsAt - estimateServerNow(offsetMs))
}

// Secondes restantes : un rendu par seconde, programmé au moment exact où le chiffre change.
function useSecondsLeft(phaseEndsAt: number, offsetMs: number): number {
  const [seconds, setSeconds] = useState(() => Math.ceil(remainingMs(phaseEndsAt, offsetMs) / 1000))

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    const scheduleNext = () => {
      const ms = remainingMs(phaseEndsAt, offsetMs)
      if (ms <= 0) return
      timeoutId = setTimeout(() => {
        setSeconds(Math.ceil(remainingMs(phaseEndsAt, offsetMs) / 1000))
        scheduleNext()
      }, (ms % 1000 || 1000) + 10)
    }
    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [phaseEndsAt, offsetMs])

  return seconds
}

// Nouvelle clé dès que la phase change ou que sa fin est recalculée (reprise après une pause).
export function Countdown(props: CountdownProps) {
  return <CountdownRing key={`${props.phaseStartedAt}-${props.phaseEndsAt}`} {...props} />
}

// Anneau rose qui se vide, chiffre au centre. Deux moitiés d'anneau, chacune dans une demi-boîte
// qui coupe ce qui dépasse, tournent en CSS (transform seulement, léger pour un vieux Chromecast).
// L'animation démarre avec un délai négatif : elle reprend là où en est la phase.
function CountdownRing({ phaseStartedAt, phaseEndsAt }: CountdownProps) {
  const offsetMs = useServerTimeOffset()
  const seconds = useSecondsLeft(phaseEndsAt, offsetMs)
  // Mesuré une seule fois, au montage : l'animation CSS avance ensuite seule.
  const [elapsedMs] = useState(() => estimateServerNow(offsetMs) - phaseStartedAt)
  const timing = {
    animationDuration: `${Math.max(1, phaseEndsAt - phaseStartedAt)}ms`,
    animationDelay: `-${Math.max(0, elapsedMs)}ms`,
  }
  const isUrgent = seconds > 0 && seconds <= URGENT_THRESHOLD_S

  return (
    <div className="countdown-ring">
      <div className="countdown-half countdown-half-right">
        <div className="countdown-arc countdown-arc-right" style={timing} />
      </div>
      <div className="countdown-half countdown-half-left">
        <div className="countdown-arc countdown-arc-left" style={timing} />
      </div>
      <div className="countdown-center">
        <span className={isUrgent ? 'countdown-seconds is-urgent' : 'countdown-seconds'}>{seconds}</span>
      </div>
    </div>
  )
}
