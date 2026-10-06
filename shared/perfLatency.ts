// Mesure d'un changement d'état sur la TV (panneau ?perf=1, plan de fiabilité) : trois retards à
// distinguer, tous en heure du serveur (ms).
// - hôte : l'hôte a publié la phase après l'échéance de la précédente (son téléphone en retard) ;
// - réseau : de la publication à la réception par la TV ;
// - affichage : de la réception à la première image affichée par la TV.

export interface TransitionTimes {
  // Échéance de la phase précédente (0 : sans échéance, Pas à pas ou pause).
  previousEndsAt: number
  // Début de la nouvelle phase, écrit par l'hôte (son estimation de l'heure du serveur).
  writtenAt: number
  receivedAt: number
  displayedAt: number
}

export interface TransitionLatency {
  // null quand la phase précédente n'avait pas d'échéance (rien à comparer).
  hostMs: number | null
  networkMs: number
  displayMs: number
  // Réseau et affichage : ce que la TV ajoute après la publication.
  tvMs: number
}

// Une phase écrite plus d'une minute avant l'échéance (hôte qui passe la question, reprise d'une
// pause) n'est pas un retard : pas de mesure de l'hôte.
const HOST_EARLY_LIMIT_MS = 60_000

export function transitionLatency(times: TransitionTimes): TransitionLatency {
  const { previousEndsAt, writtenAt, receivedAt, displayedAt } = times
  const hostDelay = writtenAt - previousEndsAt
  const hostMs = previousEndsAt > 0 && hostDelay > -HOST_EARLY_LIMIT_MS ? Math.max(0, hostDelay) : null
  const networkMs = Math.max(0, receivedAt - writtenAt)
  const displayMs = Math.max(0, displayedAt - receivedAt)
  return { hostMs, networkMs, displayMs, tvMs: networkMs + displayMs }
}
