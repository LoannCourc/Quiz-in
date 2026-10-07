import type { DrawOp } from './encoding'
import { BACKGROUND_COLOR, GRID_HEIGHT, GRID_SCALE, GRID_WIDTH, STROKE_WIDTHS } from './palette'
import { sampleStroke } from './smooth'

// Grille du seau (320 × 240, une case pour 2 × 2 points logiques) : couleur exacte de chaque case, sans
// lissage, calculée par ce code seulement (téléphone du dessinateur). Le seau s'y remplit, puis la zone
// part en segments : la TV ne fait que les peindre, le résultat est donc le même partout.

export type Grid = Uint8Array

const cellCenter = (cell: number) => cell * GRID_SCALE + GRID_SCALE / 2

function distanceSquaredToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  const x = ax + t * dx - px
  const y = ay + t * dy - py
  return x * x + y * y
}

// Cases dont le centre est à moins d'un demi-trait du segment.
function paintSegment(grid: Grid, color: number, radius: number, ax: number, ay: number, bx: number, by: number): void {
  const minX = Math.max(0, Math.floor((Math.min(ax, bx) - radius) / GRID_SCALE))
  const maxX = Math.min(GRID_WIDTH - 1, Math.floor((Math.max(ax, bx) + radius) / GRID_SCALE))
  const minY = Math.max(0, Math.floor((Math.min(ay, by) - radius) / GRID_SCALE))
  const maxY = Math.min(GRID_HEIGHT - 1, Math.floor((Math.max(ay, by) + radius) / GRID_SCALE))
  const limit = radius * radius
  for (let gy = minY; gy <= maxY; gy++) {
    for (let gx = minX; gx <= maxX; gx++) {
      if (distanceSquaredToSegment(cellCenter(gx), cellCenter(gy), ax, ay, bx, by) <= limit) grid[gy * GRID_WIDTH + gx] = color
    }
  }
}

// Le trait suit les mêmes courbes que l'affichage (smooth.ts), échantillonnées finement.
function paintStroke(grid: Grid, op: Extract<DrawOp, { kind: 'stroke' }>): void {
  const radius = STROKE_WIDTHS[op.width] / 2
  const points = sampleStroke(op.points)
  if (points.length === 2) {
    paintSegment(grid, op.color, radius, points[0], points[1], points[0], points[1])
    return
  }
  for (let index = 2; index < points.length; index += 2) {
    paintSegment(grid, op.color, radius, points[index - 2], points[index - 1], points[index], points[index + 1])
  }
}

function paintSpans(grid: Grid, color: number, spans: readonly number[]): void {
  for (let index = 0; index < spans.length; index += 3) {
    const row = spans[index] * GRID_WIDTH
    grid.fill(color, row + spans[index + 1], row + spans[index + 1] + spans[index + 2])
  }
}

// Grille du dessin affiché : opérations depuis le dernier « tout effacer ».
export function rasterize(ops: readonly DrawOp[]): Grid {
  const grid: Grid = new Uint8Array(GRID_WIDTH * GRID_HEIGHT).fill(BACKGROUND_COLOR)
  let start = 0
  ops.forEach((op, index) => {
    if (op.kind === 'clear') start = index + 1
  })
  for (const op of ops.slice(start)) {
    if (op.kind === 'stroke') paintStroke(grid, op)
    else if (op.kind === 'fill') paintSpans(grid, op.color, op.spans)
  }
  return grid
}

// Seau en (x, y) logiques : remplit la zone de même couleur (cases voisines par les côtés) et renvoie
// ses segments (gy, gx, longueur), triés par ligne puis par colonne ; null si rien ne change.
export function floodFill(grid: Grid, x: number, y: number, color: number): number[] | null {
  const startX = Math.floor(x / GRID_SCALE)
  const startY = Math.floor(y / GRID_SCALE)
  if (startX < 0 || startY < 0 || startX >= GRID_WIDTH || startY >= GRID_HEIGHT) return null
  const target = grid[startY * GRID_WIDTH + startX]
  if (target === color) return null
  const spans: number[] = []
  const stack: number[] = [startX, startY]
  while (stack.length > 0) {
    const gy = stack.pop() as number
    const seedX = stack.pop() as number
    const row = gy * GRID_WIDTH
    if (grid[row + seedX] !== target) continue
    let left = seedX
    while (left > 0 && grid[row + left - 1] === target) left--
    let right = seedX
    while (right < GRID_WIDTH - 1 && grid[row + right + 1] === target) right++
    grid.fill(color, row + left, row + right + 1)
    spans.push(gy, left, right - left + 1)
    for (const nextY of [gy - 1, gy + 1]) {
      if (nextY < 0 || nextY >= GRID_HEIGHT) continue
      const nextRow = nextY * GRID_WIDTH
      for (let gx = left; gx <= right; gx++) {
        // Une graine par suite de cases à remplir sur la ligne voisine.
        if (grid[nextRow + gx] === target && (gx === left || grid[nextRow + gx - 1] !== target)) stack.push(gx, nextY)
      }
    }
  }
  return sortSpans(spans)
}

function sortSpans(spans: number[]): number[] {
  const triples: [number, number, number][] = []
  for (let index = 0; index < spans.length; index += 3) triples.push([spans[index], spans[index + 1], spans[index + 2]])
  triples.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return triples.flat()
}
