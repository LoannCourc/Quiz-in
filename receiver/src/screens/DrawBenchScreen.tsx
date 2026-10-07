import { DrawingDoc } from '@shared/drawing/encoding'
import { DRAW_HEIGHT, DRAW_WIDTH } from '@shared/drawing/palette'
import { parseRecording, type DrawingRecording } from '@shared/drawing/recording'
import { DrawingRenderer } from '@shared/drawing/render'
import { useEffect, useRef, useState } from 'react'

import { PerfPanel } from '../components/PerfPanel'
import { strings } from '../strings'
import './DrawBenchScreen.css'

const texts = strings.drawBench
// Après le dernier paquet : attente, puis les « annuler », puis la pause avant le tour suivant.
const AFTER_REPLAY_MS = 1_000
const STRESS_REPAINTS = 20
const PAUSE_MS = 3_000
const STATS_REFRESH_MS = 500
const KILOBYTE = 1024

type Phase = keyof typeof texts.phases

interface BenchStats {
  cycle: number
  phase: Phase
  applied: number
  total: number
  kilobytes: number
  ops: number
  fills: number
  lastRenderMs: number
  maxRenderMs: number
  repaintAverageMs: number
  repaintMaxMs: number
}

const ms = (value: number) => value.toFixed(1)

// Banc d'essai du dessin (Dessine-moi, lot 1) : rejoue en boucle un dessin enregistré sur un téléphone
// (receiver/src/lib/drawing/benchRecording.json), paquet par paquet à son heure, comme le fera une vraie
// manche ; puis 20 « annuler » d'affilée (tout repeindre). Panneau de mesures toujours affiché.
// scale : pixels du canvas par point logique (1 : 640 × 480, agrandi en CSS).
export function DrawBenchScreen({ scale }: { scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [recording, setRecording] = useState<DrawingRecording | null | 'error'>(null)
  const [stats, setStats] = useState<BenchStats | null>(null)

  useEffect(() => {
    import('../lib/drawing/benchRecording.json?raw')
      .then((module) => setRecording(parseRecording(JSON.parse(module.default)) ?? 'error'))
      .catch(() => setRecording('error'))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !recording || recording === 'error') return
    canvas.width = DRAW_WIDTH * scale
    canvas.height = DRAW_HEIGHT * scale
    const timers: ReturnType<typeof setTimeout>[] = []
    const frames: number[] = []
    const later = (callback: () => void, delayMs: number) => timers.push(setTimeout(callback, delayMs))
    const nextFrame = (callback: () => void) => frames.push(requestAnimationFrame(callback))
    const { chunks } = recording
    const live: BenchStats = {
      cycle: 0, phase: 'replay', applied: 0, total: chunks.length, kilobytes: 0, ops: 0, fills: 0,
      lastRenderMs: 0, maxRenderMs: 0, repaintAverageMs: 0, repaintMaxMs: 0,
    }

    const runCycle = () => {
      const doc = new DrawingDoc()
      const renderer = new DrawingRenderer(context, scale, () => performance.now())
      renderer.repaint([])
      Object.assign(live, { cycle: live.cycle + 1, phase: 'replay', applied: 0, maxRenderMs: 0 })
      let isFramePending = false
      const renderSoon = () => {
        if (isFramePending) return
        isFramePending = true
        nextFrame(() => {
          isFramePending = false
          renderer.render(doc)
          live.lastRenderMs = renderer.lastRenderMs
          live.maxRenderMs = Math.max(live.maxRenderMs, renderer.lastRenderMs)
          live.applied = doc.appliedChunks
          live.kilobytes = doc.receivedLength / KILOBYTE
          live.ops = doc.ops.length
          live.fills = doc.ops.filter((op) => op.kind === 'fill').length
        })
      }
      for (const chunk of chunks) {
        later(() => {
          doc.applyChunk(chunk.data)
          renderSoon()
        }, chunk.t)
      }
      const lastAt = chunks.length > 0 ? chunks[chunks.length - 1].t : 0
      later(() => stress(doc, renderer, []), lastAt + AFTER_REPLAY_MS)
    }

    // Un « tout repeindre » par image, comme 20 appuis sur Annuler.
    const stress = (doc: DrawingDoc, renderer: DrawingRenderer, durations: number[]) => {
      live.phase = 'stress'
      if (durations.length === STRESS_REPAINTS) {
        live.phase = 'pause'
        later(runCycle, PAUSE_MS)
        return
      }
      nextFrame(() => {
        const startedAt = performance.now()
        renderer.repaint(doc.ops)
        durations.push(performance.now() - startedAt)
        live.repaintAverageMs = durations.reduce((sum, value) => sum + value, 0) / durations.length
        live.repaintMaxMs = Math.max(...durations)
        stress(doc, renderer, durations)
      })
    }

    runCycle()
    const statsTimer = setInterval(() => setStats({ ...live }), STATS_REFRESH_MS)
    return () => {
      timers.forEach(clearTimeout)
      frames.forEach(cancelAnimationFrame)
      clearInterval(statsTimer)
    }
  }, [recording, scale])

  return (
    <>
      <main className="screen draw-bench">
        <canvas ref={canvasRef} className="draw-bench-canvas" />
        <div className="draw-bench-stats">
          <h1 className="draw-bench-title">{texts.title}</h1>
          {recording === null && <p>{texts.loading}</p>}
          {recording === 'error' && <p>{texts.error}</p>}
          {stats && (
            <>
              <p className="draw-bench-phase">{texts.cycle(stats.cycle, texts.phases[stats.phase])}</p>
              <p>{texts.chunks(stats.applied, stats.total, stats.kilobytes.toFixed(1))}</p>
              <p>{texts.ops(stats.ops, stats.fills)}</p>
              <p>{texts.render(ms(stats.lastRenderMs), ms(stats.maxRenderMs))}</p>
              <p>{texts.repaint(ms(stats.repaintAverageMs), ms(stats.repaintMaxMs))}</p>
              <p>{texts.canvas(DRAW_WIDTH * scale, DRAW_HEIGHT * scale)}</p>
            </>
          )}
        </div>
      </main>
      <PerfPanel serverOffsetMs={0} />
    </>
  )
}
