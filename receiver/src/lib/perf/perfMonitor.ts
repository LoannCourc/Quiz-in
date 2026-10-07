import { transitionLatency, type TransitionLatency } from '@shared/perfLatency'
import { soundSettingsOf } from '@shared/sound'
import type { GameStatus, PublicSession } from '@shared/types'

import { keepAwakeStatus, type KeepAwakeStatus } from '../keepAwake'
import { isPerfMusicForcedOff } from './perfFlag'
import { musicPlayer, type MusicStats } from '../sound/musicPlayer'

// Mesures de la TV pour le plan de fiabilité (docs/plan-fiabilite-tv.md), affichées par le panneau
// ?perf=1. Rien ne tourne tant que le panneau est éteint (start / stop).
// Toutes les mesures sont rangées selon l'état de la musique (active ou coupée) au moment de la mesure,
// pour comparer les deux sur une même partie.

export const PERF_THRESHOLDS = {
  // Battement du minuteur de contrôle (attendu toutes les 250 ms) plus en retard que ça : incident.
  tickGapMs: 1_500,
  longTaskMs: 200,
  stateLatencyMs: 1_000,
}

const TICK_MS = 250
const WINDOW_SECONDS = 10
const MAX_INCIDENTS = 30
// Seconde trop courte (fin de partie, onglet masqué) : pas prise pour le minimum d'images par seconde.
const MIN_SAMPLE_MS = 900

export type PerfIncidentKind = 'tick' | 'task' | 'state' | 'host' | 'decode'

export interface PerfIncident {
  at: number
  kind: PerfIncidentKind
  valueMs: number
  detail: string
  status: GameStatus | null
  index: number | null
  music: boolean
  // Décodage de musique en cours au moment de l'incident.
  decoding: boolean
}

interface Sample {
  durationMs: number
  frames: number
  longTasks: number
  longTaskMaxMs: number
  tickGapMaxMs: number
  renders: number
}

export interface MusicBucket {
  seconds: number
  frames: number
  minFps: number | null
  longTasks: number
  longTaskMaxMs: number
  tickGapMaxMs: number
  transitions: number
  tvLatencySumMs: number
  tvLatencyMaxMs: number
  hostLatencyMaxMs: number
  incidents: number
}

export interface TeamColumnStats {
  team: string
  received: number
  shown: number
  capacity: number
}

// Dessine-moi : dessin reçu pendant la manche (TV), et coût de son rendu.
export interface DrawingStats {
  chunks: number
  kilobytes: number
  lastRenderMs: number
  maxRenderMs: number
  fullRenderMs: number
}

export interface StreakStats {
  active: { name: string; streak: number }[]
  zero: number
  missing: number
}

export interface PerfSnapshot {
  fps: number
  minFps: number | null
  longTasks: number
  longTaskMaxMs: number
  tickGapMaxMs: number
  rendersPerSecond: number
  supportsLongTasks: boolean
  memory: { usedMb: number; limitMb: number } | null
  screen: string
  // Groupe, salon ou tirage : par équipe, membres reçus (données), affichés (en entier dans la colonne) et
  // capacité de la colonne (lignes qui y tiennent) ; échelle appliquée. null hors de ces écrans.
  teamColumns: { scale: string; teams: TeamColumnStats[] } | null
  // Séries reçues de la base (spec 18), telles quelles : joueurs dont la série est au-dessus de 0, et combien
  // sont à 0 ou sans le champ (hôte d'une version sans série).
  streaks: StreakStats
  // null hors d'une manche de Dessine-moi.
  drawing: DrawingStats | null
  chromeVersion: string
  musicOn: boolean
  // Musique coupée par le panneau (et non par l'hôte).
  musicForcedOff: boolean
  effectsOn: boolean
  music: MusicStats
  keepAwake: KeepAwakeStatus
  lastTransition: (TransitionLatency & { status: GameStatus }) | null
  buckets: { on: MusicBucket; off: MusicBucket }
  incidents: PerfIncident[]
}

interface PendingTransition {
  phaseStartedAt: number
  previousEndsAt: number
  receivedAt: number
  status: GameStatus
}

// Mémoire du tas JavaScript : propre à Chrome, absente des types standard.
interface ChromeMemory {
  usedJSHeapSize: number
  jsHeapSizeLimit: number
}

const MEGABYTE = 1024 * 1024

function emptySample(): Sample {
  return { durationMs: 0, frames: 0, longTasks: 0, longTaskMaxMs: 0, tickGapMaxMs: 0, renders: 0 }
}

function emptyBucket(): MusicBucket {
  return {
    seconds: 0,
    frames: 0,
    minFps: null,
    longTasks: 0,
    longTaskMaxMs: 0,
    tickGapMaxMs: 0,
    transitions: 0,
    tvLatencySumMs: 0,
    tvLatencyMaxMs: 0,
    hostLatencyMaxMs: 0,
    incidents: 0,
  }
}

function fpsOf(sample: Sample): number {
  return sample.durationMs > 0 ? (sample.frames * 1000) / sample.durationMs : 0
}

function supportsLongTasks(): boolean {
  return typeof PerformanceObserver !== 'undefined' && (PerformanceObserver.supportedEntryTypes ?? []).includes('longtask')
}

class PerfMonitor {
  private isRunning = false
  private serverOffsetMs = 0
  private current = emptySample()
  private samples: Sample[] = []
  private sampleStartedAt = 0
  private lastTickAt = 0
  private tickId: ReturnType<typeof setInterval> | null = null
  private frameId: number | null = null
  private observer: PerformanceObserver | null = null
  private buckets = { on: emptyBucket(), off: emptyBucket() }
  private incidents: PerfIncident[] = []
  // hostMusic : réglage de l'hôte ; la musique jouée tient compte aussi du panneau (isMusicOn).
  private teamCounts: Record<string, number> = {}
  private streaks: StreakStats = { active: [], zero: 0, missing: 0 }
  private drawing: DrawingStats | null = null
  private context: { status: GameStatus | null; index: number | null; hostMusic: boolean; effects: boolean } = {
    status: null,
    index: null,
    hostMusic: false,
    effects: false,
  }
  private lastPhase: { startedAt: number; endsAt: number } | null = null
  private pending: PendingTransition | null = null
  private lastTransition: PerfSnapshot['lastTransition'] = null
  private lastDecodeCount = 0

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.sampleStartedAt = performance.now()
    this.lastTickAt = this.sampleStartedAt
    this.lastDecodeCount = musicPlayer.stats.decodeCount
    this.tickId = setInterval(() => this.tick(), TICK_MS)
    const onFrame = () => {
      this.current.frames++
      this.frameId = requestAnimationFrame(onFrame)
    }
    this.frameId = requestAnimationFrame(onFrame)
    if (supportsLongTasks()) {
      this.observer = new PerformanceObserver((list) => list.getEntries().forEach((entry) => this.noteLongTask(entry.duration)))
      this.observer.observe({ entryTypes: ['longtask'] })
    }
  }

  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    if (this.tickId !== null) clearInterval(this.tickId)
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    this.observer?.disconnect()
    this.tickId = null
    this.frameId = null
    this.observer = null
  }

  setServerOffset(offsetMs: number): void {
    this.serverOffsetMs = offsetMs
  }

  // Appelé à chaque état reçu de la base, avant tout rendu : heure de réception d'une nouvelle phase.
  // L'état est retenu même panneau éteint (léger) : allumé en pleine partie, il sait déjà où elle en est.
  // Dessin rendu par la TV (null : plus de manche affichée).
  noteDrawing(stats: DrawingStats | null): void {
    this.drawing = stats
  }

  noteSession(session: PublicSession): void {
    const sound = soundSettingsOf(session)
    this.context = { status: session.status, index: session.currentIndex, hostMusic: sound.music, effects: sound.effects }
    this.teamCounts = {}
    for (const player of Object.values(session.players)) if (player.team) this.teamCounts[player.team] = (this.teamCounts[player.team] ?? 0) + 1
    this.streaks = streakStatsOf(session)
    const previous = this.lastPhase
    if (this.isRunning && previous !== null && previous.startedAt !== session.phaseStartedAt) {
      this.pending = {
        phaseStartedAt: session.phaseStartedAt,
        previousEndsAt: previous.endsAt,
        receivedAt: this.serverNow(),
        status: session.status,
      }
    }
    this.lastPhase = { startedAt: session.phaseStartedAt, endsAt: session.phaseEndsAt }
  }

  // Appelé juste avant que l'image montrant la phase soit peinte (requestAnimationFrame après le rendu).
  noteDisplayed(phaseStartedAt: number): void {
    const pending = this.pending
    if (!this.isRunning || pending?.phaseStartedAt !== phaseStartedAt) return
    this.pending = null
    const latency = transitionLatency({
      previousEndsAt: pending.previousEndsAt,
      writtenAt: pending.phaseStartedAt,
      receivedAt: pending.receivedAt,
      displayedAt: this.serverNow(),
    })
    this.lastTransition = { ...latency, status: pending.status }
    const bucket = this.bucket()
    bucket.transitions++
    bucket.tvLatencySumMs += latency.tvMs
    bucket.tvLatencyMaxMs = Math.max(bucket.tvLatencyMaxMs, latency.tvMs)
    bucket.hostLatencyMaxMs = Math.max(bucket.hostLatencyMaxMs, latency.hostMs ?? 0)
    if (latency.tvMs > PERF_THRESHOLDS.stateLatencyMs) {
      this.addIncident('state', latency.tvMs, `${pending.status} : réseau ${latency.networkMs} ms, affichage ${latency.displayMs} ms`)
    }
    if (latency.hostMs !== null && latency.hostMs > PERF_THRESHOLDS.stateLatencyMs) {
      this.addIncident('host', latency.hostMs, `${pending.status} publié après l'échéance`)
    }
  }

  noteRender(): void {
    if (this.isRunning) this.current.renders++
  }

  snapshot(): PerfSnapshot {
    const samples = this.samples
    const totalMs = samples.reduce((sum, sample) => sum + sample.durationMs, 0)
    const fullSamples = samples.filter((sample) => sample.durationMs >= MIN_SAMPLE_MS)
    const last = samples[samples.length - 1]
    const memory = (performance as Performance & { memory?: ChromeMemory }).memory
    return {
      fps: last ? Math.round(fpsOf(last)) : 0,
      minFps: fullSamples.length > 0 ? Math.round(Math.min(...fullSamples.map(fpsOf))) : null,
      longTasks: samples.reduce((sum, sample) => sum + sample.longTasks, 0),
      longTaskMaxMs: Math.round(Math.max(0, ...samples.map((sample) => sample.longTaskMaxMs))),
      tickGapMaxMs: Math.round(Math.max(0, ...samples.map((sample) => sample.tickGapMaxMs))),
      rendersPerSecond: totalMs > 0 ? Math.round((samples.reduce((sum, sample) => sum + sample.renders, 0) * 1000) / totalMs) : 0,
      supportsLongTasks: supportsLongTasks(),
      memory: memory ? { usedMb: Math.round(memory.usedJSHeapSize / MEGABYTE), limitMb: Math.round(memory.jsHeapSizeLimit / MEGABYTE) } : null,
      screen: `${innerWidth}×${innerHeight} ×${devicePixelRatio}`,
      teamColumns: this.teamColumnStats(),
      streaks: this.streaks,
      drawing: this.drawing,
      chromeVersion: /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1] ?? '?',
      musicOn: this.isMusicOn(),
      musicForcedOff: isPerfMusicForcedOff(),
      effectsOn: this.context.effects,
      music: musicPlayer.stats,
      keepAwake: keepAwakeStatus(),
      lastTransition: this.lastTransition,
      buckets: { on: { ...this.buckets.on }, off: { ...this.buckets.off } },
      incidents: [...this.incidents].reverse(),
    }
  }

  // Lu dans la page (colonnes d'équipes affichées) : ce que la TV montre vraiment, à comparer aux données.
  private teamColumnStats(): PerfSnapshot['teamColumns'] {
    const columns = [...document.querySelectorAll<HTMLElement>('.team-column[data-team]')]
    if (columns.length === 0) return null
    const teams = columns.map((column) => {
      const team = column.dataset.team ?? '?'
      const bottom = column.getBoundingClientRect().bottom
      const members = [...column.querySelectorAll<HTMLElement>('.team-member')]
      const shown = members.filter((member) => member.getBoundingClientRect().bottom <= bottom + 1).length
      const first = members[0]?.getBoundingClientRect()
      const gap = parseFloat(getComputedStyle(column.querySelector('.team-column-members') ?? column).rowGap) || 0
      const capacity = first && first.height > 0 ? Math.floor((bottom - first.top + gap) / (first.height + gap)) : 0
      return { team, received: this.teamCounts[team] ?? 0, shown, capacity }
    })
    const scaled = columns[0].closest<HTMLElement>('.lobby-players, .team-draw')
    const scale = scaled ? getComputedStyle(scaled).getPropertyValue('--fit-scale').trim() || '1' : '?'
    return { scale, teams }
  }

  private serverNow(): number {
    return Date.now() + this.serverOffsetMs
  }

  private isMusicOn(): boolean {
    return this.context.hostMusic && !isPerfMusicForcedOff()
  }

  private bucket(): MusicBucket {
    return this.isMusicOn() ? this.buckets.on : this.buckets.off
  }

  private tick(): void {
    const now = performance.now()
    const gap = now - this.lastTickAt
    this.lastTickAt = now
    this.current.tickGapMaxMs = Math.max(this.current.tickGapMaxMs, gap)
    if (gap > PERF_THRESHOLDS.tickGapMs) this.addIncident('tick', gap, `battement attendu toutes les ${TICK_MS} ms`)
    this.noteDecodes()
    if (now - this.sampleStartedAt >= 1000) this.closeSample(now)
  }

  private noteLongTask(durationMs: number): void {
    this.current.longTasks++
    this.current.longTaskMaxMs = Math.max(this.current.longTaskMaxMs, durationMs)
    if (durationMs > PERF_THRESHOLDS.longTaskMs) this.addIncident('task', durationMs, 'tâche longue')
  }

  // Décodage de musique terminé depuis le dernier battement : noté au journal (pour le relier aux incidents).
  private noteDecodes(): void {
    const { decodeCount, lastDecode } = musicPlayer.stats
    if (decodeCount === this.lastDecodeCount || !lastDecode) return
    this.lastDecodeCount = decodeCount
    this.addIncident('decode', lastDecode.ms, `décodage de ${lastDecode.track}`)
  }

  private closeSample(now: number): void {
    const sample = { ...this.current, durationMs: now - this.sampleStartedAt }
    this.current = emptySample()
    this.sampleStartedAt = now
    this.samples = [...this.samples, sample].slice(-WINDOW_SECONDS)
    const bucket = this.bucket()
    bucket.seconds += sample.durationMs / 1000
    bucket.frames += sample.frames
    if (sample.durationMs >= MIN_SAMPLE_MS) {
      const fps = fpsOf(sample)
      bucket.minFps = bucket.minFps === null ? fps : Math.min(bucket.minFps, fps)
    }
    bucket.longTasks += sample.longTasks
    bucket.longTaskMaxMs = Math.max(bucket.longTaskMaxMs, sample.longTaskMaxMs)
    bucket.tickGapMaxMs = Math.max(bucket.tickGapMaxMs, sample.tickGapMaxMs)
  }

  private addIncident(kind: PerfIncidentKind, valueMs: number, detail: string): void {
    const incident: PerfIncident = {
      at: Date.now(),
      kind,
      valueMs: Math.round(valueMs),
      detail,
      status: this.context.status,
      index: this.context.index,
      music: this.isMusicOn(),
      decoding: musicPlayer.stats.decodingCount > 0,
    }
    this.incidents = [...this.incidents, incident].slice(-MAX_INCIDENTS)
    if (kind !== 'decode') this.bucket().incidents++
    console.warn('[perf]', JSON.stringify(incident))
  }
}

// Un seul moniteur pour la page.
export const perfMonitor = new PerfMonitor()

function streakStatsOf(session: PublicSession): StreakStats {
  const players = Object.values(session.players)
  const active = players
    .filter((player) => (player.streak ?? 0) > 0)
    .map((player) => ({ name: player.name, streak: player.streak ?? 0 }))
    .sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name, 'fr'))
  return {
    active,
    zero: players.filter((player) => player.streak === 0).length,
    missing: players.filter((player) => player.streak === undefined).length,
  }
}
