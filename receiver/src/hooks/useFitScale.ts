import { useLayoutEffect, useRef, type RefObject } from 'react'

// Échelle réduite par pas jusqu'à ce que tout tienne : au plus MAX_STEPS mesures, faites avant
// l'affichage (effet de mise en page), donc sans clignotement.
const STEP = 0.04
const MIN_SCALE = 0.5
const MAX_STEPS = Math.round((1 - MIN_SCALE) / STEP)

// Vrai si un des éléments déborde (en hauteur) ou si un texte sur une ligne est coupé (en largeur).
function overflows(root: HTMLElement, boxSelector: string, textSelector: string): boolean {
  const boxes = [...root.querySelectorAll<HTMLElement>(boxSelector)]
  const texts = [...root.querySelectorAll<HTMLElement>(textSelector)]
  return (
    boxes.some((box) => box.scrollHeight > box.clientHeight + 1) || texts.some((text) => text.scrollWidth > text.clientWidth + 1)
  )
}

// Salon de la TV : la variable CSS --fit-scale de l'élément (taille des avatars, pseudos, écarts) est
// réduite jusqu'à ce que les boîtes (boxSelector) ne débordent plus et qu'aucun texte (textSelector) ne
// soit coupé. Recalculé quand fitKey change (joueurs, équipes), quand la fenêtre change de taille
// (plan B) et quand les polices finissent de charger.
export function useFitScale(fitKey: string, boxSelector: string, textSelector: string): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const fit = () => {
      const root = ref.current
      if (!root) return
      let scale = 1
      root.style.setProperty('--fit-scale', String(scale))
      for (let step = 0; step < MAX_STEPS && overflows(root, boxSelector, textSelector); step++) {
        scale -= STEP
        root.style.setProperty('--fit-scale', scale.toFixed(2))
      }
    }
    fit()
    window.addEventListener('resize', fit)
    document.fonts?.addEventListener('loadingdone', fit)
    return () => {
      window.removeEventListener('resize', fit)
      document.fonts?.removeEventListener('loadingdone', fit)
    }
  }, [fitKey, boxSelector, textSelector])

  return ref
}
