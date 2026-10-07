import type { Difficulty } from './types'

// Mots de Dessine-moi. PROVISOIRE (lot 2) : une dizaine de mots pour essayer le dessin en vraie partie ;
// la liste d'environ 200 mots, par catégories, arrive au lot 4 (relecture docs/relecture-dessine-moi.md).
export interface DrawWord {
  word: string
  category: string
  difficulty: Difficulty
}

export const DRAW_WORDS: readonly DrawWord[] = [
  { word: 'maison', category: 'Objet', difficulty: 1 },
  { word: 'chat', category: 'Animal', difficulty: 1 },
  { word: 'soleil', category: 'Nature', difficulty: 1 },
  { word: 'vélo', category: 'Transport', difficulty: 1 },
  { word: 'pomme', category: 'Nourriture', difficulty: 1 },
  { word: 'girafe', category: 'Animal', difficulty: 2 },
  { word: 'parapluie', category: 'Objet', difficulty: 2 },
  { word: 'fusée', category: 'Transport', difficulty: 2 },
  { word: 'arc-en-ciel', category: 'Nature', difficulty: 2 },
  { word: 'gâteau', category: 'Nourriture', difficulty: 1 },
]
