import type { DrawOp } from './encoding'
import { BACKGROUND_COLOR, DRAW_COLORS, DRAW_HEIGHT, DRAW_WIDTH, GRID_SCALE, STROKE_WIDTHS } from './palette'
import { traceCurves, traceTail } from './smooth'

// Peinture d'un dessin sur un canvas 2D (téléphone du dessinateur et TV). Incrémentale : seules les
// nouvelles opérations, et les nouveaux points du dernier trait, sont peints ; tout est repeint quand
// une opération disparaît (annuler). Les traits sont des courbes lissées (smooth.ts) ; la « queue » du
// dernier trait (son dernier bout) n'est peinte que quand il est fini : opération suivante, finishLast,
// ou repaint. Partie du contexte 2D utilisée (le vrai contexte convient tel quel).
export interface DrawSurface {
  fillStyle: unknown
  strokeStyle: unknown
  lineWidth: number
  lineCap: 'butt' | 'round' | 'square'
  lineJoin: 'bevel' | 'miter' | 'round'
  beginPath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void
  stroke(): void
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void
  fill(): void
  fillRect(x: number, y: number, width: number, height: number): void
}

// Ce que le renderer peint : les opérations visibles, et un numéro qui change quand des opérations
// disparaissent (DrawingDoc, ou la vue du rejeu lissé de la TV).
export interface DrawingView {
  ops: readonly DrawOp[]
  revision: number
}

// Pointe du crayon (TV, calque au-dessus du dessin, effacé à chaque image) : le bout du trait en cours, que
// le renderer ne peint pas encore. Du dernier milieu peint au dernier point posé (shown points), puis vers
// le point suivant selon fraction (0 à 1). Un seul point posé : un rond, ou le début du segment.
export function paintPenTip(surface: DrawSurface, scale: number, op: StrokeOp, shown: number, fraction: number): void {
  if (shown === 0) return
  const { points } = op
  const width = STROKE_WIDTHS[op.width] * scale
  const color = DRAW_COLORS[op.color]
  const lastX = points[shown * 2 - 2]
  const lastY = points[shown * 2 - 1]
  const hasNext = fraction > 0 && points.length >= shown * 2 + 2
  if (shown === 1 && !hasNext) {
    surface.fillStyle = color
    surface.beginPath()
    surface.arc(lastX * scale, lastY * scale, width / 2, 0, Math.PI * 2)
    surface.fill()
    return
  }
  surface.strokeStyle = color
  surface.lineWidth = width
  surface.lineCap = 'round'
  surface.lineJoin = 'round'
  surface.beginPath()
  if (shown >= 2) traceTail(points, shown, surface, scale)
  else surface.moveTo(lastX * scale, lastY * scale)
  if (hasNext) {
    const x = lastX + (points[shown * 2] - lastX) * fraction
    const y = lastY + (points[shown * 2 + 1] - lastY) * fraction
    surface.lineTo(x * scale, y * scale)
  }
  surface.stroke()
}

// Un segment de seau déborde d'un point logique de chaque côté : il recouvre le bord adouci du trait
// voisin au lieu de laisser un liseré blanc entre les deux.
const FILL_OVERLAP = 1

type StrokeOp = Extract<DrawOp, { kind: 'stroke' }>

export class DrawingRenderer {
  private revision = -1
  private drawnOps = 0
  // Longueur déjà peinte de la dernière opération peinte, qui peut encore grandir : points d'un trait,
  // nombres (3 par segment) d'un seau.
  private drawnLength = 0
  // La dernière opération peinte est finie (queue du trait peinte).
  private isLastClosed = true
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

  render(view: DrawingView): void {
    const startedAt = this.now()
    const { ops } = view
    if (view.revision !== this.revision || ops.length < this.drawnOps) {
      this.paintAll(ops, false)
      this.revision = view.revision
      this.lastFullRenderMs = this.now() - startedAt
    } else {
      const hasNewOps = ops.length > this.drawnOps
      if (this.drawnOps > 0) this.drawGrowth(ops[this.drawnOps - 1], hasNewOps)
      for (let index = this.drawnOps; index < ops.length; index++) this.drawOp(ops[index], index < ops.length - 1)
      if (hasNewOps) this.isLastClosed = false
      this.remember(ops)
    }
    this.lastRenderMs = this.now() - startedAt
  }

  // Le dernier trait est fini (plus rien n'arrive) : sa queue est peinte.
  finishLast(view: DrawingView): void {
    const last = view.ops[this.drawnOps - 1]
    if (this.isLastClosed || !last || last.kind !== 'stroke') return
    this.drawStroke(last, this.drawnLength, this.drawnLength, true)
    this.isLastClosed = true
  }

  // Tout repeindre, en partant du dernier « tout effacer » ; traits finis (queues comprises).
  repaint(ops: readonly DrawOp[]): void {
    this.paintAll(ops, true)
  }

  private paintAll(ops: readonly DrawOp[], closeLast: boolean): void {
    let start = 0
    ops.forEach((op, index) => {
      if (op.kind === 'clear') start = index + 1
    })
    this.paintBackground()
    for (let index = start; index < ops.length; index++) this.drawOp(ops[index], closeLast || index < ops.length - 1)
    this.isLastClosed = closeLast
    this.remember(ops)
  }

  private remember(ops: readonly DrawOp[]): void {
    this.drawnOps = ops.length
    const last = ops[ops.length - 1]
    this.drawnLength = !last || last.kind === 'clear' ? 0 : last.kind === 'stroke' ? last.points.length / 2 : last.spans.length
  }

  private paintBackground(): void {
    this.surface.fillStyle = DRAW_COLORS[BACKGROUND_COLOR]
    this.surface.fillRect(0, 0, DRAW_WIDTH * this.scale, DRAW_HEIGHT * this.scale)
  }

  // Suite de la dernière opération peinte ; close : une opération la suit, le trait est fini.
  private drawGrowth(op: DrawOp, close: boolean): void {
    if (op.kind === 'stroke') {
      const total = op.points.length / 2
      if (total > this.drawnLength || (close && !this.isLastClosed)) this.drawStroke(op, this.drawnLength, total, close)
    }
    if (op.kind === 'fill' && op.spans.length > this.drawnLength) this.drawSpans(op, this.drawnLength)
  }

  private drawOp(op: DrawOp, close: boolean): void {
    if (op.kind === 'clear') this.paintBackground()
    else if (op.kind === 'stroke') this.drawStroke(op, 0, op.points.length / 2, close)
    else this.drawSpans(op, 0)
  }

  // Points fromPoint → toPoint du trait (courbes), puis sa queue si close. Un trait d'un seul point est
  // un rond, peint quand il est fini.
  private drawStroke(op: StrokeOp, fromPoint: number, toPoint: number, close: boolean): void {
    const { surface, scale } = this
    const { points } = op
    const width = STROKE_WIDTHS[op.width] * scale
    const color = DRAW_COLORS[op.color]
    if (toPoint === 1) {
      if (!close) return
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
    const hasCurves = traceCurves(points, fromPoint, toPoint, surface, scale)
    if (close) traceTail(points, toPoint, surface, scale)
    if (hasCurves || close) surface.stroke()
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
