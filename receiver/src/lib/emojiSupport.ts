// Police emoji de la TV (panneau ?perf=1) : un emoji dessiné sur un petit canvas a des pixels de couleur
// (police emoji couleur), seulement des pixels gris (police noir et blanc), ou aucun (pas de police emoji :
// sans les images d'AvatarGlyph, la pastille de l'avatar resterait vide). Mesuré une fois.
export type EmojiSupport = 'color' | 'mono' | 'none' | 'unknown'

const SIZE = 32
// Écart entre canaux au-delà duquel un pixel est en couleur (pas un gris d'anticrénelage).
const COLOR_GAP = 40

let measured: EmojiSupport | null = null

export function emojiSupport(): EmojiSupport {
  measured ??= measure()
  return measured
}

function measure(): EmojiSupport {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return 'unknown'
    context.textBaseline = 'top'
    context.font = `${SIZE - 8}px sans-serif`
    context.fillStyle = '#000'
    context.fillText('🦊', 0, 0)
    const pixels = context.getImageData(0, 0, SIZE, SIZE).data
    let drawn = false
    for (let index = 0; index < pixels.length; index += 4) {
      const [red, green, blue, alpha] = [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]]
      if (alpha === 0) continue
      drawn = true
      if (Math.max(red, green, blue) - Math.min(red, green, blue) > COLOR_GAP) return 'color'
    }
    return drawn ? 'mono' : 'none'
  } catch {
    return 'unknown'
  }
}
