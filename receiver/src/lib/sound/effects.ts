import type { SoundEffectId } from '@shared/sound'

// Effets sonores synthétisés (spec 17) : oscillateurs, bruit et enveloppes de volume, aucun fichier.
// Chaque effet joue dans `out` à partir de l'instant `at` (horloge du contexte) et renvoie sa durée
// en secondes. Les volumes relatifs sont dans shared/sound.ts (SOUND_EFFECTS).

type Synth = (context: AudioContext, out: AudioNode, at: number) => number

// Notes utilisées (Hz).
const C4 = 261.63
const G4 = 392
const C5 = 523.25
const E5 = 659.25
const G5 = 783.99

// Volume quasi nul de fin d'enveloppe : une rampe exponentielle ne peut pas atteindre 0.
const SILENT = 0.0001

interface ToneOptions {
  type: OscillatorType
  from: number
  // Glissement de hauteur jusqu'à cette fréquence, sur toute la durée.
  to?: number
  at: number
  duration: number
  peak: number
}

// Note courte : attaque très brève, puis extinction exponentielle (pas de clic).
function tone(context: AudioContext, out: AudioNode, { type, from, to, at, duration, peak }: ToneOptions): void {
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, at)
  if (to !== undefined) oscillator.frequency.exponentialRampToValueAtTime(to, at + duration)
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(SILENT, at)
  envelope.gain.exponentialRampToValueAtTime(peak, at + 0.008)
  envelope.gain.exponentialRampToValueAtTime(SILENT, at + duration)
  oscillator.connect(envelope)
  envelope.connect(out)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.02)
}

// Accord bref en dents de scie adoucies par un filtre : « stab » de cuivres synthétiques.
function stab(context: AudioContext, out: AudioNode, frequencies: readonly number[], at: number, duration: number): void {
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2_800, at)
  filter.frequency.exponentialRampToValueAtTime(900, at + duration)
  filter.connect(out)
  for (const frequency of frequencies) {
    tone(context, filter, { type: 'sawtooth', from: frequency, at, duration, peak: 0.22 })
  }
}

// Bruit blanc d'une seconde, créé une fois par contexte.
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>()

function noiseBuffer(context: AudioContext): AudioBuffer {
  const existing = noiseBuffers.get(context)
  if (existing) return existing
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  noiseBuffers.set(context, buffer)
  return buffer
}

// Souffle qui monte (bruit filtré dont la fréquence glisse vers l'aigu).
function whoosh(context: AudioContext, out: AudioNode, at: number, duration: number): void {
  const source = context.createBufferSource()
  source.buffer = noiseBuffer(context)
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(400, at)
  filter.frequency.exponentialRampToValueAtTime(3_500, at + duration)
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(SILENT, at)
  envelope.gain.exponentialRampToValueAtTime(0.5, at + duration * 0.7)
  envelope.gain.exponentialRampToValueAtTime(SILENT, at + duration)
  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(out)
  source.start(at)
  source.stop(at + duration + 0.02)
}

const SYNTHS: Record<SoundEffectId, Synth> = {
  // « Bloop-bloop » montant : quelqu'un arrive.
  playerJoined: (context, out, at) => {
    tone(context, out, { type: 'triangle', from: C5, to: C5 * 1.06, at, duration: 0.1, peak: 0.6 })
    tone(context, out, { type: 'triangle', from: G5, to: G5 * 1.06, at: at + 0.08, duration: 0.16, peak: 0.6 })
    return 0.24
  },
  // Souffle, puis accord majeur : la question arrive.
  questionShown: (context, out, at) => {
    whoosh(context, out, at, 0.32)
    stab(context, out, [C5, E5, G5], at + 0.28, 0.32)
    return 0.6
  },
  // Deux notes qui descendent : tout s'arrête.
  paused: (context, out, at) => {
    tone(context, out, { type: 'triangle', from: G4, at, duration: 0.18, peak: 0.6 })
    tone(context, out, { type: 'triangle', from: C4, at: at + 0.16, duration: 0.26, peak: 0.6 })
    return 0.42
  },
  // Les mêmes notes qui remontent : ça repart.
  resumed: (context, out, at) => {
    tone(context, out, { type: 'triangle', from: C4, at, duration: 0.16, peak: 0.6 })
    tone(context, out, { type: 'triangle', from: G4, at: at + 0.14, duration: 0.24, peak: 0.6 })
    return 0.38
  },
}

export function synthesize(id: SoundEffectId, context: AudioContext, out: AudioNode, at: number): number {
  return SYNTHS[id](context, out, at)
}
