import { DrawingDoc, DrawingWriter } from './encoding'
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, STROKE_WIDTHS } from './palette'
import { floodFill, rasterize } from './raster'
import { svgShapes, type SvgShape } from './svg'
import { FIT_VIEWPORT, clampViewport, screenToDrawing, type Viewport } from './viewport'

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
  // Zoom (affichage seulement) : partie visible du dessin.
  view: Viewport
}

type Chunk = { seq: number; data: string }

// Canvas de l'app (hôte qui dessine, react-native-svg) hors de React : le dessin envoyé, l'écriture des
// paquets, le trait en cours et le zoom. Même format et mêmes paquets que le canvas du navigateur.
// Le début d'un trait est gardé ici (pas encore écrit) : un second doigt arrivé tout de suite (pincement)
// l'annule sans rien envoyer.
export class LiveCanvas {
  private readonly doc = new DrawingDoc()
  private readonly writer: DrawingWriter
  private size = { width: 1, height: 1 }
  private livePoints: number[] | null = null
  private isCommitted = false
  private liveStyle = { color: 0, width: 0 }
  private shapes: readonly SvgShape[]
  private current: CanvasSnapshot

  constructor(initialChunks: readonly string[]) {
    for (const data of initialChunks) this.doc.applyChunk(data)
    this.writer = new DrawingWriter(this.doc)
    this.shapes = svgShapes(this.doc.ops)
    this.current = { shapes: this.shapes, live: null, view: FIT_VIEWPORT }
  }

  // Dernier état affichable : le même objet tant que rien n'a changé.
  snapshot(): CanvasSnapshot {
    return this.current
  }

  setSize(width: number, height: number): void {
    this.size = { width: Math.max(1, width), height: Math.max(1, height) }
  }

  frame(): { width: number; height: number } {
    return this.size
  }

  setView(view: Viewport): void {
    this.current = { ...this.current, view: clampViewport(view) }
  }

  // Position du doigt dans la vue → point logique (640 × 480), selon le zoom, bornée au dessin.
  toLogical(x: number, y: number): { x: number; y: number } {
    const point = screenToDrawing(this.current.view, { x, y }, this.size)
    return {
      x: Math.max(0, Math.min(DRAW_WIDTH, Math.round(point.x))),
      y: Math.max(0, Math.min(DRAW_HEIGHT, Math.round(point.y))),
    }
  }

  // Trait au crayon (couleur) ou à la gomme (fond). hold : début gardé, écrit par commitStroke (ou à la fin).
  beginStroke(color: number, width: number, x: number, y: number, isEraser = false, hold = false): void {
    const strokeColor = isEraser ? BACKGROUND_COLOR : color
    this.livePoints = [x, y]
    this.liveStyle = { color: strokeColor, width }
    this.isCommitted = false
    if (!hold) this.commitStroke()
    this.refreshLive()
  }

  // Début gardé devenu un vrai trait : écrit d'un coup, la suite s'écrit au fil du doigt.
  commitStroke(): void {
    const points = this.livePoints
    if (!points || this.isCommitted) return
    this.writer.beginStroke(this.liveStyle.color, this.liveStyle.width, points[0], points[1])
    for (let index = 2; index < points.length; index += 2) this.writer.extendStroke(points[index], points[index + 1])
    this.isCommitted = true
  }

  // Second doigt arrivé pendant le début gardé : le trait disparaît, rien n'est envoyé.
  cancelStroke(): void {
    if (!this.livePoints || this.isCommitted) return
    this.livePoints = null
    this.refreshLive()
  }

  get hasPendingStroke(): boolean {
    return this.livePoints !== null && !this.isCommitted
  }

  extendStroke(x: number, y: number): void {
    if (!this.livePoints) return
    this.livePoints.push(x, y)
    if (this.isCommitted) this.writer.extendStroke(x, y)
    this.refreshLive()
  }

  // Fin du trait : il passe dans le dessin envoyé (paquets rendus par flush).
  endStroke(): Chunk[] {
    if (!this.livePoints) return []
    this.commitStroke()
    this.livePoints = null
    this.isCommitted = false
    this.writer.endStroke()
    return this.flush()
  }

  // Seau : la zone du dessin envoyé (même grille que le navigateur et la TV).
  fill(color: number, x: number, y: number): Chunk[] {
    this.writer.endStroke()
    this.flush()
    const spans = floodFill(rasterize(this.doc.ops), x, y, color)
    if (spans) this.writer.fill(color, spans)
    return this.flush()
  }

  undo(): Chunk[] {
    this.writer.undo()
    return this.flush()
  }

  clear(): Chunk[] {
    this.writer.clear()
    return this.flush()
  }

  // Paquets prêts à envoyer, appliqués au dessin affiché (nouvel état figé s'il y en a).
  flush(): Chunk[] {
    const chunks = this.writer.flush()
    if (chunks.length === 0) return chunks
    for (const chunk of chunks) this.doc.applyChunk(chunk.data)
    this.shapes = svgShapes(this.doc.ops)
    this.current = { ...this.current, shapes: this.shapes, live: this.livePoints ? this.current.live : null }
    return chunks
  }

  private refreshLive(): void {
    const points = this.livePoints
    if (!points) {
      this.current = { ...this.current, live: null }
      return
    }
    let d = `M${points[0]} ${points[1]}`
    for (let index = 2; index < points.length; index += 2) d += `L${points[index]} ${points[index + 1]}`
    const dot = points.length <= 2 ? { cx: points[0], cy: points[1] } : null
    const live = { d, color: DRAW_COLORS[this.liveStyle.color], width: STROKE_WIDTHS[this.liveStyle.width], dot }
    this.current = { ...this.current, live }
  }
}
