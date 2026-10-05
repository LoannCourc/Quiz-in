import {
  channelGains,
  DEFAULT_SOUND_SETTINGS,
  DUCK_ATTACK_MS,
  DUCK_LEVEL,
  DUCK_RELEASE_MS,
  EFFECT_REPEAT_MIN_MS,
  MAX_EFFECT_VOICES,
  SOUND_EFFECTS,
  type SoundEffectId,
} from '@shared/sound'
import type { SoundSettings } from '@shared/types'

import { onAudioUnlock } from '../audioUnlock'
import { synthesize } from './effects'

// Moteur audio de la TV (spec 17) : un seul AudioContext pour toute la page, deux canaux.
//   musique → ducking → sortie ; effets → sortie.
// Le volume général et les interrupteurs de l'hôte règlent le gain de chaque canal. L'extrait d'un
// blind test garde son propre lecteur (tvAudioPlayer) : sans autorisation CORS de la source, Web Audio
// le rendrait muet.

// unsupported : pas de Web Audio. idle : contexte pas encore créé. suspended : le navigateur attend
// un geste (plan B) ; running : le son sort.
export type SoundEngineState = 'unsupported' | 'idle' | 'suspended' | 'running'

// Changement de volume d'un canal : lissé (constante de temps en secondes), jamais de saut audible.
const GAIN_SMOOTHING_S = 0.05
// Les effets sont programmés un tout petit peu dans le futur : leur début n'est jamais tronqué.
const SCHEDULE_AHEAD_S = 0.01

interface Graph {
  context: AudioContext
  music: GainNode
  duck: GainNode
  effects: GainNode
}

class SoundEngine {
  private graph: Graph | null = null
  private isUnsupported = false
  private settings: SoundSettings = DEFAULT_SOUND_SETTINGS
  private readonly listeners = new Set<() => void>()
  private activeVoices = 0
  private readonly lastPlayedAt = new Map<SoundEffectId, number>()
  // Heure (horloge du contexte) jusqu'à laquelle la musique reste baissée.
  private duckedUntil = 0

  get state(): SoundEngineState {
    if (this.isUnsupported) return 'unsupported'
    if (!this.graph) return 'idle'
    return this.graph.context.state === 'running' ? 'running' : 'suspended'
  }

  // Contexte et entrée du canal musique (musiques du lot 3, écran de test).
  get musicInput(): { context: AudioContext; input: AudioNode } | null {
    return this.graph ? { context: this.graph.context, input: this.graph.music } : null
  }

  // Crée le contexte (une seule fois) et demande à démarrer le son. En mode Cast, la box l'autorise
  // sans geste ; en plan B, il reste suspendu jusqu'au premier clic (audioUnlock).
  start(): void {
    if (this.graph || this.isUnsupported) return
    if (typeof AudioContext === 'undefined') {
      this.isUnsupported = true
      this.notify()
      return
    }
    try {
      const context = new AudioContext({ latencyHint: 'interactive' })
      const music = context.createGain()
      const duck = context.createGain()
      const effects = context.createGain()
      music.connect(duck)
      duck.connect(context.destination)
      effects.connect(context.destination)
      context.onstatechange = () => this.notify()
      this.graph = { context, music, duck, effects }
      this.applyGains(0)
      this.resume()
    } catch (error) {
      console.warn('[son] Web Audio indisponible', error)
      this.isUnsupported = true
    }
    this.notify()
  }

  resume(): void {
    this.graph?.context.resume().catch((error: unknown) => console.warn('[son] Démarrage du son refusé', error))
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  applySettings(settings: SoundSettings): void {
    this.settings = settings
    this.applyGains(GAIN_SMOOTHING_S)
  }

  // Joue un effet s'il est autorisé : effets activés, son démarré, pas trop d'effets en même temps,
  // et pas le même effet il y a moins de EFFECT_REPEAT_MIN_MS. Vrai s'il a été joué. step : hauteur
  // de l'arrivée d'une ligne du classement.
  playEffect(id: SoundEffectId, step?: number): boolean {
    const graph = this.graph
    if (!graph || graph.context.state !== 'running' || !this.settings.effects) return false
    const nowMs = performance.now()
    if (this.activeVoices >= MAX_EFFECT_VOICES || nowMs - (this.lastPlayedAt.get(id) ?? -Infinity) < EFFECT_REPEAT_MIN_MS) {
      return false
    }
    this.lastPlayedAt.set(id, nowMs)
    const { context } = graph
    const spec = SOUND_EFFECTS[id]
    const output = context.createGain()
    output.gain.value = spec.volume
    output.connect(graph.effects)
    const durationS = synthesize(id, context, output, context.currentTime + SCHEDULE_AHEAD_S, step)
    if (spec.ducks) this.duck(durationS)
    this.activeVoices += 1
    setTimeout(() => {
      this.activeVoices -= 1
      output.disconnect()
    }, (durationS + SCHEDULE_AHEAD_S) * 1000 + 100)
    return true
  }

  // Baisse la musique pendant durationS secondes (prolongée si un autre effet important arrive).
  duck(durationS: number): void {
    if (!this.graph) return
    const { context, duck } = this.graph
    const now = context.currentTime
    const attackEnd = now + DUCK_ATTACK_MS / 1000
    this.duckedUntil = Math.max(this.duckedUntil, now + durationS, attackEnd)
    duck.gain.cancelScheduledValues(now)
    duck.gain.setValueAtTime(duck.gain.value, now)
    duck.gain.linearRampToValueAtTime(DUCK_LEVEL, attackEnd)
    duck.gain.setValueAtTime(DUCK_LEVEL, this.duckedUntil)
    duck.gain.linearRampToValueAtTime(1, this.duckedUntil + DUCK_RELEASE_MS / 1000)
  }

  private applyGains(smoothingS: number): void {
    if (!this.graph) return
    const { context, music, effects } = this.graph
    const gains = channelGains(this.settings)
    if (smoothingS === 0) {
      music.gain.value = gains.music
      effects.gain.value = gains.effects
      return
    }
    music.gain.setTargetAtTime(gains.music, context.currentTime, smoothingS)
    effects.gain.setTargetAtTime(gains.effects, context.currentTime, smoothingS)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }
}

// Un seul moteur pour toute la page.
export const soundEngine = new SoundEngine()

// Plan B : le premier clic dans la page démarre aussi le moteur.
onAudioUnlock(() => soundEngine.resume())
