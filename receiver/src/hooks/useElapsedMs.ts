import { useEffect, useState } from 'react'

import { useServerTimeOffset } from '../lib/serverTime'

const TICK_MS = 250

// Temps écoulé depuis phaseStartedAt (heure du serveur), rafraîchi quatre fois par seconde : sert aux
// écrans qui se déroulent pendant la phase (révélation du Bluff), y compris sans échéance (Pas à pas).
export function useElapsedMs(phaseStartedAt: number): number {
  const offsetMs = useServerTimeOffset()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(intervalId)
  }, [])

  return Math.max(0, now + offsetMs - phaseStartedAt)
}
