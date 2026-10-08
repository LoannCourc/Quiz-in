import { describe, expect, test } from 'vitest'

import { DrawingDoc, DrawingWriter } from '../../shared/drawing/encoding'
import { DRAW_COLORS, STROKE_WIDTHS } from '../../shared/drawing/palette'
import { strokePath, svgShapes } from '../../shared/drawing/svg'

function docOf(draw: (writer: DrawingWriter) => void): DrawingDoc {
  const doc = new DrawingDoc()
  const writer = new DrawingWriter(doc)
  draw(writer)
  for (const chunk of writer.flush()) doc.applyChunk(chunk.data)
  return doc
}

describe('dessin en formes SVG (app de l’hôte, lot C)', () => {
  test('trait : courbe lissée jusqu’au dernier point ; point seul : un disque', () => {
    const doc = docOf((writer) => {
      writer.beginStroke(1, 1, 10, 10)
      writer.extendStroke(100, 10)
      writer.extendStroke(100, 100)
      writer.endStroke()
      writer.beginStroke(3, 2, 50, 60)
      writer.endStroke()
    })
    const shapes = svgShapes(doc.ops)
    expect(shapes.map((shape) => shape.kind)).toEqual(['stroke', 'dot'])
    const [stroke, dot] = shapes
    expect(stroke).toMatchObject({ color: DRAW_COLORS[1], width: STROKE_WIDTHS[1] })
    expect(stroke.kind === 'stroke' && stroke.d.startsWith('M10 10')).toBe(true)
    expect(stroke.kind === 'stroke' && stroke.d.endsWith('L100 100')).toBe(true)
    expect(dot).toMatchObject({ cx: 50, cy: 60, r: STROKE_WIDTHS[2] / 2, color: DRAW_COLORS[3] })
  })

  test('seau : un rectangle par ligne de cases, débordant d’un point', () => {
    const doc = docOf((writer) => writer.fill(5, [3, 4, 10]))
    expect(svgShapes(doc.ops)).toEqual([{ kind: 'fill', key: expect.any(String), d: 'M7 5h22v4h-22z', color: DRAW_COLORS[5] }])
  })

  test('tout effacer : seules les formes d’après restent', () => {
    const doc = docOf((writer) => {
      writer.beginStroke(1, 0, 0, 0)
      writer.extendStroke(10, 10)
      writer.endStroke()
      writer.clear()
      writer.fill(4, [0, 0, 1])
    })
    expect(svgShapes(doc.ops).map((shape) => shape.kind)).toEqual(['fill'])
  })

  test('chemin d’un trait de deux points : un segment', () => {
    expect(strokePath([0, 0, 20, 0])).toBe('M0 0L10 0M10 0L20 0')
  })
})
