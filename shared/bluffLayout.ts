// Bluff : mise en page des choix sur la TV (vote et révélation). Les choix sont des phrases de 100
// caractères au plus, de 2 à 21 (20 joueurs et la vraie réponse) : une ou deux colonnes, et une seule
// taille de texte pour tous. On garde la plus grande taille dont la hauteur estimée tient à l'écran ;
// si elle ne tient qu'en libérant de la place, l'écran est « serré » (question ou titre réduits).
// Toutes les mesures sont en rem : la TV mesure 36 rem de haut (1 rem = 30 px en 1080p, 20 px en 720p).

export type BluffTextSize = 'xl' | 'l' | 'm' | 's' | 'xs'
export type BluffLayoutMode = 'vote' | 'reveal'

export interface BluffChoicesLayout {
  columns: 1 | 2
  size: BluffTextSize
  // Écran serré : moins de décor autour des choix (voir les écrans de la TV).
  crowded: boolean
}

interface SizeMetrics {
  font: number
  lineHeight: number
  // Marges intérieures d'une carte, en em.
  padY: number
  padX: number
  // Espace entre deux rangées.
  gap: number
}

// Mêmes valeurs que receiver/src/components/BluffChoices.css.
export const BLUFF_SIZE_METRICS: Record<BluffTextSize, SizeMetrics> = {
  xl: { font: 1.6, lineHeight: 1.2, padY: 0.55, padX: 1, gap: 0.7 },
  l: { font: 1.35, lineHeight: 1.2, padY: 0.55, padX: 1, gap: 0.7 },
  m: { font: 1.15, lineHeight: 1.2, padY: 0.55, padX: 1, gap: 0.55 },
  s: { font: 0.95, lineHeight: 1.2, padY: 0.35, padX: 0.8, gap: 0.4 },
  xs: { font: 0.66, lineHeight: 1.12, padY: 0.12, padX: 0.7, gap: 0.15 },
}

const SIZES: readonly BluffTextSize[] = ['xl', 'l', 'm', 's', 'xs']

// Largeur utile de l'écran (16:9, marges de 5 %) et espace entre les deux colonnes.
const CONTENT_WIDTH = 57.6
const COLUMN_GAP = 1
// Largeur moyenne d'un caractère de Nunito Black, avec une marge de sécurité (en em).
const CHAR_WIDTH = 0.5
// Lettre du choix et son espace (en em) ; révélation : votants à droite et étiquette sous le texte.
const LETTER_WIDTH = 1.8
const REVEAL_VOTERS_WIDTH = 6
const REVEAL_TAG_HEIGHT = 0.85

// Hauteur disponible pour les choix, selon l'écran et s'il est serré.
const BUDGETS: Record<BluffLayoutMode, { normal: number; crowded: number }> = {
  vote: { normal: 15.5, crowded: 22 },
  reveal: { normal: 15, crowded: 18.5 },
}

// Peu de choix et des phrases longues : une colonne, pour garder le texte grand et sur peu de lignes.
const ONE_COLUMN_MAX_CHOICES = 3
const ONE_COLUMN_MIN_LENGTH = 41

export function estimatedHeight(texts: readonly string[], columns: 1 | 2, size: BluffTextSize, mode: BluffLayoutMode): number {
  const { font, lineHeight, padY, padX, gap } = BLUFF_SIZE_METRICS[size]
  const longest = Math.max(1, ...texts.map((text) => text.length))
  const columnWidth = (CONTENT_WIDTH - (columns - 1) * COLUMN_GAP) / columns
  const sideEm = 2 * padX + LETTER_WIDTH + (mode === 'reveal' ? REVEAL_VOTERS_WIDTH : 0)
  const charsPerLine = Math.max(1, Math.floor((columnWidth - font * sideEm) / (font * CHAR_WIDTH)))
  const lines = Math.ceil(longest / charsPerLine)
  const rowHeight = font * (lines * lineHeight + 2 * padY + (mode === 'reveal' ? REVEAL_TAG_HEIGHT : 0))
  const rows = Math.ceil(texts.length / columns)
  return rows * rowHeight + (rows - 1) * gap
}

// Révélation : au plus BLUFF_REVEAL_WINDOW choix à l'écran (avec leur auteur et leurs votants, ils ne
// tiennent pas tous quand ils sont nombreux) ; la mise en page se calcule sur les plus longs d'entre eux.
export const BLUFF_REVEAL_WINDOW = 8

export function bluffRevealLayout(texts: readonly string[]): BluffChoicesLayout {
  const longest = [...texts].sort((a, b) => b.length - a.length).slice(0, BLUFF_REVEAL_WINDOW)
  return bluffChoicesLayout(longest, 'reveal')
}

export function bluffChoicesLayout(texts: readonly string[], mode: BluffLayoutMode = 'vote'): BluffChoicesLayout {
  const longest = Math.max(0, ...texts.map((text) => text.length))
  const columns = texts.length <= ONE_COLUMN_MAX_CHOICES && longest >= ONE_COLUMN_MIN_LENGTH ? 1 : 2
  const budget = BUDGETS[mode]
  // La plus grande taille qui tient : d'abord sans toucher à l'écran, sinon avec l'écran serré.
  for (const size of SIZES) {
    const height = estimatedHeight(texts, columns, size, mode)
    if (height <= budget.normal) return { columns, size, crowded: false }
    if (height <= budget.crowded) return { columns, size, crowded: true }
  }
  return { columns, size: 'xs', crowded: true }
}
