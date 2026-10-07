import { describe, expect, test } from 'vitest'

import { DrawingWriter } from '../../shared/drawing/encoding'
import { DrawingPlayback } from '../../shared/drawing/playback'
import type { DrawingView } from '../../shared/drawing/render'

const DELAY = 500

// Points visibles du trait n (0 : premier).
const pointsOf = (view: DrawingView, index = 0) => {
  const op = view.ops[index]
  return op?.kind === 'stroke' ? op.points.length / 2 : 0
}

// Un trait de `count` points bien espacés (la simplification les garde : zigzag).
function zigzagChunk(writer: DrawingWriter, count: number, startX = 0): string[] {
  writer.beginStroke(1, 1, startX, 0)
  for (let index = 1; index < count; index++) writer.extendStroke(startX + index * 10, index % 2 === 0 ? 0 : 40)
  return writer.flush().map((chunk) => chunk.data)
}

describe('Dessine-moi : rejeu lissé sur la TV', () => {
  test('rien avant le retard, puis les points étalés sur l’intervalle, puis tout', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    for (const data of zigzagChunk(writer, 21)) playback.receive(data, 0)
    expect(playback.frame(DELAY - 1).view.ops).toHaveLength(0)
    const middle = pointsOf(playback.frame(DELAY + 150).view)
    expect(middle).toBeGreaterThan(5)
    expect(middle).toBeLessThan(16)
    const end = playback.frame(DELAY + 300)
    expect(pointsOf(end.view)).toBe(21)
    expect(end.isAnimating).toBe(false)
  })

  test('étalement jusqu’au paquet suivant déjà arrivé', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    const [first] = zigzagChunk(writer, 21)
    writer.extendStroke(300, 0)
    const [second] = writer.flush().map((chunk) => chunk.data)
    playback.receive(first, 0)
    playback.receive(second, 200)
    // Premier paquet étalé sur 200 ms : à moitié à 100 ms.
    expect(pointsOf(playback.frame(DELAY + 100).view)).toBeGreaterThan(5)
    expect(pointsOf(playback.frame(DELAY + 199).view)).toBeLessThan(21)
    expect(pointsOf(playback.frame(DELAY + 200).view)).toBeGreaterThanOrEqual(21)
  })

  test('jamais de retard cumulé : paquets rapprochés ou image manquée, rattrapage', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    let at = 0
    for (let index = 0; index < 10; index++) {
      for (const data of zigzagChunk(writer, 5, index * 60)) playback.receive(data, at)
      writer.endStroke()
      at += 30
    }
    // Images toutes les 16 ms : paquets plus rapprochés que l'étalement minimal, le précédent est montré
    // en entier dès que le suivant est dû ; à la fin, rien en retard.
    for (let now = DELAY; now <= at + DELAY + 120; now += 16) playback.frame(now)
    expect(playback.stats.catchUps).toBeGreaterThan(0)
    const done = playback.frame(at + DELAY + 120)
    expect(done.view.ops).toHaveLength(10)
    expect(done.isAnimating).toBe(false)
  })

  test('image manquée longtemps (onglet en arrière-plan) : tout ce qui est dû est montré d’un coup', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    for (let index = 0; index < 5; index++) {
      for (const data of zigzagChunk(writer, 5, index * 60)) playback.receive(data, index * 300)
      writer.endStroke()
    }
    const late = playback.frame(10_000)
    expect(late.view.ops).toHaveLength(5)
    expect(late.isAnimating).toBe(false)
  })

  test('mesures : écart d’arrivée moyen et maximal, points et caractères par paquet', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    for (const data of zigzagChunk(writer, 11)) playback.receive(data, 0)
    writer.extendStroke(200, 0)
    for (const chunk of writer.flush()) playback.receive(chunk.data, 300)
    playback.frame(5_000)
    expect(playback.stats).toMatchObject({ arrivals: 2, gapMaxMs: 300 })
    expect(playback.stats.pointsPerChunk).toBeGreaterThan(0)
    expect(playback.stats.charsPerChunk).toBeGreaterThan(0)
  })

  test('TV ouverte en cours de manche : les paquets déjà là sont montrés tout de suite', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    playback.loadNow(zigzagChunk(writer, 8))
    const { view, isAnimating } = playback.frame(0)
    expect(pointsOf(view)).toBe(8)
    expect(isAnimating).toBe(false)
  })

  test('annuler : montré d’un coup ; seau : en entier à son tour, jamais retiré', () => {
    const writer = new DrawingWriter()
    const playback = new DrawingPlayback(DELAY)
    playback.loadNow(zigzagChunk(writer, 8))
    writer.endStroke()
    writer.fill(3, [10, 10, 5, 11, 10, 5])
    for (const chunk of writer.flush()) playback.receive(chunk.data, 0)
    expect(playback.frame(DELAY + 1).view.ops).toHaveLength(1)
    expect(playback.frame(DELAY + 400).view.ops).toHaveLength(2)
    writer.undo()
    for (const chunk of writer.flush()) playback.receive(chunk.data, 1_000)
    const undone = playback.frame(1_000 + DELAY)
    expect(undone.view.ops).toHaveLength(1)
    expect(undone.isAnimating).toBe(false)
  })
})
