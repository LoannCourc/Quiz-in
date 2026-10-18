import { createContext, useContext } from 'react'

// Quiz fixe ou blind test joué (« Électro des années 80 · Moyen »), calculé une fois au-dessus des écrans
// (LiveReceiver d'après la fiche du quiz, démo d'après l'adresse) ; null : rien à afficher.
export const PlayedQuizNameContext = createContext<string | null>(null)

export function usePlayedQuizNameText(): string | null {
  return useContext(PlayedQuizNameContext)
}
