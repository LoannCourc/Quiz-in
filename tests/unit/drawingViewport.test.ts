import { describe, expect, test } from 'vitest'

import { DRAW_HEIGHT, DRAW_WIDTH } from '../../shared/drawing/palette'
import {
  FIT_VIEWPORT,
  ZOOM_MAX,
  clampViewport,
  pinchViewport,
  screenToDrawing,
  zoomAround,
  zoomPercent,
  zoomStep,
} from '../../shared/drawing/viewport'

// Cadre affiché de 320 × 240 pixels (un demi-dessin).
const frame = { width: 320, height: 240 }

describe('zoom du dessinateur (affichage seulement)', () => {
  test('sans zoom : le cadre montre tout le dessin', () => {
    expect(screenToDrawing(FIT_VIEWPORT, { x: 160, y: 120 }, frame)).toEqual({ x: 320, y: 240 })
    expect(screenToDrawing(FIT_VIEWPORT, { x: 320, y: 240 }, frame)).toEqual({ x: DRAW_WIDTH, y: DRAW_HEIGHT })
  })

  test('zoom autour d’un point : le point du dessin sous le doigt ne bouge pas', () => {
    const point = { x: 80, y: 60 }
    const before = screenToDrawing(FIT_VIEWPORT, point, frame)
    const zoomed = zoomAround(FIT_VIEWPORT, 2, point, frame)
    expect(zoomed.scale).toBe(2)
    expect(screenToDrawing(zoomed, point, frame)).toEqual(before)
  })

  test('jamais de vide autour du dessin : la vue reste dans le dessin, échelle de 1 à 3', () => {
    expect(clampViewport({ scale: 2, x: -50, y: 900 })).toEqual({ scale: 2, x: 0, y: DRAW_HEIGHT / 2 })
    expect(clampViewport({ scale: 9, x: 0, y: 0 }).scale).toBe(ZOOM_MAX)
    expect(clampViewport({ scale: 0.4, x: 30, y: 30 })).toEqual(FIT_VIEWPORT)
  })

  test('boutons − / + : pas d’un demi autour du centre, bornés', () => {
    const plus = zoomStep(FIT_VIEWPORT, 1, frame)
    expect(zoomPercent(plus)).toBe(150)
    // Le centre du dessin reste au centre.
    expect(screenToDrawing(plus, { x: 160, y: 120 }, frame)).toEqual({ x: 320, y: 240 })
    expect(zoomStep(FIT_VIEWPORT, -1, frame)).toEqual(FIT_VIEWPORT)
    expect(zoomStep({ scale: 3, x: 0, y: 0 }, 1, frame).scale).toBe(3)
  })

  test('pincer : l’échelle suit l’écart des doigts, le dessin suit leur milieu', () => {
    const start: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: 100, y: 100 },
      { x: 140, y: 100 },
    ]
    const spread: typeof start = [
      { x: 80, y: 100 },
      { x: 160, y: 100 },
    ]
    const view = pinchViewport(FIT_VIEWPORT, start, spread, frame)
    expect(view.scale).toBe(2)
    // Le point du dessin sous le milieu des doigts (120, 100) y est toujours.
    expect(screenToDrawing(view, { x: 120, y: 100 }, frame)).toEqual(screenToDrawing(FIT_VIEWPORT, { x: 120, y: 100 }, frame))
    // Puis déplacer à deux doigts : le dessin suit.
    const moved = pinchViewport(view, spread, [{ x: 60, y: 100 }, { x: 140, y: 100 }], frame)
    expect(moved.x).toBeGreaterThan(view.x)
  })
})
