import { useEffect, useState } from 'react'

import { useServerTimeOffset } from '../lib/serverTime'

const TICK_MS = 250

// Temps restant avant phaseEndsAt (heure du serveur), rafraîchi quatre fois par seconde.
export function useRemainingMs(phaseEndsAt: number): number {
  const offsetMs = useServerTimeOffset()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(intervalId)
  }, [])

  return Math.max(0, phaseEndsAt - (now + offsetMs))
}

