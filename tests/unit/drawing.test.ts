import { describe, expect, test } from 'vitest'

import { DrawingDoc, DrawingWriter, MAX_CHUNK_LENGTH, type DrawOp } from '../../shared/drawing/encoding'
import { GRID_HEIGHT, GRID_WIDTH } from '../../shared/drawing/palette'
import { floodFill, rasterize } from '../../shared/drawing/raster'
import { DrawingRenderer, type DrawSurface } from '../../shared/drawing/render'
import { simplifyPoints } from '../../shared/drawing/simplify'

function replay(chunks: { data: string }[]): DrawingDoc {
  const doc = new DrawingDoc()
  for (const chunk of chunks) doc.applyChunk(chunk.data)
  return doc
}

const strokesOf = (doc: DrawingDoc) => doc.ops.filter((op): op is Extract<DrawOp, { kind: 'stroke' }> => op.kind === 'stroke')

// Carré fermé de 100 points logiques de côté, coin en (x, y).
function square(writer: DrawingWriter, x: number, y: number, color = 1, width = 0): void {
  writer.beginStroke(color, width, x, y)
  for (const [px, py] of [[x + 100, y], [x + 100, y + 100], [x, y + 100], [x, y]]) writer.extendStroke(px, py)
  writer.endStroke()
}

describe('Dessin : lissage', () => {
  test('les points alignés disparaissent, les coins restent', () => {
    expect(simplifyPoints([0, 0, 5, 0, 10, 0, 10, 10])).toEqual([0, 0, 10, 0, 10, 10])
    expect(simplifyPoints([3, 4])).toEqual([3, 4])
  })
})

describe('Dessin : texte compact', () => {
  test('un trait envoyé en plusieurs paquets est reconstruit à l’identique (points lissés)', () => {
    const writer = new DrawingWriter()
    writer.beginStroke(3, 1, 10, 10)
    writer.extendStroke(50, 10)
    const first = writer.flush()
    writer.extendStroke(50, 60)
    writer.extendStroke(-5, 60)
    writer.endStroke()
    const doc = replay([...first, ...writer.flush()])
    expect(strokesOf(doc)).toEqual([{ kind: 'stroke', id: 0, color: 3, width: 1, points: [10, 10, 50, 10, 50, 60, -5, 60] }])
  })

  test('paquets arrivés dans le désordre : appliqués dans l’ordre', () => {
    const writer = new DrawingWriter()
    square(writer, 0, 0)
    const a = writer.flush()
    square(writer, 200, 0)
    const b = writer.flush()
    const doc = replay([...b, ...a])
    expect(strokesOf(doc).map((op) => op.points[0])).toEqual([0, 200])
  })

  test('annuler retire la dernière opération ; tout effacer s’annule aussi', () => {
    const writer = new DrawingWriter()
    square(writer, 0, 0)
    square(writer, 200, 0)
    writer.undo()
    writer.clear()
    const doc = replay(writer.flush())
    expect(doc.ops.map((op) => op.kind)).toEqual(['stroke', 'clear'])
    expect(doc.revision).toBe(1)
    writer.undo()
    for (const chunk of writer.flush()) doc.applyChunk(chunk.data)
    expect(doc.ops.map((op) => op.kind)).toEqual(['stroke'])
  })

  test('paquets de 4 000 caractères au plus, même avec un très grand seau', () => {
    const writer = new DrawingWriter()
    const spans: number[] = []
    for (let y = 0; y < GRID_HEIGHT; y++) for (let x = 0; x < GRID_WIDTH; x += 4) spans.push(y, x, 2)
    writer.fill(5, spans)
    const chunks = writer.flush()
    expect(chunks.length).toBeGreaterThan(1)
    expect(Math.max(...chunks.map((chunk) => chunk.data.length))).toBeLessThanOrEqual(MAX_CHUNK_LENGTH)
    const doc = replay(chunks)
    expect(doc.ops).toHaveLength(1)
    expect(doc.ops[0]).toEqual({ kind: 'fill', id: 0, color: 5, spans })
  })

  test('reprise après un rechargement : numérotation et opérations continuent après le dessin envoyé', () => {
    const first = new DrawingWriter()
    square(first, 0, 0)
    first.undo()
    square(first, 200, 0)
    const sent = first.flush()
    const doc = replay(sent)
    const resumed = new DrawingWriter(doc)
    square(resumed, 400, 0)
    const more = resumed.flush()
    expect(more[0].data.startsWith(`${sent.length.toString(36)}:`)).toBe(true)
    for (const chunk of more) doc.applyChunk(chunk.data)
    expect(strokesOf(doc).map((op) => [op.id, op.points[0]])).toEqual([[1, 200], [2, 400]])
  })

  test('paquet illisible ou couleur inconnue : ignoré sans planter', () => {
    const doc = new DrawingDoc()
    doc.applyChunk('n’importe quoi')
    doc.applyChunk('0:s0,zz,0:1,1|q|f1,1:0,0,zz!')
    expect(doc.ops).toEqual([])
  })
})

describe('Dessin : seau', () => {
  test('remplit l’intérieur d’une forme fermée, pas l’extérieur', () => {
    const writer = new DrawingWriter()
    square(writer, 100, 100)
    const doc = replay(writer.flush())
    const grid = rasterize(doc.ops)
    const spans = floodFill(grid, 150, 150, 4) as number[]
    // Intérieur : un peu moins de 50 × 50 cases ; rien au-delà du carré.
    const rows = new Set(spans.filter((_, index) => index % 3 === 0))
    expect(Math.min(...rows)).toBeGreaterThanOrEqual(50)
    expect(Math.max(...rows)).toBeLessThan(100)
    expect(grid[10 * GRID_WIDTH + 10]).toBe(0)
  })

  test('un trait fin en diagonale ne laisse pas fuir le seau', () => {
    const writer = new DrawingWriter()
    writer.beginStroke(1, 0, 100, 100)
    for (const [x, y] of [[300, 300], [100, 300], [100, 100]]) writer.extendStroke(x, y)
    writer.endStroke()
    const grid = rasterize(replay(writer.flush()).ops)
    floodFill(grid, 130, 250, 6)
    // De l'autre côté de la diagonale : toujours le fond.
    expect(grid[110 * GRID_WIDTH + 140]).toBe(0)
  })

  test('forme ouverte : le seau remplit tout le fond ; même couleur : rien', () => {
    const writer = new DrawingWriter()
    writer.beginStroke(1, 0, 100, 100)
    writer.extendStroke(200, 100)
    writer.endStroke()
    const grid = rasterize(replay(writer.flush()).ops)
    const spans = floodFill(grid, 5, 5, 3) as number[]
    const cells = spans.reduce((sum, value, index) => (index % 3 === 2 ? sum + value : sum), 0)
    expect(cells).toBeGreaterThan(GRID_WIDTH * GRID_HEIGHT * 0.95)
    expect(floodFill(grid, 5, 5, 3)).toBeNull()
  })

  test('même dessin, même grille : le seau donne toujours les mêmes segments', () => {
    const writer = new DrawingWriter()
    square(writer, 40, 40, 2, 2)
    const doc = replay(writer.flush())
    expect(floodFill(rasterize(doc.ops), 90, 90, 7)).toEqual(floodFill(rasterize(doc.ops), 90, 90, 7))
  })
})

describe('Dessin : rendu incrémental', () => {
  function recorder() {
    const calls: string[] = []
    const surface: DrawSurface = {
      fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
      beginPath: () => calls.push('beginPath'),
      moveTo: (x, y) => calls.push(`moveTo ${x},${y}`),
      lineTo: (x, y) => calls.push(`lineTo ${x},${y}`),
      stroke: () => calls.push('stroke'),
      arc: () => calls.push('arc'),
      fill: () => calls.push('fill'),
      fillRect: (x, y, w, h) => calls.push(`fillRect ${x},${y},${w},${h}`),
    }
    return { calls, surface }
  }

  test('seuls les nouveaux points sont peints ; annuler repeint tout', () => {
    const writer = new DrawingWriter()
    const doc = new DrawingDoc()
    const { calls, surface } = recorder()
    const renderer = new DrawingRenderer(surface, 1)
    writer.beginStroke(1, 0, 0, 0)
    writer.extendStroke(10, 0)
    for (const chunk of writer.flush()) doc.applyChunk(chunk.data)
    renderer.render(doc)
    calls.length = 0
    writer.extendStroke(10, 10)
    writer.endStroke()
    for (const chunk of writer.flush()) doc.applyChunk(chunk.data)
    renderer.render(doc)
    expect(calls).toEqual(['beginPath', 'moveTo 10,0', 'lineTo 10,10', 'stroke'])
    calls.length = 0
    writer.undo()
    for (const chunk of writer.flush()) doc.applyChunk(chunk.data)
    renderer.render(doc)
    // Fond repeint, plus aucun trait.
    expect(calls).toEqual(['fillRect 0,0,640,480'])
  })
})
