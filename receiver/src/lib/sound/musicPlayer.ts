import { JINGLE_LATE_MS, MUSIC_CROSSFADE_MS, MUSIC_FAST_STOP_MS, MUSIC_PAUSE_LEVEL, type MusicPlan } from '@shared/music'
import { MUSIC_DIRECTORY, MUSIC_TRACKS, type MusicTrackId } from '@shared/musicTracks'

import { decodedBytes } from './musicLoop'
import { soundEngine } from './soundEngine'

// Lecteur des musiques de la TV (spec 17). Les fichiers sont téléchargés un par un en arrière-plan
// (jamais avant le premier affichage), décodés une fois, puis joués par Web Audio : boucles à
// l'échantillon près, jingles une seule fois, fondus enchaînés, baisse pendant la pause. Le canal
// musique du moteur applique le volume de l'hôte et le ducking des effets.
//
// Mémoire de la box : une piste décodée est stockée en échantillons bruts (4 octets chacun). Pour la
// limiter, chaque piste est décodée en mono à MUSIC_SAMPLE_RATE (Salon_music, 137 s : environ 17,5 Mo
// au lieu de 50 en stéréo 48 kHz), et les pistes décodées ne dépassent pas MUSIC_MEMORY_BUDGET_BYTES :
// au-delà, les moins récemment utilisées sont libérées (elles seront redécodées depuis le fichier gardé,
// compressé, en mémoire).
export const MUSIC_SAMPLE_RATE = 32_000
export const MUSIC_MEMORY_BUDGET_BYTES = 32 * 1024 * 1024
// Démarrage d'un jingle : fondu très court, pour éviter un clic.
const JINGLE_FADE_IN_S = 0.02

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

interface Playing {
  key: string
  source: AudioBufferSourceNode
  gain: GainNode
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
  private output: { context: AudioContext; pause: GainNode } | null = null
  private current: Playing | null = null
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
  }

  setEnabled(isEnabled: boolean): void {
    if (this.isEnabled === isEnabled) return
    this.isEnabled = isEnabled
    if (!isEnabled) {
      this.generation += 1
      this.stop(MUSIC_FAST_STOP_MS)
      this.planKey = null
    }
  }

  // Applique le plan de la phase (shared/music.ts) : fondu enchaîné vers la nouvelle piste, jingle à son
  // heure, arrêt avant l'extrait d'un blind test, niveau de pause.
  apply(plan: MusicPlan, nowServer: number): void {
    const output = this.ensureOutput()
    if (!output || !this.isEnabled) return
    const pauseLevel = plan.isPaused ? MUSIC_PAUSE_LEVEL : 1
    output.pause.gain.setTargetAtTime(pauseLevel, output.context.currentTime, 0.1)
    this.scheduleStopBy(plan.stopBy, nowServer)

    const key = plan.track === null ? 'silence' : `${plan.track}@${plan.startAt ?? ''}`
    if (key === this.planKey) return
    this.planKey = key
    // Un démarrage encore en cours de décodage (phase précédente) est abandonné.
    const generation = ++this.generation
    this.stop(plan.fastStop ? MUSIC_FAST_STOP_MS : MUSIC_CROSSFADE_MS)
    if (plan.track === null) return
    const delayMs = plan.startAt === undefined ? 0 : plan.startAt - nowServer
    // Jingle déjà bien entamé (TV ouverte en retard) : pas joué.
    if (delayMs < -JINGLE_LATE_MS) return
    void this.start(plan.track, key, Math.max(0, delayMs), generation)
  }

  // Galerie de développement : écouter une piste seule.
  preview(track: MusicTrackId | null): void {
    this.apply({ track, startAt: track && !MUSIC_TRACKS[track].loop ? Date.now() : undefined, fastStop: false, isPaused: false }, Date.now())
  }

  private ensureOutput(): { context: AudioContext; pause: GainNode } | null {
    if (this.output) return this.output
    soundEngine.start()
    const music = soundEngine.musicInput
    if (!music) return null
    const pause = music.context.createGain()
    pause.connect(music.input)
    this.output = { context: music.context, pause }
    return this.output
  }

  private async start(track: MusicTrackId, key: string, delayMs: number, generation: number): Promise<void> {
    const buffer = await this.buffer(track)
    const output = this.output
    if (!buffer || !output || generation !== this.generation) return
    const { context } = output
    const spec = MUSIC_TRACKS[track]
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = spec.loop
    const gain = context.createGain()
    const startAt = context.currentTime + delayMs / 1000
    const fadeS = spec.loop ? MUSIC_CROSSFADE_MS / 1000 : JINGLE_FADE_IN_S
    gain.gain.setValueAtTime(0, startAt)
    gain.gain.linearRampToValueAtTime(spec.volume, startAt + fadeS)
    source.connect(gain)
    gain.connect(output.pause)
    source.start(startAt)
    const playing: Playing = { key, source, gain }
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
      const buffer = await decodeMusic(file.slice(0))
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
}

// Un seul lecteur pour toute la page.
export const musicPlayer = new MusicPlayer()
