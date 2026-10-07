import { drawingChunkList } from '@shared/drawGame'
import { DrawingDoc } from '@shared/drawing/encoding'
import { DRAW_HEIGHT, DRAW_WIDTH, TV_DRAW_SCALE } from '@shared/drawing/palette'
import { DrawingRenderer } from '@shared/drawing/render'
import type { PublicSession } from '@shared/types'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { perfMonitor } from '../lib/perf/perfMonitor'
import './LiveDrawing.css'

const KILOBYTE = 1024

interface Painter {
  doc: DrawingDoc
  renderer: DrawingRenderer
  maxRenderMs: number
}

// Dessine-moi : dessin de la manche, rejoué paquet par paquet sur un canvas de taille fixe
// (TV_DRAW_SCALE × 640 × 480, agrandi en CSS). Seuls les nouveaux paquets sont peints ; une TV ouverte ou
// rechargée en cours de manche rejoue tout. Une nouvelle manche = un nouveau composant (clé).
export function LiveDrawing({ drawing, className }: { drawing: PublicSession['drawing']; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const painter = useRef<Painter | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    if (!painter.current) {
      canvas.width = DRAW_WIDTH * TV_DRAW_SCALE
      canvas.height = DRAW_HEIGHT * TV_DRAW_SCALE
      const renderer = new DrawingRenderer(context, TV_DRAW_SCALE, () => performance.now())
      renderer.repaint([])
      painter.current = { doc: new DrawingDoc(), renderer, maxRenderMs: 0 }
    }
    const current = painter.current
    // Les paquets déjà appliqués sont ignorés aussitôt (numéro dépassé).
    for (const data of drawingChunkList(drawing)) current.doc.applyChunk(data)
    current.renderer.render(current.doc)
    current.maxRenderMs = Math.max(current.maxRenderMs, current.renderer.lastRenderMs)
    perfMonitor.noteDrawing({
      chunks: current.doc.appliedChunks,
      kilobytes: current.doc.receivedLength / KILOBYTE,
      lastRenderMs: current.renderer.lastRenderMs,
      maxRenderMs: current.maxRenderMs,
      fullRenderMs: current.renderer.lastFullRenderMs,
    })
  }, [drawing])

  useEffect(() => () => perfMonitor.noteDrawing(null), [])

  return <canvas ref={canvasRef} className={className ? `live-drawing ${className}` : 'live-drawing'} />
}
