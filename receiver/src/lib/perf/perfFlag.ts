// Panneau de mesures de la TV (?perf=1) : désactivé par défaut, sans aucun coût s'il est éteint.
// Allumé par l'adresse (?perf=1, plan B ; ?perf=0 l'éteint) ou par le message Cast { "perf": true }
// envoyé depuis cast-sender.html, même en pleine partie. Le choix est gardé par la TV (localStorage) :
// une fois allumé, il le reste aux parties suivantes jusqu'à { "perf": false }.

const STORAGE_KEY = 'quizin.perf'
const PARAM = 'perf'

type PerfListener = (isEnabled: boolean) => void

const listeners = new Set<PerfListener>()
let isEnabled = readInitialFlag()

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
  listeners.forEach((listener) => listener(value))
}

export function onPerfChange(listener: PerfListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
