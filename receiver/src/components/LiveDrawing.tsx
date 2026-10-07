import { drawingChunkList } from '@shared/drawGame'
import { DRAW_HEIGHT, DRAW_WIDTH, TV_DRAW_SCALE } from '@shared/drawing/palette'
import { DRAW_PLAYBACK_DELAY_MS, DrawingPlayback } from '@shared/drawing/playback'
import { DrawingRenderer, paintPenTip, type DrawingView } from '@shared/drawing/render'
import type { PublicSession } from '@shared/types'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { perfMonitor } from '../lib/perf/perfMonitor'
import './LiveDrawing.css'

const KILOBYTE = 1024
// Retard d'affichage réglable pour les essais (plan B dans un navigateur) : &drawdelay=1 à 2000 ms.
const MAX_DELAY_OVERRIDE_MS = 2000
// Sans nouveau paquet depuis ce délai, le dernier trait est considéré comme fini : son bout passe du calque
// au dessin (plus tôt, un trait qui reprend laisserait un petit ergot).
const SETTLE_MS = 1500

function playbackDelayMs(): number {
  const value = Number(new URLSearchParams(window.location.search).get('drawdelay'))
  return Number.isFinite(value) && value > 0 && value <= MAX_DELAY_OVERRIDE_MS ? value : DRAW_PLAYBACK_DELAY_MS
}

interface Painter {
  playback: DrawingPlayback
  renderer: DrawingRenderer
  pen: CanvasRenderingContext2D
  maxRenderMs: number
  frameId: number | null
  lastArrivalAt: number
}

// Dessine-moi : dessin de la manche sur un canvas de taille fixe (TV_DRAW_SCALE × 640 × 480, agrandi en
// CSS), et un calque transparent au-dessus pour la pointe du crayon. Les paquets déjà là au montage (TV
// ouverte en cours de manche, écran de la réponse) sont peints tout de suite ; les suivants sont rejoués
// lissés (playback.ts : petit retard fixe, trait qui avance en continu), image par image
// (requestAnimationFrame), seulement tant qu'il y a quelque chose à animer. Une nouvelle manche = un
// nouveau composant (clé).
export function LiveDrawing({ drawing, className }: { drawing: PublicSession['drawing']; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const penRef = useRef<HTMLCanvasElement>(null)
  const painter = useRef<Painter | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const penCanvas = penRef.current
    const pen = penCanvas?.getContext('2d')
    if (!canvas || !context || !penCanvas || !pen) return
    const chunks = drawingChunkList(drawing)
    if (!painter.current) {
      for (const target of [canvas, penCanvas]) {
        target.width = DRAW_WIDTH * TV_DRAW_SCALE
        target.height = DRAW_HEIGHT * TV_DRAW_SCALE
      }
      const renderer = new DrawingRenderer(context, TV_DRAW_SCALE, () => performance.now())
      const playback = new DrawingPlayback(playbackDelayMs())
      playback.loadNow(chunks)
      renderer.repaint(playback.doc.ops)
      painter.current = { playback, renderer, pen, maxRenderMs: 0, frameId: null, lastArrivalAt: -Infinity }
      noteStats(painter.current)
      return
    }
    const current = painter.current
    const now = performance.now()
    const before = current.playback.stats.arrivals
    for (const data of chunks) current.playback.receive(data, now)
    if (current.playback.stats.arrivals > before) current.lastArrivalAt = now
    if (current.frameId === null) current.frameId = requestAnimationFrame(() => paintFrame(current))
  }, [drawing])

  useEffect(
    () => () => {
      const frameId = painter.current?.frameId
      if (frameId !== null && frameId !== undefined) cancelAnimationFrame(frameId)
      perfMonitor.noteDrawing(null)
    },
    [],
  )

  const classes = className ? `live-drawing ${className}` : 'live-drawing'
  return (
    <div className={classes}>
      <canvas ref={canvasRef} className="live-drawing-layer" />
      <canvas ref={penRef} className="live-drawing-layer live-drawing-pen" />
    </div>
  )
}

// Une image : ce qui est dû est peint, puis la pointe du crayon sur le calque. Rejeu fini et plus aucun
// paquet depuis SETTLE_MS : le bout du dernier trait passe dans le dessin, le calque est vidé, la boucle
// s'arrête.
function paintFrame(current: Painter): void {
  const now = performance.now()
  const { view, pen, isAnimating } = current.playback.frame(now)
  current.renderer.render(view)
  current.maxRenderMs = Math.max(current.maxRenderMs, current.renderer.lastRenderMs)
  clearPen(current.pen)
  const isSettled = !isAnimating && now - current.lastArrivalAt >= SETTLE_MS
  if (isSettled) {
    current.renderer.finishLast(view)
    current.frameId = null
  } else {
    paintTip(current.pen, view, pen)
    current.frameId = requestAnimationFrame(() => paintFrame(current))
  }
  noteStats(current)
}

function clearPen(pen: CanvasRenderingContext2D): void {
  pen.clearRect(0, 0, DRAW_WIDTH * TV_DRAW_SCALE, DRAW_HEIGHT * TV_DRAW_SCALE)
}

// Pointe en cours d'étalement, sinon le bout du dernier trait (pas encore peint dans le dessin).
function paintTip(pen: CanvasRenderingContext2D, view: DrawingView, tip: ReturnType<DrawingPlayback['frame']>['pen']): void {
  if (tip) {
    paintPenTip(pen, TV_DRAW_SCALE, tip.op, tip.shown, tip.fraction)
    return
  }
  const last = view.ops[view.ops.length - 1]
  if (last?.kind === 'stroke') paintPenTip(pen, TV_DRAW_SCALE, last, last.points.length / 2, 0)
}

function noteStats({ playback, renderer, maxRenderMs }: Painter): void {
  perfMonitor.noteDrawing({
    chunks: playback.doc.appliedChunks,
    kilobytes: playback.doc.receivedLength / KILOBYTE,
    lastRenderMs: renderer.lastRenderMs,
    maxRenderMs,
    fullRenderMs: renderer.lastFullRenderMs,
    delayMs: playback.delayMs,
    ...playback.stats,
  })
}
