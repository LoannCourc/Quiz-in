// Dessine-moi (plan docs/plan-dessine-moi.md) : surface logique, palette et épaisseurs communes au
// téléphone du dessinateur et à la TV. Ce sont des données du format de dessin (un index par couleur
// circule dans la base), pas des couleurs d'interface : elles vivent donc ici, pas dans les thèmes.

// Surface logique en entiers, mise à l'échelle par chaque écran (4:3).
export const DRAW_WIDTH = 640
export const DRAW_HEIGHT = 480

// Canvas de la TV : pixels par point logique. 1,5 → 960 × 720 (décision du lot 1 : le bord des seaux
// est trop crénelé à 640 × 480 sur un grand écran). Seul réglage à changer pour redescendre à 1
// (640 × 480) si les mesures en vraie partie, musique active, se dégradent. Les données ne changent pas.
export const TV_DRAW_SCALE = 1.5

// Grille du seau : une case pour 2 × 2 points logiques (320 × 240).
export const GRID_SCALE = 2
export const GRID_WIDTH = DRAW_WIDTH / GRID_SCALE
export const GRID_HEIGHT = DRAW_HEIGHT / GRID_SCALE

// Index 0 : le fond (blanc), aussi couleur de la gomme.
export const BACKGROUND_COLOR = 0
export const DRAW_COLORS: readonly string[] = [
  '#ffffff',
  '#1b1b1f',
  '#8a8a93',
  '#e53935',
  '#fb8c00',
  '#fdd835',
  '#43a047',
  '#29b6f6',
  '#1e40af',
  '#8e24aa',
  '#ec4899',
  '#8d5524',
]

// Trois épaisseurs (diamètre en points logiques) : fine, moyenne, épaisse.
export const STROKE_WIDTHS: readonly number[] = [4, 12, 28]

export function isDrawColor(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < DRAW_COLORS.length
}

export function isStrokeWidth(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < STROKE_WIDTHS.length
}
