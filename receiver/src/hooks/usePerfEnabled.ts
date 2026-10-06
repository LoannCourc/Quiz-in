import { useSyncExternalStore } from 'react'

import { isPerfEnabled, onPerfChange } from '../lib/perf/perfFlag'

// Panneau de mesures allumé (?perf=1 ou message Cast { "perf": true }).
export function usePerfEnabled(): boolean {
  return useSyncExternalStore(onPerfChange, isPerfEnabled)
}
