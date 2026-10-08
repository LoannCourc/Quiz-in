import type { DrawOp } from './encoding'
import { DRAW_COLORS, GRID_SCALE, STROKE_WIDTHS } from './palette'
import { traceCurves, traceTail, type CurveSink } from './smooth'

// Dessin en formes SVG (app de l'hôte qui dessine, react-native-svg), en points logiques (640 × 480) :
// mêmes courbes lissées que le canvas du navigateur et la TV (smooth.ts), même dépassement des cases du
// seau que render.ts. Un « tout effacer » efface ce qui précède.
export type SvgShape =
  | { kind: 'stroke'; key: string; d: string; color: string; width: number }
  | { kind: 'dot'; key: string; cx: number; cy: number; r: number; color: string }
  | { kind: 'fill'; key: string; d: string; color: string }

// Les cases du seau débordent d'un point de chaque côté (comme render.ts) : pas de fente entre deux cases.
const FILL_OVERLAP = 1

const round = (value: number) => Math.round(value * 10) / 10

// Chemin SVG d'un trait : courbes jusqu'au dernier milieu, puis la queue jusqu'au dernier point.
export function strokePath(points: readonly number[]): string {
  const parts: string[] = []
  const sink: CurveSink = {
    moveTo: (x, y) => parts.push(`M${round(x)} ${round(y)}`),
    lineTo: (x, y) => parts.push(`L${round(x)} ${round(y)}`),
    quadraticCurveTo: (cx, cy, x, y) => parts.push(`Q${round(cx)} ${round(cy)} ${round(x)} ${round(y)}`),
  }
  const count = points.length / 2
  traceCurves(points, 0, count, sink, 1)
  traceTail(points, count, sink, 1)
  return parts.join('')
}

// Cases d'un seau (lignes y, x, longueur, en cases de la grille) en un seul chemin de rectangles.
function fillPath(spans: readonly number[]): string {
  const parts: string[] = []
  for (let index = 0; index < spans.length; index += 3) {
    const x = spans[index + 1] * GRID_SCALE - FILL_OVERLAP
    const y = spans[index] * GRID_SCALE - FILL_OVERLAP
    const width = spans[index + 2] * GRID_SCALE + FILL_OVERLAP * 2
    parts.push(`M${x} ${y}h${width}v${GRID_SCALE + FILL_OVERLAP * 2}h${-width}z`)
  }
  return parts.join('')
}

function shapeOf(op: Exclude<DrawOp, { kind: 'clear' }>): SvgShape {
  const color = DRAW_COLORS[op.color]
  if (op.kind === 'fill') return { kind: 'fill', key: `f${op.id}`, d: fillPath(op.spans), color }
  const width = STROKE_WIDTHS[op.width]
  if (op.points.length <= 2) return { kind: 'dot', key: `d${op.id}`, cx: op.points[0], cy: op.points[1], r: width / 2, color }
  return { kind: 'stroke', key: `s${op.id}`, d: strokePath(op.points), color, width }
}

// Formes visibles d'un dessin, dans l'ordre de peinture.
export function svgShapes(ops: readonly DrawOp[]): SvgShape[] {
  let start = 0
  ops.forEach((op, index) => {
    if (op.kind === 'clear') start = index + 1
  })
  return ops.slice(start).flatMap((op) => (op.kind === 'clear' ? [] : [shapeOf(op)]))
}
