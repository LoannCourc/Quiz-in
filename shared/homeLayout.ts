// Accueil de l'hôte (« À quoi on joue ? ») sans défilement : les 4 tuiles prennent la hauteur restante. La
// densité des tuiles se choisit d'après la hauteur mesurée de leur zone et la police du système. Jamais de
// défilement (les liens « À propos » et « Confidentialité » restent visibles en bas, exigence des stores) :
// si même la densité serrée ne tient pas, tuiles minimales, sans la phrase d'explication.

export type HomeTileDensity = 'normal' | 'medium' | 'tight' | 'minimal'

export interface HomeTileMetrics {
  disc: number
  icon: number
  padding: number
  gap: number
}

export const HOME_TILE_METRICS: Record<HomeTileDensity, HomeTileMetrics> = {
  normal: { disc: 64, icon: 34, padding: 24, gap: 8 },
  medium: { disc: 52, icon: 28, padding: 14, gap: 6 },
  tight: { disc: 36, icon: 20, padding: 6, gap: 3 },
  minimal: { disc: 28, icon: 16, padding: 4, gap: 2 },
}

// Tuiles minimales : le nom seul, sans la phrase d'explication.
export function showsTileHint(density: HomeTileDensity): boolean {
  return density !== 'minimal'
}

const DENSITIES: readonly HomeTileDensity[] = ['normal', 'medium', 'tight', 'minimal']
// Nom (20 points) sur une ligne, phrase (14 points) sur deux lignes au plus, hauteurs de ligne comprises.
const NAME_LINE = 27
const HINT_LINE = 19
const HINT_LINES = 2
// Bords de la tuile (4 + 4).
const BORDERS = 8
// Police du système plafonnée sur les libellés des tuiles (ButtonLabel).
const MAX_FONT_SCALE = 1.4
// Écart entre les deux rangées de tuiles, et hauteur maximale d'une tuile (grand écran).
export const HOME_ROWS_GAP = 16
export const HOME_TILE_MAX_HEIGHT = 230

export function homeTileHeightNeeded(density: HomeTileDensity, fontScale: number): number {
  const { disc, padding, gap } = HOME_TILE_METRICS[density]
  const scale = Math.min(Math.max(fontScale, 1), MAX_FONT_SCALE)
  const hintLines = showsTileHint(density) ? HINT_LINES : 0
  return 2 * padding + disc + 2 * gap + (NAME_LINE + hintLines * HINT_LINE) * scale + BORDERS
}

// Densité la plus confortable qui tient dans la zone des tuiles (deux rangées) ; minimale si rien ne tient.
// null : mesure inutilisable (zone pas encore dessinée), à ignorer.
export function homeTileDensity(gridHeight: number, fontScale: number): HomeTileDensity | null {
  if (!Number.isFinite(gridHeight) || gridHeight <= 0) return null
  const tileHeight = (gridHeight - HOME_ROWS_GAP) / 2
  return DENSITIES.find((density) => homeTileHeightNeeded(density, fontScale) <= tileHeight) ?? 'minimal'
}

// Sous cette hauteur de fenêtre, accueil compact : sous-titre effacé, logo réduit, titre, bouton
// « J'ai un code » plus petits.
export const HOME_COMPACT_BELOW_HEIGHT = 760

// Écart entre les blocs de l'accueil, réduit par paliers sur un écran bas.
export function homeBlockGap(windowHeight: number): number {
  if (windowHeight >= 760) return 24
  if (windowHeight >= 640) return 12
  return 8
}
