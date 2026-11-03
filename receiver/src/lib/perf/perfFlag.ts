import { LEGACY_PERF_STORAGE_KEY, perfEnabledFromUrl } from '@shared/perfFlag'

// Panneau de mesures de la TV (?perf=1) : éteint par défaut, sans aucun coût s'il est éteint (le moniteur ne
// tourne que panneau affiché). Allumé seulement par une action volontaire, pour la page en cours : ?perf=1
// dans l'adresse (plan B), ou le message Cast { "perf": true } envoyé depuis cast-sender.html, même en pleine
// partie. Rien n'est mémorisé (shared/perfFlag.ts) : rechargement, redémarrage de la box ou nouveau Cast,
// le panneau est éteint ; { "perf": false } ou ?perf=0 l'éteignent aussi.
// Musique coupée pour comparer sur une même partie (seulement panneau allumé, jamais gardée) :
// ?perfmusic=0, ou le message Cast { "perfMusic": false } ; { "perfMusic": true } rend la main à l'hôte.

const MUSIC_PARAM = 'perfmusic'

type PerfListener = () => void

const listeners = new Set<PerfListener>()

// Ancienne valeur gardée par la TV avant la 1.2.2 (panneau qui revenait à chaque partie) : effacée.
function clearLegacyFlag(): void {
  try {
    localStorage.removeItem(LEGACY_PERF_STORAGE_KEY)
  } catch {
    // Stockage indisponible : rien à effacer.
  }
}

clearLegacyFlag()
let isEnabled = perfEnabledFromUrl(window.location.search)
let isMusicForcedOff = new URLSearchParams(window.location.search).get(MUSIC_PARAM) === '0'

export function isPerfEnabled(): boolean {
  return isEnabled
}

export function setPerfEnabled(value: boolean): void {
  if (value === isEnabled) return
  isEnabled = value
  listeners.forEach((listener) => listener())
}

// Musique coupée par le panneau, quel que soit le réglage de l'hôte (panneau allumé seulement).
export function isPerfMusicForcedOff(): boolean {
  return isEnabled && isMusicForcedOff
}

export function setPerfMusicForcedOff(value: boolean): void {
  if (value === isMusicForcedOff) return
  isMusicForcedOff = value
  listeners.forEach((listener) => listener())
}

export function onPerfChange(listener: PerfListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
