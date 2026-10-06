import { useSyncExternalStore } from 'react'

import { isPerfEnabled, isPerfMusicForcedOff, onPerfChange } from '../lib/perf/perfFlag'

// Panneau de mesures allumé (?perf=1 ou message Cast { "perf": true }).
export function usePerfEnabled(): boolean {
  return useSyncExternalStore(onPerfChange, isPerfEnabled)
}

// Musique coupée depuis le panneau de mesures (comparaison sur une même partie).
export function usePerfMusicForcedOff(): boolean {
  return useSyncExternalStore(onPerfChange, isPerfMusicForcedOff)
}
