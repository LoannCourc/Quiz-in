import {
  JINGLE_LATE_MS,
  MUSIC_CROSSFADE_MS,
  MUSIC_FAST_STOP_MS,
  MUSIC_JINGLE_FADE_OUT_MS,
  MUSIC_PAUSE_FADE_MS,
  MUSIC_RESUME_CROSSFADE_MS,
  type MusicPlan,
} from '@shared/music'
import { bakeLoopSeam, type LoopRegion } from '@shared/loopSeam'
import { MUSIC_DIRECTORY, MUSIC_TRACKS, type MusicTrackId } from '@shared/musicTracks'

import { decodedBytes } from './musicLoop'
import { soundEngine } from './soundEngine'

// Lecteur des musiques de la TV (spec 17). Les fichiers sont téléchargés un par un en arrière-plan
// (jamais avant le premier affichage), décodés une fois, puis joués par Web Audio : boucles à
// l'échantillon près (musique de fin : sur le début du fichier, raccord adouci), démarrage net à l'heure
// de l'écran de fin, fondus enchaînés, baisse pendant la pause. Le canal
// musique du moteur applique le volume de l'hôte et le ducking des effets.
//
// Mémoire de la box : une piste décodée est stockée en échantillons bruts (4 octets chacun). Pour la
// limiter, chaque piste est décodée en mono à MUSIC_SAMPLE_RATE (Salon_music, 137 s : environ 17,5 Mo
// au lieu de 50 en stéréo 48 kHz), et les pistes décodées ne dépassent pas MUSIC_MEMORY_BUDGET_BYTES :
// au-delà, les moins récemment utilisées sont libérées (elles seront redécodées depuis le fichier gardé,
// compressé, en mémoire).
export const MUSIC_SAMPLE_RATE = 32_000
export const MUSIC_MEMORY_BUDGET_BYTES = 32 * 1024 * 1024
// Démarrage net (musique de fin, à l'arrivée du podium) : fondu très court, pour éviter un clic.
const JINGLE_FADE_IN_S = 0.02
// Raccord d'une boucle sur le début d'un fichier (loopEndS) : fondu enchaîné de la fin dans le début.
const LOOP_SEAM_FADE_S = 0.04

// Décodage d'un fichier de musique en mono, à MUSIC_SAMPLE_RATE (le navigateur rééchantillonne).
export async function decodeMusic(data: ArrayBuffer): Promise<AudioBuffer> {
  const decoded = await new OfflineAudioContext(1, 1, MUSIC_SAMPLE_RATE).decodeAudioData(data)
  if (decoded.numberOfChannels === 1) return decoded
  const mono = new AudioBuffer({ length: decoded.length, numberOfChannels: 1, sampleRate: decoded.sampleRate })
  const target = mono.getChannelData(0)
  const channels = decoded.numberOfChannels
  for (let channel = 0; channel < channels; channel++) {
    const samples = decoded.getChannelData(channel)
    for (let i = 0; i < samples.length; i++) target[i] += samples[i] / channels
  }
  return mono
}

// Diagnostic (panneau de mesures ?perf=1) : pistes décodées, mémoire, décodage en cours ou dernier.
export interface MusicStats {
  isEnabled: boolean
  decodedTracks: number
  decodedBytes: number
  // Fichiers téléchargés gardés compressés en mémoire (pour redécoder sans retélécharger).
  fileBytes: number
  decodingCount: number
  lastDecode: { track: MusicTrackId; ms: number; at: number } | null
  decodeCount: number
}

interface Playing {
  key: string
  track: MusicTrackId
  source: AudioBufferSourceNode
  gain: GainNode
  // Démarrée net à son heure (MusicTrack.cue) : jamais retenue en pause, fondu de sortie plus long.
  isCue: boolean
  // Heure du contexte à laquelle la lecture a commencé, et position de départ (s) : position actuelle.
  startedAt: number
  offsetS: number
}

function musicUrl(track: MusicTrackId): string {
  return `${import.meta.env.BASE_URL}${MUSIC_DIRECTORY}${MUSIC_TRACKS[track].file}`
}

function warnInDev(message: string, error?: unknown): void {
  if (import.meta.env.DEV) console.warn(`[musique] ${message}`, error ?? '')
}

class MusicPlayer {
  private readonly files = new Map<MusicTrackId, ArrayBuffer>()
  private readonly decoded = new Map<MusicTrackId, { buffer: AudioBuffer; usedAt: number }>()
  private readonly loading = new Map<MusicTrackId, Promise<AudioBuffer | null>>()
  // Fichiers absents ou illisibles : jamais redemandés au serveur.
  private readonly missing = new Set<MusicTrackId>()
  private placeholderBuffer: AudioBuffer | null = null
  private output: { context: AudioContext; input: AudioNode } | null = null
  // Zones à boucler des pistes qui bouclent sur le début du fichier (raccord adouci au décodage).
  private readonly loopRegions = new Map<MusicTrackId, LoopRegion>()
  private lastDecode: MusicStats['lastDecode'] = null
  private decodeCount = 0
  private current: Playing | null = null
  // Pause : musique de la phase retenue et sa position, reprise au même endroit.
  private held: { track: MusicTrackId; offsetS: number } | null = null
  // Clé du dernier plan appliqué : le même plan (mise à jour de la session) ne relance rien.
  private planKey: string | null = null
  // Numéro du dernier ordre : un démarrage dépassé pendant son décodage s'abandonne.
  private generation = 0
  private stopTimer: ReturnType<typeof setTimeout> | null = null
  private isEnabled = true
  private preparing: Promise<void> = Promise.resolve()

  // Télécharge puis décode à l'avance les pistes de la partie, une par une, sans bloquer l'affichage.
  prepare(tracks: readonly MusicTrackId[]): void {
    this.preparing = this.preparing.then(async () => {
      for (const track of tracks) await this.buffer(track)
    })
  }

  // Fin de l'écran de la partie (test du son, partie supprimée) : silence, et plus rien en attente.
  reset(): void {
    this.generation += 1
    this.scheduleStopBy(undefined, 0)
    this.stop(MUSIC_FAST_STOP_MS)
    this.planKey = null
    this.held = null
  }

  setEnabled(isEnabled: boolean): void {
    if (this.isEnabled === isEnabled) return
    this.isEnabled = isEnabled
    if (!isEnabled) {
      this.generation += 1
      this.stop(MUSIC_FAST_STOP_MS)
      this.planKey = null
      this.held = null
    }
  }

  // Applique le plan de la phase (shared/music.ts) : fondu enchaîné vers la nouvelle piste, musique de fin à
  // son heure, arrêt avant l'extrait d'un blind test. Pause : la musique en cours est retenue (sa position est
  // gardée) et la musique d'attente joue ; à la reprise, elle repart là où elle s'était arrêtée.
  apply(plan: MusicPlan, nowServer: number): void {
    if (!this.ensureOutput() || !this.isEnabled) return
    this.scheduleStopBy(plan.stopBy, nowServer)

    const key = plan.isPaused ? 'pause' : plan.track === null ? 'silence' : `${plan.track}@${plan.startAt ?? ''}`
    if (key === this.planKey) return
    // La boucle demandée joue déjà (pause pendant la musique d'attente, ou reprise vers elle) : rien ne change.
    const playing = this.current
    if (playing && !playing.isCue && playing.track === plan.track && !plan.heldTrack) {
      this.planKey = key
      if (!plan.isPaused) this.held = null
      return
    }
    const wasPaused = this.planKey === 'pause'
    this.planKey = key
    // Un démarrage encore en cours de décodage (phase précédente) est abandonné.
    const generation = ++this.generation
    const transition = this.transition(plan, wasPaused)
    this.stop(transition.fadeOutMs)
    if (plan.track === null) return
    const delayMs = plan.startAt === undefined ? 0 : plan.startAt - nowServer
    // Piste jouée une fois déjà bien entamée (TV ouverte en retard) : pas jouée ; une boucle démarre aussitôt.
    if (delayMs < -JINGLE_LATE_MS && !MUSIC_TRACKS[plan.track].loop) return
    void this.start(plan.track, key, Math.max(0, delayMs), generation, transition.fadeInMs, transition.offsetS)
  }

  // Durées des fondus et position de départ du passage vers ce plan. Entrée en pause : la musique en
  // cours est retenue si c'est celle de la phase. Sortie de pause : la musique retenue reprend à sa position.
  private transition(plan: MusicPlan, wasPaused: boolean): { fadeOutMs: number; fadeInMs: number; offsetS: number } {
    if (plan.isPaused) {
      const playing = this.current
      this.held = playing && !playing.isCue && playing.track === plan.heldTrack ? { track: playing.track, offsetS: this.positionOf(playing) } : null
      return { fadeOutMs: MUSIC_PAUSE_FADE_MS, fadeInMs: MUSIC_PAUSE_FADE_MS, offsetS: 0 }
    }
    if (wasPaused) {
      const offsetS = this.held && this.held.track === plan.track ? this.held.offsetS : 0
      this.held = null
      return { fadeOutMs: plan.fastStop ? MUSIC_FAST_STOP_MS : MUSIC_RESUME_CROSSFADE_MS, fadeInMs: MUSIC_RESUME_CROSSFADE_MS, offsetS }
    }
    const fadeOutMs = plan.fastStop ? MUSIC_FAST_STOP_MS : this.current?.isCue ? MUSIC_JINGLE_FADE_OUT_MS : MUSIC_CROSSFADE_MS
    return { fadeOutMs, fadeInMs: MUSIC_CROSSFADE_MS, offsetS: 0 }
  }

  // Position actuelle d'une boucle (s), pour la reprendre au même endroit.
  private positionOf(playing: Playing): number {
    const elapsedS = this.output ? this.output.context.currentTime - playing.startedAt : 0
    const duration = playing.source.buffer?.duration ?? 0
    if (elapsedS <= 0 || duration <= 0) return playing.offsetS
    return (playing.offsetS + elapsedS) % duration
  }

  // Galerie de développement : écouter une piste seule.
  preview(track: MusicTrackId | null): void {
    this.apply({ track, startAt: track && MUSIC_TRACKS[track].cue ? Date.now() : undefined, fastStop: false, isPaused: false }, Date.now())
  }

  private ensureOutput(): { context: AudioContext; input: AudioNode } | null {
    if (this.output) return this.output
    soundEngine.start()
    this.output = soundEngine.musicInput
    return this.output
  }

  // fadeInMs : fondu d'entrée d'une boucle (une piste « cue » démarre presque net) ; offsetS : position de départ.
  private async start(track: MusicTrackId, key: string, delayMs: number, generation: number, fadeInMs: number, offsetS: number): Promise<void> {
    const buffer = await this.buffer(track)
    const output = this.output
    if (!buffer || !output || generation !== this.generation) return
    const { context } = output
    const spec = MUSIC_TRACKS[track]
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = spec.loop
    const region = this.loopRegions.get(track)
    if (region) {
      source.loopStart = region.startS
      source.loopEnd = region.endS
    }
    const gain = context.createGain()
    const startAt = context.currentTime + delayMs / 1000
    const fadeS = spec.cue ? JINGLE_FADE_IN_S : fadeInMs / 1000
    gain.gain.setValueAtTime(0, startAt)
    gain.gain.linearRampToValueAtTime(spec.volume, startAt + fadeS)
    source.connect(gain)
    gain.connect(output.input)
    source.start(startAt, offsetS)
    const playing: Playing = { key, track, source, gain, isCue: spec.cue === true, startedAt: startAt, offsetS }
    source.onended = () => {
      gain.disconnect()
      if (this.current === playing) this.current = null
    }
    this.current = playing
  }

  // Arrête la piste en cours par un fondu de fadeMs.
  private stop(fadeMs: number): void {
    const playing = this.current
    if (!playing || !this.output) return
    this.current = null
    const now = this.output.context.currentTime
    const { gain, source } = playing
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000)
    try {
      source.stop(now + fadeMs / 1000 + 0.05)
    } catch {
      // Jingle déjà terminé : rien à arrêter.
    }
  }

  // Blind test : la musique s'est tue à stopBy (fondu rapide juste avant), avant l'extrait.
  private scheduleStopBy(stopBy: number | undefined, nowServer: number): void {
    if (this.stopTimer !== null) clearTimeout(this.stopTimer)
    this.stopTimer = null
    if (stopBy === undefined) return
    this.stopTimer = setTimeout(() => this.stop(MUSIC_FAST_STOP_MS), Math.max(0, stopBy - MUSIC_FAST_STOP_MS - nowServer))
  }

  // Piste décodée (en mémoire, ou téléchargée et décodée maintenant) ; null si le fichier manque ou est
  // illisible : silence, ou boucle de remplacement en développement.
  private buffer(track: MusicTrackId): Promise<AudioBuffer | null> {
    const ready = this.decoded.get(track)
    if (ready) {
      ready.usedAt = performance.now()
      return Promise.resolve(ready.buffer)
    }
    if (this.missing.has(track)) return this.placeholder()
    const pending = this.loading.get(track)
    if (pending) return pending
    const loading = this.load(track).finally(() => this.loading.delete(track))
    this.loading.set(track, loading)
    return loading
  }

  private async load(track: MusicTrackId): Promise<AudioBuffer | null> {
    try {
      let file = this.files.get(track)
      if (!file) {
        const response = await fetch(musicUrl(track))
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        file = await response.arrayBuffer()
        this.files.set(track, file)
      }
      // decodeAudioData consomme le tampon : on décode une copie, le fichier reste disponible.
      const decodeStartedAt = performance.now()
      const buffer = await decodeMusic(file.slice(0))
      const { loopEndS } = MUSIC_TRACKS[track]
      if (loopEndS !== undefined) this.loopRegions.set(track, bakeLoopSeam(buffer.getChannelData(0), buffer.sampleRate, loopEndS, LOOP_SEAM_FADE_S))
      this.lastDecode = { track, ms: Math.round(performance.now() - decodeStartedAt), at: Date.now() }
      this.decodeCount++
      this.keep(track, buffer)
      return buffer
    } catch (error) {
      warnInDev(`${MUSIC_TRACKS[track].file} indisponible`, error)
      this.missing.add(track)
      return this.placeholder()
    }
  }

  // Garde la piste décodée, puis libère les moins récemment utilisées au-delà du budget (jamais celle
  // qui joue).
  private keep(track: MusicTrackId, buffer: AudioBuffer): void {
    this.decoded.set(track, { buffer, usedAt: performance.now() })
    const playing = this.current?.source.buffer
    const byAge = [...this.decoded.entries()].sort((a, b) => a[1].usedAt - b[1].usedAt)
    let total = byAge.reduce((sum, [, entry]) => sum + decodedBytes(entry.buffer), 0)
    for (const [id, entry] of byAge) {
      if (total <= MUSIC_MEMORY_BUDGET_BYTES) break
      if (id === track || entry.buffer === playing) continue
      this.decoded.delete(id)
      total -= decodedBytes(entry.buffer)
    }
  }

  // Développement : boucle synthétisée à la place d'un fichier absent (jamais dans le site publié).
  private async placeholder(): Promise<AudioBuffer | null> {
    if (!import.meta.env.DEV || !this.output) return null
    if (!this.placeholderBuffer) {
      const { createPlaceholderLoop } = await import('../../demo/placeholderLoop')
      this.placeholderBuffer = createPlaceholderLoop(this.output.context)
    }
    return this.placeholderBuffer
  }

  // Mémoire occupée par les pistes décodées (octets), pour le diagnostic.
  get decodedMemory(): number {
    return [...this.decoded.values()].reduce((sum, entry) => sum + decodedBytes(entry.buffer), 0)
  }

  get stats(): MusicStats {
    return {
      isEnabled: this.isEnabled,
      decodedTracks: this.decoded.size,
      decodedBytes: this.decodedMemory,
      fileBytes: [...this.files.values()].reduce((sum, file) => sum + file.byteLength, 0),
      decodingCount: this.loading.size,
      lastDecode: this.lastDecode,
      decodeCount: this.decodeCount,
    }
  }
}

// Un seul lecteur pour toute la page.
export const musicPlayer = new MusicPlayer()
