import { useLayoutEffect, useRef, type RefObject } from 'react'

// Échelle réduite par pas jusqu'à ce que tout tienne : au plus MAX_STEPS mesures par échelle, faites avant
// l'affichage (effet de mise en page), donc sans clignotement.
const STEP = 0.04
const MIN_SCALE = 0.5
const MAX_STEPS = Math.round((1 - MIN_SCALE) / STEP)

export interface FitOptions {
  // Variables CSS réduites l'une après l'autre (la première jusqu'au minimum avant la suivante) : ordre
  // de sacrifice, du moins important au plus important.
  variables: readonly string[]
  // Boîtes qui ne doivent pas déborder (en hauteur).
  boxes: string
  // Textes sur une ligne qui ne doivent pas être coupés (en largeur).
  texts?: string
  // L'élément lui-même ne doit pas déborder (écran entier).
  includeRoot?: boolean
}

function overflows(root: HTMLElement, { boxes, texts, includeRoot }: FitOptions): boolean {
  if (includeRoot && root.scrollHeight > root.clientHeight + 1) return true
  if ([...root.querySelectorAll<HTMLElement>(boxes)].some((box) => box.scrollHeight > box.clientHeight + 1)) return true
  return texts ? [...root.querySelectorAll<HTMLElement>(texts)].some((text) => text.scrollWidth > text.clientWidth + 1) : false
}

// TV : échelles CSS (taille des avatars, des pseudos, du texte…) réduites jusqu'à ce que rien ne déborde
// ni ne soit coupé. Recalculé quand fitKey change (contenu), quand la fenêtre change de taille (plan B) et
// quand les polices finissent de charger.
export function useFitScale(fitKey: string, options: FitOptions): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null)
  const { variables, boxes, texts = '', includeRoot = false } = options
  const variablesKey = variables.join(',')

  useLayoutEffect(() => {
    const names = variablesKey.split(',')
    const settings: FitOptions = { variables: names, boxes, texts, includeRoot }
    const fit = () => {
      const root = ref.current
      if (!root) return
      names.forEach((name) => root.style.setProperty(name, '1'))
      for (const name of names) {
        let scale = 1
        for (let step = 0; step < MAX_STEPS && overflows(root, settings); step++) {
          scale -= STEP
          root.style.setProperty(name, scale.toFixed(2))
        }
      }
    }
    fit()
    window.addEventListener('resize', fit)
    document.fonts?.addEventListener('loadingdone', fit)
    return () => {
      window.removeEventListener('resize', fit)
      document.fonts?.removeEventListener('loadingdone', fit)
    }
  }, [fitKey, variablesKey, boxes, texts, includeRoot])

  return ref
}
