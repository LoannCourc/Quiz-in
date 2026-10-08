import { DRAW_HEIGHT, DRAW_WIDTH } from './palette'

// Zoom du dessinateur (plan 5, livraison C) : affichage seulement, sur son téléphone. Le dessin, ses
// points et les paquets restent en points logiques (640 × 480) : la TV voit toujours le dessin entier.
// Vue : échelle et coin haut gauche de la partie visible, en points logiques.
export interface Viewport {
  scale: number
  x: number
  y: number
}

export const ZOOM_MIN = 1
export const ZOOM_MAX = 3
// Boutons − / + : un pas d'un demi (100 %, 150 %, 200 %, 250 %, 300 %).
export const ZOOM_STEP = 0.5

export const FIT_VIEWPORT: Viewport = { scale: ZOOM_MIN, x: 0, y: 0 }

// Taille affichée du cadre du dessin (pixels de l'écran) et position d'un doigt dans ce cadre.
export interface Frame {
  width: number
  height: number
}

export interface ScreenPoint {
  x: number
  y: number
}

// Échelle bornée, et partie visible toujours dans le dessin (jamais de vide autour).
export function clampViewport({ scale, x, y }: Viewport): Viewport {
  const bounded = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale))
  const maxX = DRAW_WIDTH - DRAW_WIDTH / bounded
  const maxY = DRAW_HEIGHT - DRAW_HEIGHT / bounded
  return { scale: bounded, x: Math.min(maxX, Math.max(0, x)), y: Math.min(maxY, Math.max(0, y)) }
}

// Point de l'écran (dans le cadre) → point logique du dessin.
export function screenToDrawing(view: Viewport, point: ScreenPoint, frame: Frame): ScreenPoint {
  return {
    x: view.x + (point.x / Math.max(1, frame.width)) * (DRAW_WIDTH / view.scale),
    y: view.y + (point.y / Math.max(1, frame.height)) * (DRAW_HEIGHT / view.scale),
  }
}

// Nouvelle échelle autour d'un point de l'écran : le point du dessin qui s'y trouve ne bouge pas.
export function zoomAround(view: Viewport, scale: number, point: ScreenPoint, frame: Frame): Viewport {
  const anchor = screenToDrawing(view, point, frame)
  const bounded = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale))
  return clampViewport({
    scale: bounded,
    x: anchor.x - (point.x / Math.max(1, frame.width)) * (DRAW_WIDTH / bounded),
    y: anchor.y - (point.y / Math.max(1, frame.height)) * (DRAW_HEIGHT / bounded),
  })
}

// Boutons − / + : un pas vers le haut ou le bas, autour du centre du cadre (arrondi au pas).
export function zoomStep(view: Viewport, direction: 1 | -1, frame: Frame): Viewport {
  const target = Math.round((view.scale + direction * ZOOM_STEP) / ZOOM_STEP) * ZOOM_STEP
  return zoomAround(view, target, { x: frame.width / 2, y: frame.height / 2 }, frame)
}

const distance = (a: ScreenPoint, b: ScreenPoint) => Math.hypot(b.x - a.x, b.y - a.y)
const middle = (a: ScreenPoint, b: ScreenPoint): ScreenPoint => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

// Deux doigts : l'échelle suit l'écart des doigts, et le point du dessin qui était sous leur milieu au
// début du geste reste sous leur milieu (pincer et déplacer en même temps).
export function pinchViewport(
  start: Viewport,
  startFingers: readonly [ScreenPoint, ScreenPoint],
  fingers: readonly [ScreenPoint, ScreenPoint],
  frame: Frame,
): Viewport {
  const ratio = distance(...fingers) / Math.max(1, distance(...startFingers))
  const scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, start.scale * ratio))
  const anchor = screenToDrawing(start, middle(...startFingers), frame)
  const now = middle(...fingers)
  return clampViewport({
    scale,
    x: anchor.x - (now.x / Math.max(1, frame.width)) * (DRAW_WIDTH / scale),
    y: anchor.y - (now.y / Math.max(1, frame.height)) * (DRAW_HEIGHT / scale),
  })
}

// Zoom en pour cent, pour l'affichage (« 150 % »).
export function zoomPercent(view: Viewport): number {
  return Math.round(view.scale * 100)
}
