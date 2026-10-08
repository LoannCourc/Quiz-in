import { DrawingDoc, DrawingWriter } from './encoding'
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, STROKE_WIDTHS } from './palette'
import { floodFill, rasterize } from './raster'
import { svgShapes, type SvgShape } from './svg'

// Trait en cours, tel qu'affiché avant l'envoi (ligne brisée ; un seul point : un disque).
export interface LiveStrokeView {
  d: string
  color: string
  width: number
  dot: { cx: number; cy: number } | null
}

// Ce que l'écran affiche, figé : un nouvel objet à chaque changement, jamais modifié ensuite. Le compilateur
// React (app.json, reactCompiler) garde le rendu tant que ses données gardent la même identité : un objet
// modifié en place ne serait jamais redessiné (traits de l'hôte effacés au lever du doigt, lot C).
export interface CanvasSnapshot {
  shapes: readonly SvgShape[]
  live: LiveStrokeView | null
}

// Canvas de l'app (hôte qui dessine, react-native-svg) hors de React : le dessin envoyé, l'écriture des
// paquets, le trait en cours. Même format et mêmes paquets que le canvas du navigateur.
export class LiveCanvas {
  private readonly doc = new DrawingDoc()
  private readonly writer: DrawingWriter
  private size = { width: 1, height: 1 }
  private livePoints: number[] | null = null
  private liveStyle = { color: 0, width: 0 }
  private shapes: readonly SvgShape[]
  private current: CanvasSnapshot

  constructor(initialChunks: readonly string[]) {
    for (const data of initialChunks) this.doc.applyChunk(data)
    this.writer = new DrawingWriter(this.doc)
    this.shapes = svgShapes(this.doc.ops)
    this.current = { shapes: this.shapes, live: null }
  }

  // Dernier état affichable : le même objet tant que rien n'a changé.
  snapshot(): CanvasSnapshot {
    return this.current
  }

  setSize(width: number, height: number): void {
    this.size = { width: Math.max(1, width), height: Math.max(1, height) }
  }

  // Position du doigt dans la vue → point logique (640 × 480), bornée au dessin.
  toLogical(x: number, y: number): { x: number; y: number } {
    const logicalX = Math.round((x / this.size.width) * DRAW_WIDTH)
    const logicalY = Math.round((y / this.size.height) * DRAW_HEIGHT)
    return { x: Math.max(0, Math.min(DRAW_WIDTH, logicalX)), y: Math.max(0, Math.min(DRAW_HEIGHT, logicalY)) }
  }

  // Trait au crayon (couleur) ou à la gomme (fond).
  beginStroke(color: number, width: number, x: number, y: number, isEraser = false): void {
    const strokeColor = isEraser ? BACKGROUND_COLOR : color
    this.writer.beginStroke(strokeColor, width, x, y)
    this.livePoints = [x, y]
    this.liveStyle = { color: strokeColor, width }
    this.refreshLive()
  }

  extendStroke(x: number, y: number): void {
    if (!this.livePoints) return
    this.livePoints.push(x, y)
    this.writer.extendStroke(x, y)
    this.refreshLive()
  }

  // Fin du trait : il passe dans le dessin envoyé (paquets rendus par flush).
  endStroke(): { seq: number; data: string }[] {
    if (!this.livePoints) return []
    this.livePoints = null
    this.writer.endStroke()
    return this.flush()
  }

  // Seau : la zone du dessin envoyé (même grille que le navigateur et la TV).
  fill(color: number, x: number, y: number): { seq: number; data: string }[] {
    this.writer.endStroke()
    this.flush()
    const spans = floodFill(rasterize(this.doc.ops), x, y, color)
    if (spans) this.writer.fill(color, spans)
    return this.flush()
  }

  undo(): { seq: number; data: string }[] {
    this.writer.undo()
    return this.flush()
  }

  clear(): { seq: number; data: string }[] {
    this.writer.clear()
    return this.flush()
  }

  // Paquets prêts à envoyer, appliqués au dessin affiché (nouvel état figé s'il y en a).
  flush(): { seq: number; data: string }[] {
    const chunks = this.writer.flush()
    if (chunks.length === 0) return chunks
    for (const chunk of chunks) this.doc.applyChunk(chunk.data)
    this.shapes = svgShapes(this.doc.ops)
    this.current = { shapes: this.shapes, live: this.current.live }
    if (!this.livePoints) this.current = { shapes: this.shapes, live: null }
    return chunks
  }

  private refreshLive(): void {
    const points = this.livePoints
    const color = DRAW_COLORS[this.liveStyle.color]
    const width = STROKE_WIDTHS[this.liveStyle.width]
    if (!points) {
      this.current = { shapes: this.shapes, live: null }
      return
    }
    let d = `M${points[0]} ${points[1]}`
    for (let index = 2; index < points.length; index += 2) d += `L${points[index]} ${points[index + 1]}`
    const dot = points.length <= 2 ? { cx: points[0], cy: points[1] } : null
    this.current = { shapes: this.shapes, live: { d, color, width, dot } }
  }
}
