// Plan B (navigateur d'un PC) : Chrome n'autorise le son qu'après un geste de l'utilisateur dans la
// page. Un seul clic (ou une touche) suffit pour toute la partie : on le détecte ici, une fois.
// En mode Cast, la box joue le son sans geste (testé sur la box Bouygues) : ce module n'y sert pas.

type UnlockListener = () => void

const listeners = new Set<UnlockListener>()
let isUnlocked = false

function unlock(): void {
  if (isUnlocked) return
  isUnlocked = true
  window.removeEventListener('pointerdown', unlock)
  window.removeEventListener('keydown', unlock)
  listeners.forEach((listener) => listener())
}

window.addEventListener('pointerdown', unlock)
window.addEventListener('keydown', unlock)

export function isAudioUnlocked(): boolean {
  return isUnlocked
}

export function onAudioUnlock(listener: UnlockListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
