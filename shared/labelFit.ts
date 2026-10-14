// Taille d'un libellé de bouton qui doit tenir sur maxLines lignes, calculée sans laisser le système réduire
// la police (sur iOS, React Native réduit les lettres mais garde la hauteur prévue pour la taille d'origine
// et dessine le texte en haut de cette boîte : pastille trop haute, texte collé en haut).

// Largeur moyenne d'un caractère, en part de la taille de police, mesurée sur des libellés de l'app
// (Bowlby One en majuscules : 0,63 à 0,72 ; Nunito Black : plus étroite), avec une petite marge.
export const DISPLAY_CHAR_WIDTH = 0.74
export const TEXT_CHAR_WIDTH = 0.62

export const LABEL_MIN_SCALE = 0.7
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
export function fittedLabelScale(text: string, width: number, fontSize: number, maxLines: number, charRatio: number): number {
  if (width <= 0) return 1
  let scale = 1
  while (scale > LABEL_MIN_SCALE && linesNeeded(text, fontSize * scale * charRatio, width) > maxLines) {
    scale = Math.max(LABEL_MIN_SCALE, scale - SCALE_STEP)
  }
  return Math.round(scale * 100) / 100
}
