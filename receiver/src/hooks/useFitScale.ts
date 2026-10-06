import { useLayoutEffect, useState } from 'react'

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

// Événement envoyé (en remontant) par l'élément ajusté après chaque ajustement : les colonnes d'équipes
// recomptent alors les membres qui ne tiendraient toujours pas (« +N »).
export const FIT_EVENT = 'fitscale'

// TV : échelles CSS (taille des avatars, des pseudos, du texte…) réduites jusqu'à ce que rien ne déborde
// ni ne soit coupé. Recalculé quand l'élément apparaît à l'écran (référence de rappel : un écran affiché
// après un autre, comme le salon après le tirage, est mesuré à son arrivée), quand fitKey change
// (contenu), quand la fenêtre change de taille (plan B) et quand les polices finissent de charger.
export function useFitScale(fitKey: string, options: FitOptions): (element: HTMLElement | null) => void {
  const [root, setRoot] = useState<HTMLElement | null>(null)
  const { variables, boxes, texts = '', includeRoot = false } = options
  const variablesKey = variables.join(',')

  useLayoutEffect(() => {
    const names = variablesKey.split(',')
    const settings: FitOptions = { variables: names, boxes, texts, includeRoot }
    if (!root) return
    const fit = () => {
      names.forEach((name) => root.style.setProperty(name, '1'))
      for (const name of names) {
        let scale = 1
        for (let step = 0; step < MAX_STEPS && overflows(root, settings); step++) {
          scale -= STEP
          root.style.setProperty(name, scale.toFixed(2))
        }
      }
      root.dispatchEvent(new Event(FIT_EVENT, { bubbles: true }))
    }
    fit()
    window.addEventListener('resize', fit)
    document.fonts?.addEventListener('loadingdone', fit)
    return () => {
      window.removeEventListener('resize', fit)
      document.fonts?.removeEventListener('loadingdone', fit)
    }
  }, [root, fitKey, variablesKey, boxes, texts, includeRoot])

  return setRoot
}
