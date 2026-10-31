// Taille d'un libellé de bouton qui doit tenir sur maxLines lignes, calculée sans laisser le système réduire
// la police (sur iOS, React Native réduit les lettres mais garde la hauteur prévue pour la taille d'origine
// et dessine le texte en haut de cette boîte : pastille trop haute, texte collé en haut).

// Largeur moyenne d'un caractère, en part de la taille de police, mesurée sur des libellés de l'app
// (Bowlby One en majuscules : 0,63 à 0,72 ; Nunito Black : plus étroite), avec une petite marge.
export const DISPLAY_CHAR_WIDTH = 0.74
export const TEXT_CHAR_WIDTH = 0.62

export const LABEL_MIN_SCALE = 0.7
// Bouton d'une seule ligne à hauteur fixe (« REPRENDRE LA PARTIE 6J2R ») : il ne peut pas passer sur deux
// lignes, la police descend plus bas pour que le dernier mot (le code) reste visible.
export const SINGLE_LINE_MIN_SCALE = 0.5
const SCALE_STEP = 0.05

// Lignes nécessaires pour ce texte, coupé aux espaces, à cette largeur de caractère (pixels) dans cette largeur.
function linesNeeded(text: string, charWidth: number, width: number): number {
  let lines = 1
  let used = 0
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const wordWidth = word.length * charWidth
    const withSpace = used === 0 ? wordWidth : used + charWidth + wordWidth
    if (withSpace <= width) {
      used = withSpace
      continue
    }
    // Mot plus long que la ligne : il s'étale sur plusieurs lignes (le système le coupe).
    const wordLines = Math.max(1, Math.ceil(wordWidth / width))
    lines += used === 0 ? wordLines - 1 : wordLines
    used = wordWidth - (wordLines - 1) * width
  }
  return lines
}

// Échelle (1, puis par pas jusqu'à LABEL_MIN_SCALE) pour que le texte tienne sur maxLines lignes. fontSize :
// taille réellement rendue (police du système comprise). Largeur inconnue (0) : 1.
export function fittedLabelScale(
  text: string,
  width: number,
  fontSize: number,
  maxLines: number,
  charRatio: number,
  minScale = LABEL_MIN_SCALE,
): number {
  if (width <= 0) return 1
  let scale = 1
  while (scale > minScale && linesNeeded(text, fontSize * scale * charRatio, width) > maxLines) {
    scale = Math.max(minScale, scale - SCALE_STEP)
  }
  return Math.round(scale * 100) / 100
}

// Titre mesuré : morceaux coupables (mots, ou parties d'un mot après un trait d'union), avec leur largeur
// réelle à la taille size et spaced (true : précédé d'une espace, de largeur space). Plus grande taille, par pas
// d'un demi-point jusqu'à minSize, pour laquelle le titre tient en entier sur maxLines lignes sans couper un
// morceau. Largeur inconnue (0) : size.
export interface MeasuredPiece {
  width: number
  spaced: boolean
}

const MEASURED_SIZE_STEP = 0.5

function measuredLines(pieces: readonly MeasuredPiece[], space: number, width: number): number {
  let lines = 1
  let used = 0
  for (const piece of pieces) {
    if (piece.width > width) return Infinity
    const withPiece = used === 0 ? piece.width : used + (piece.spaced ? space : 0) + piece.width
    if (withPiece <= width) {
      used = withPiece
    } else {
      lines += 1
      used = piece.width
    }
  }
  return lines
}

export function fittedMeasuredSize(pieces: readonly MeasuredPiece[], space: number, width: number, size: number, maxLines: number, minSize: number): number {
  if (width <= 0 || pieces.length === 0) return size
  for (let candidate = size; candidate > minSize; candidate -= MEASURED_SIZE_STEP) {
    const ratio = candidate / size
    const scaled = pieces.map((piece) => ({ width: piece.width * ratio, spaced: piece.spaced }))
    if (measuredLines(scaled, space * ratio, width) <= maxLines) return candidate
  }
  return minSize
}

// Morceaux coupables d'un titre : coupé aux espaces, et après chaque trait d'union (là où l'écran peut aussi
// passer à la ligne).
export function breakablePieces(text: string): { text: string; spaced: boolean }[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word, wordIndex) => (word.match(/[^-]+-?|-/g) ?? [word]).map((part, partIndex) => ({ text: part, spaced: wordIndex > 0 && partIndex === 0 })))
}
