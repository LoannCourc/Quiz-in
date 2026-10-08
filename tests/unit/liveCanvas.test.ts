import { describe, expect, test } from 'vitest'

import { DrawingDoc } from '../../shared/drawing/encoding'
import { LiveCanvas } from '../../shared/drawing/liveCanvas'
import { BACKGROUND_COLOR, DRAW_COLORS } from '../../shared/drawing/palette'

// Trait complet : début, quelques points, fin ; renvoie les paquets envoyés.
function drawLine(canvas: LiveCanvas, color: number, from: [number, number], to: [number, number], isEraser = false) {
  canvas.beginStroke(color, 1, from[0], from[1], isEraser)
  for (let step = 1; step <= 4; step++) {
    canvas.extendStroke(from[0] + ((to[0] - from[0]) * step) / 4, from[1] + ((to[1] - from[1]) * step) / 4)
  }
  return canvas.endStroke()
}

describe('canvas de l’hôte (lot C) : les traits restent affichés', () => {
  test('le trait reste affiché après le lever du doigt, et l’état affiché est un nouvel objet à chaque changement', () => {
    const canvas = new LiveCanvas([])
    const before = canvas.snapshot()
    canvas.beginStroke(1, 1, 10, 10)
    const during = canvas.snapshot()
    expect(during).not.toBe(before)
    expect(during.live?.dot).toEqual({ cx: 10, cy: 10 })
    canvas.extendStroke(50, 10)
    const moved = canvas.snapshot()
    expect(moved).not.toBe(during)
    expect(moved.live?.d).toBe('M10 10L50 10')
    // L'état d'avant n'a pas bougé (jamais modifié en place).
    expect(during.live?.d).toBe('M10 10')
    const chunks = canvas.endStroke()
    expect(chunks.length).toBeGreaterThan(0)
    const after = canvas.snapshot()
    expect(after.live).toBeNull()
    expect(after.shapes.map((shape) => shape.kind)).toEqual(['stroke'])
  })

  test('re-rendu du parent pendant et après le dessin (chrono, moteur) : relire l’état ne perd aucun trait', () => {
    const canvas = new LiveCanvas([])
    drawLine(canvas, 1, [10, 10], [100, 10])
    canvas.beginStroke(3, 1, 10, 50)
    canvas.extendStroke(60, 50)
    // Plusieurs rendus sans changement : même état, le premier trait toujours là, le second en cours.
    const first = canvas.snapshot()
    expect(canvas.snapshot()).toBe(first)
    expect(first.shapes).toHaveLength(1)
    expect(first.live).not.toBeNull()
    // Envoi périodique (300 ms) pendant le trait : le trait en cours reste affiché.
    canvas.flush()
    expect(canvas.snapshot().live?.d).toBe('M10 50L60 50')
    canvas.endStroke()
    expect(canvas.snapshot().shapes.length).toBeGreaterThanOrEqual(2)
  })

  test('gomme, seau, annuler, effacer', () => {
    const canvas = new LiveCanvas([])
    drawLine(canvas, 1, [0, 100], [640, 100])
    drawLine(canvas, 1, [200, 100], [400, 100], true)
    const shapes = canvas.snapshot().shapes
    expect(shapes).toHaveLength(2)
    expect(shapes[1].kind === 'stroke' && shapes[1].color).toBe(DRAW_COLORS[BACKGROUND_COLOR])
    canvas.fill(5, 10, 10)
    expect(canvas.snapshot().shapes.map((shape) => shape.kind)).toEqual(['stroke', 'stroke', 'fill'])
    canvas.undo()
    expect(canvas.snapshot().shapes).toHaveLength(2)
    canvas.clear()
    expect(canvas.snapshot().shapes).toHaveLength(0)
  })

  test('les paquets envoyés redonnent le même dessin (ce que voit la TV)', () => {
    const canvas = new LiveCanvas([])
    const sent = [...drawLine(canvas, 1, [10, 10], [100, 100]), ...canvas.fill(4, 300, 300)]
    const tv = new DrawingDoc()
    for (const chunk of sent) tv.applyChunk(chunk.data)
    expect(tv.ops.map((op) => op.kind)).toEqual(['stroke', 'fill'])
  })

  test('reprise : un canvas recréé avec les paquets déjà envoyés montre le dessin', () => {
    const canvas = new LiveCanvas([])
    const sent = drawLine(canvas, 1, [10, 10], [100, 100])
    const reopened = new LiveCanvas(sent.map((chunk) => chunk.data))
    expect(reopened.snapshot().shapes).toHaveLength(1)
  })
})
