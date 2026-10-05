import { useState } from 'react'

import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'

// Arrivée des lignes et des marches (classement, podium) calée sur l'heure du serveur : renvoie, pour
// un instant prévu en ms depuis le début de la phase, le délai CSS à appliquer (négatif si l'instant
// est déjà passé à l'affichage : une TV ouverte en cours de route montre l'état atteint, pas le début).
// Les sons lisent les mêmes instants (shared/rankingTimeline.ts).
export function useEntryDelay(phaseStartedAt: number): (atMs: number) => string {
  const offsetMs = useServerTimeOffset()
  // Temps écoulé au premier affichage, figé : les animations CSS partent toutes de là.
  const [elapsedAtMount] = useState(() => estimateServerNow(offsetMs) - phaseStartedAt)
  return (atMs) => `${Math.round(atMs - elapsedAtMount)}ms`
}
