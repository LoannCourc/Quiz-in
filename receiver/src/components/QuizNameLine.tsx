import { useLayoutEffect, useState } from 'react'

import { usePlayedQuizNameText } from '../lib/playedQuizName'
import './QuizNameLine.css'

const STEP = 0.04
const MIN_SCALE = 0.5

// Taille réduite par pas (jusqu'à MIN_SCALE) tant que le texte dépasse sa place.
function fit(box: HTMLElement): void {
  const text = box.firstElementChild as HTMLElement | null
  if (!text) return
  let scale = 1
  box.style.setProperty('--quiz-name-scale', '1')
  while (scale > MIN_SCALE && text.scrollWidth > text.clientWidth + 1) {
    scale -= STEP
    box.style.setProperty('--quiz-name-scale', scale.toFixed(2))
  }
}

// Quiz fixe ou blind test joué (« Électro des années 80 · Moyen ») : salon (sous le logo), bandeau des écrans
// de jeu (petit texte), écran de fin (coin haut gauche, hors de la mise en page du podium). Une ligne,
// réduite tant qu'elle ne tient pas, recalculée quand la place change (taille de l'écran, polices, voisins
// du bandeau) ; rien pour le Bluff, Dessine-moi ou une partie par thèmes.
export function QuizNameLine({ place }: { place: 'lobby' | 'header' | 'end' }) {
  const name = usePlayedQuizNameText()
  const [box, setBox] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const container = box?.parentElement
    if (!box || !container) return
    const refit = () => fit(box)
    refit()
    const observer = new ResizeObserver(refit)
    observer.observe(container)
    document.fonts?.addEventListener('loadingdone', refit)
    return () => {
      observer.disconnect()
      document.fonts?.removeEventListener('loadingdone', refit)
    }
  }, [box, name])

  if (!name) return null
  return (
    <span ref={setBox} className={`quiz-name quiz-name-${place}`}>
      <span className="quiz-name-text">{name}</span>
    </span>
  )
}
