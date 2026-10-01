import { createContext, useContext } from 'react'

// Décalage (ms) entre l'horloge de la TV et celle du serveur Firebase (.info/serverTimeOffset).
// Valeur par défaut 0 : le mode démo utilise simplement l'horloge locale.
export const ServerTimeOffsetContext = createContext(0)

export function useServerTimeOffset(): number {
  return useContext(ServerTimeOffsetContext)
}

export function estimateServerNow(offsetMs: number): number {
  return Date.now() + offsetMs
}
