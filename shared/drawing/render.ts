import type { DrawingDoc, DrawOp } from './encoding'
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, GRID_SCALE, STROKE_WIDTHS } from './palette'

// Peinture d'un dessin sur un canvas 2D (téléphone du dessinateur et TV). Incrémentale : seules les
// nouvelles opérations, et les nouveaux points du dernier trait, sont peints ; tout est repeint quand
// une opération disparaît (annuler). Partie du contexte 2D utilisée (le vrai contexte convient tel quel).
export interface DrawSurface {
  fillStyle: unknown
  strokeStyle: unknown
  lineWidth: number
  lineCap: 'butt' | 'round' | 'square'
  lineJoin: 'bevel' | 'miter' | 'round'
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  stroke(): void
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void
  fill(): void
  fillRect(x: number, y: number, width: number, height: number): void
}

// Un segment de seau déborde d'un point logique de chaque côté : il recouvre le bord adouci du trait
// voisin au lieu de laisser un liseré blanc entre les deux.
const FILL_OVERLAP = 1

export class DrawingRenderer {
  private revision = -1
  private drawnOps = 0
  // Longueur déjà peinte (points ou segments) de la dernière opération peinte, qui peut encore grandir.
  private drawnLength = 0
  // Durée du dernier rendu et du dernier « tout repeindre » (ms) : mesures du banc d'essai.
  lastRenderMs = 0
  lastFullRenderMs = 0

  private readonly surface: DrawSurface
  // Pixels du canvas par point logique.
  private readonly scale: number
  private readonly now: () => number

  constructor(surface: DrawSurface, scale: number, now: () => number = () => Date.now()) {
    this.surface = surface
    this.scale = scale
    this.now = now
  }

  render(doc: DrawingDoc): void {
    const startedAt = this.now()
    const { ops } = doc
    if (doc.revision !== this.revision || ops.length < this.drawnOps) {
      this.repaint(ops)
      this.revision = doc.revision
      this.lastFullRenderMs = this.now() - startedAt
    } else {
      if (this.drawnOps > 0) this.drawGrowth(ops[this.drawnOps - 1])
      for (let index = this.drawnOps; index < ops.length; index++) this.drawOp(ops[index], 0)
    }
    this.remember(ops)
    this.lastRenderMs = this.now() - startedAt
  }

  // Tout repeindre, en partant du dernier « tout effacer ».
  repaint(ops: readonly DrawOp[]): void {
    let start = 0
    ops.forEach((op, index) => {
      if (op.kind === 'clear') start = index + 1
    })
    this.paintBackground()
    for (let index = start; index < ops.length; index++) this.drawOp(ops[index], 0)
    this.remember(ops)
  }

  private remember(ops: readonly DrawOp[]): void {
    this.drawnOps = ops.length
    const last = ops[ops.length - 1]
    this.drawnLength = !last || last.kind === 'clear' ? 0 : last.kind === 'stroke' ? last.points.length : last.spans.length
  }

  private paintBackground(): void {
    this.surface.fillStyle = DRAW_COLORS[BACKGROUND_COLOR]
    this.surface.fillRect(0, 0, DRAW_WIDTH * this.scale, DRAW_HEIGHT * this.scale)
  }

  private drawGrowth(op: DrawOp): void {
    if (op.kind === 'stroke' && op.points.length > this.drawnLength) this.drawStroke(op, Math.max(0, this.drawnLength - 2))
    if (op.kind === 'fill' && op.spans.length > this.drawnLength) this.drawSpans(op, this.drawnLength)
  }

  // from : indice du premier nombre à peindre (points ou segments).
  private drawOp(op: DrawOp, from: number): void {
    if (op.kind === 'clear') this.paintBackground()
    else if (op.kind === 'stroke') this.drawStroke(op, from)
    else this.drawSpans(op, from)
  }

  private drawStroke(op: Extract<DrawOp, { kind: 'stroke' }>, from: number): void {
    const { surface, scale } = this
    const { points } = op
    const width = STROKE_WIDTHS[op.width] * scale
    const color = DRAW_COLORS[op.color]
    if (points.length === 2) {
      surface.fillStyle = color
      surface.beginPath()
      surface.arc(points[0] * scale, points[1] * scale, width / 2, 0, Math.PI * 2)
      surface.fill()
      return
    }
    surface.strokeStyle = color
    surface.lineWidth = width
    surface.lineCap = 'round'
    surface.lineJoin = 'round'
    surface.beginPath()
    surface.moveTo(points[from] * scale, points[from + 1] * scale)
    for (let index = from + 2; index < points.length; index += 2) surface.lineTo(points[index] * scale, points[index + 1] * scale)
    surface.stroke()
  }

  private drawSpans(op: Extract<DrawOp, { kind: 'fill' }>, from: number): void {
    const { surface, scale } = this
    surface.fillStyle = DRAW_COLORS[op.color]
    const { spans } = op
    for (let index = from; index < spans.length; index += 3) {
      const x = spans[index + 1] * GRID_SCALE - FILL_OVERLAP
      const y = spans[index] * GRID_SCALE - FILL_OVERLAP
      surface.fillRect(x * scale, y * scale, (spans[index + 2] * GRID_SCALE + FILL_OVERLAP * 2) * scale, (GRID_SCALE + FILL_OVERLAP * 2) * scale)
    }
  }
}
