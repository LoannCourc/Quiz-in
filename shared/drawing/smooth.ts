// Tracé lissé d'un trait (Dessine-moi) : les points envoyés sont simplifiés (simplify.ts), on les relie par
// des courbes quadratiques qui passent par le milieu de chaque segment, le point lui-même servant de point
// de contrôle. Pour p0 … pn : p0 → milieu(p0, p1), puis une courbe par point intérieur jusqu'au milieu
// suivant, puis la « queue » milieu(pn-1, pn) → pn, tracée quand le trait est fini.
// Même règle partout : la TV et le téléphone peignent ces courbes (render.ts), la grille du seau suit les
// mêmes courbes échantillonnées (raster.ts), le seau donne donc la même zone des deux côtés.

// Pas d'échantillonnage d'une courbe pour la grille du seau (points logiques).
const SAMPLE_STEP = 3

export interface CurveSink {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void
}

const midX = (points: readonly number[], index: number) => (points[index * 2] + points[index * 2 + 2]) / 2
const midY = (points: readonly number[], index: number) => (points[index * 2 + 1] + points[index * 2 + 3]) / 2

// Partie du tracé entre la fin déjà peinte (fromPoint points pris en compte) et toPoint points, sans la
// queue. Rien à faire sous deux points, ni si rien de neuf.
export function traceCurves(points: readonly number[], fromPoint: number, toPoint: number, sink: CurveSink, scale: number): boolean {
  if (toPoint < 2 || toPoint <= fromPoint) return false
  let next: number
  if (fromPoint <= 1) {
    sink.moveTo(points[0] * scale, points[1] * scale)
    sink.lineTo(midX(points, 0) * scale, midY(points, 0) * scale)
    next = 1
  } else {
    sink.moveTo(midX(points, fromPoint - 2) * scale, midY(points, fromPoint - 2) * scale)
    next = fromPoint - 1
  }
  for (let index = next; index <= toPoint - 2; index++) {
    const x = points[index * 2] * scale
    const y = points[index * 2 + 1] * scale
    const toX = midX(points, index) * scale
    const toY = midY(points, index) * scale
    // Coin franc (carré, toit) : on passe par le point lui-même, sinon la courbe arrondirait le coin.
    if (isSharpCorner(points, index)) {
      sink.lineTo(x, y)
      sink.lineTo(toX, toY)
    } else {
      sink.quadraticCurveTo(x, y, toX, toY)
    }
  }
  return true
}

// Changement de direction au-delà duquel un point est un coin (cosinus de 60°).
const CORNER_COSINE = Math.cos(Math.PI / 3)

function isSharpCorner(points: readonly number[], index: number): boolean {
  const inX = points[index * 2] - points[index * 2 - 2]
  const inY = points[index * 2 + 1] - points[index * 2 - 1]
  const outX = points[index * 2 + 2] - points[index * 2]
  const outY = points[index * 2 + 3] - points[index * 2 + 1]
  const lengths = Math.hypot(inX, inY) * Math.hypot(outX, outY)
  return lengths > 0 && (inX * outX + inY * outY) / lengths < CORNER_COSINE
}

// Queue du trait (toPoint points) : du dernier milieu au dernier point.
export function traceTail(points: readonly number[], toPoint: number, sink: CurveSink, scale: number): void {
  if (toPoint < 2) return
  sink.moveTo(midX(points, toPoint - 2) * scale, midY(points, toPoint - 2) * scale)
  sink.lineTo(points[toPoint * 2 - 2] * scale, points[toPoint * 2 - 1] * scale)
}

// Trait complet (queue comprise) en ligne brisée fine : grille du seau.
export function sampleStroke(points: readonly number[]): number[] {
  const result: number[] = []
  const sink: CurveSink = {
    moveTo: (x, y) => {
      if (result.length === 0) result.push(x, y)
    },
    lineTo: (x, y) => result.push(x, y),
    quadraticCurveTo: (cx, cy, x, y) => {
      const ax = result[result.length - 2]
      const ay = result[result.length - 1]
      const steps = Math.max(2, Math.ceil(Math.hypot(x - ax, y - ay) / SAMPLE_STEP))
      for (let step = 1; step <= steps; step++) {
        const t = step / steps
        const u = 1 - t
        result.push(u * u * ax + 2 * u * t * cx + t * t * x, u * u * ay + 2 * u * t * cy + t * t * y)
      }
    },
  }
  const count = points.length / 2
  if (count < 2) return [...points]
  traceCurves(points, 0, count, sink, 1)
  // La queue part du dernier milieu, déjà dans la ligne : seul son point d'arrivée compte.
  result.push(points[count * 2 - 2], points[count * 2 - 1])
  return result
}
