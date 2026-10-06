// Panneau de mesures de la TV (?perf=1) : désactivé par défaut, sans aucun coût s'il est éteint.
// Allumé par l'adresse (?perf=1, plan B ; ?perf=0 l'éteint) ou par le message Cast { "perf": true }
// envoyé depuis cast-sender.html, même en pleine partie. Le choix est gardé par la TV (localStorage) :
// une fois allumé, il le reste aux parties suivantes jusqu'à { "perf": false }.
// Musique coupée pour comparer sur une même partie (seulement panneau allumé, jamais gardée) :
// ?perfmusic=0, ou le message Cast { "perfMusic": false } ; { "perfMusic": true } rend la main à l'hôte.

const STORAGE_KEY = 'quizin.perf'
const PARAM = 'perf'
const MUSIC_PARAM = 'perfmusic'

type PerfListener = () => void

const listeners = new Set<PerfListener>()
let isEnabled = readInitialFlag()
let isMusicForcedOff = new URLSearchParams(window.location.search).get(MUSIC_PARAM) === '0'

function store(value: boolean): void {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Stockage indisponible : le réglage vaut pour cette page seulement.
  }
}

function readInitialFlag(): boolean {
  const param = new URLSearchParams(window.location.search).get(PARAM)
  if (param === '1' || param === '0') {
    store(param === '1')
    return param === '1'
  }
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function isPerfEnabled(): boolean {
  return isEnabled
}

export function setPerfEnabled(value: boolean): void {
  store(value)
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
