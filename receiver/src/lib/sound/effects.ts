import { SUSPENSE_DRUMROLL_MS, type SoundEffectId } from '@shared/sound'

// Effets sonores synthétisés (spec 17) : oscillateurs, bruit et enveloppes de volume, aucun fichier.
// Chaque effet joue dans `out` à partir de l'instant `at` (horloge du contexte) et renvoie sa durée
// en secondes. Le contexte peut être hors ligne (auto-test de la galerie, rendu sans haut-parleur). Les volumes relatifs sont dans shared/sound.ts (SOUND_EFFECTS). Esprit plateau de jeu
// télévisé : cuivres synthétiques, bips francs, quelques touches funky.

// step : variante de hauteur (arrivée des lignes du classement), ignorée par les autres effets.
type Synth = (context: BaseAudioContext, out: AudioNode, at: number, step?: number) => number

// Notes utilisées (Hz).
const E2 = 82.41
const A2 = 110
const C4 = 261.63
const E4 = 329.63
const F4 = 349.23
const G4 = 392
const A4 = 440
const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const E6 = 1318.51
const G6 = 1567.98

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
  // Attaque (s) : très brève par défaut.
  attack?: number
}

// Note : attaque, puis extinction exponentielle (pas de clic).
function tone(context: BaseAudioContext, out: AudioNode, { type, from, to, at, duration, peak, attack = 0.008 }: ToneOptions): void {
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, at)
  if (to !== undefined) oscillator.frequency.exponentialRampToValueAtTime(to, at + duration)
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(SILENT, at)
  envelope.gain.exponentialRampToValueAtTime(peak, at + attack)
  envelope.gain.exponentialRampToValueAtTime(SILENT, at + duration)
  oscillator.connect(envelope)
  envelope.connect(out)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.02)
}

// Filtre passe-bas, éventuellement fermé progressivement (« wah »), branché sur out.
function lowpass(context: BaseAudioContext, out: AudioNode, at: number, from: number, to: number, duration: number): BiquadFilterNode {
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(from, at)
  filter.frequency.exponentialRampToValueAtTime(to, at + duration)
  filter.connect(out)
  return filter
}

// Accord bref de cuivres synthétiques (dents de scie adoucies par un filtre qui se ferme).
function brass(context: BaseAudioContext, out: AudioNode, frequencies: readonly number[], at: number, duration: number, peak = 0.22): void {
  const filter = lowpass(context, out, at, 3_200, 900, duration)
  for (const frequency of frequencies) {
    tone(context, filter, { type: 'sawtooth', from: frequency, at, duration, peak, attack: 0.02 })
  }
}

// Bruit blanc d'une seconde, créé une fois par contexte.
const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>()

function noiseBuffer(context: BaseAudioContext): AudioBuffer {
  const existing = noiseBuffers.get(context)
  if (existing) return existing
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  noiseBuffers.set(context, buffer)
  return buffer
}

interface NoiseOptions {
  at: number
  duration: number
  peak: number
  filter: BiquadFilterType
  frequency: number
  // Glissement de la fréquence du filtre jusqu'à cette valeur.
  to?: number
  q?: number
  // Instant du maximum, en fraction de la durée (0 : attaque immédiate).
  peakAt?: number
}

// Bruit filtré avec enveloppe : souffle, caisse claire, claquement, applaudissement.
function noise(context: BaseAudioContext, out: AudioNode, { at, duration, peak, filter: type, frequency, to, q = 1, peakAt = 0 }: NoiseOptions): void {
  const source = context.createBufferSource()
  source.buffer = noiseBuffer(context)
  // Point de départ au hasard dans la seconde de bruit : deux bruits proches ne sont pas identiques.
  const offset = Math.random() * Math.max(0, 1 - duration)
  const filter = context.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(frequency, at)
  if (to !== undefined) filter.frequency.exponentialRampToValueAtTime(to, at + duration)
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(SILENT, at)
  envelope.gain.exponentialRampToValueAtTime(peak, at + Math.max(0.004, duration * peakAt))
  envelope.gain.exponentialRampToValueAtTime(SILENT, at + duration)
  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(out)
  source.start(at, offset)
  source.stop(at + duration + 0.02)
}

// Souffle qui monte (bruit filtré dont la fréquence glisse vers l'aigu).
function whoosh(context: BaseAudioContext, out: AudioNode, at: number, duration: number, peak = 0.5): void {
  noise(context, out, { at, duration, peak, filter: 'bandpass', frequency: 400, to: 3_500, q: 1.2, peakAt: 0.7 })
}

// Notes successives régulières (arpège).
function arpeggio(context: BaseAudioContext, out: AudioNode, notes: readonly number[], at: number, stepS: number, type: OscillatorType, peak: number): number {
  notes.forEach((frequency, index) => tone(context, out, { type, from: frequency, at: at + index * stepS, duration: stepS * 2, peak }))
  return notes.length * stepS + stepS
}

// Roulement de caisse claire : coups rapprochés de plus en plus forts.
function snareRoll(context: BaseAudioContext, out: AudioNode, at: number, duration: number): void {
  const strokeS = 0.045
  const count = Math.floor(duration / strokeS)
  for (let stroke = 0; stroke < count; stroke++) {
    const loudness = 0.15 + 0.7 * (stroke / count) ** 2
    noise(context, out, { at: at + stroke * strokeS, duration: 0.07, peak: loudness, filter: 'bandpass', frequency: 1_800, q: 0.8 })
  }
}

// Applaudissements : une centaine de claquements courts au hasard, qui s'estompent.
function applause(context: BaseAudioContext, out: AudioNode, at: number, duration: number): void {
  const claps = Math.round(duration * 45)
  for (let clap = 0; clap < claps; clap++) {
    const offset = Math.random() * duration
    const fade = 1 - offset / duration
    noise(context, out, { at: at + offset, duration: 0.03, peak: 0.12 * fade + 0.02, filter: 'bandpass', frequency: 1_200 + Math.random() * 1_400, q: 1.5 })
  }
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
    brass(context, out, [C5, E5, G5], at + 0.28, 0.32, 0.3)
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
  // Bip franc du 3-2-1.
  countdown: (context, out, at) => {
    tone(context, out, { type: 'square', from: A4 * 2, at, duration: 0.16, peak: 0.25 })
    tone(context, out, { type: 'sine', from: A4 * 2, at, duration: 0.2, peak: 0.4 })
    return 0.2
  },
  // « Pop » très court : un joueur a répondu.
  answerPop: (context, out, at) => {
    tone(context, out, { type: 'sine', from: 900, to: 1_500, at, duration: 0.07, peak: 0.6 })
    return 0.07
  },
  // Petit arpège brillant : tout le monde a répondu.
  allAnswered: (context, out, at) => arpeggio(context, out, [C6, E6, G6], at, 0.06, 'triangle', 0.45),
  // Tic sec du chrono.
  clockTick: (context, out, at) => {
    noise(context, out, { at, duration: 0.03, peak: 0.5, filter: 'highpass', frequency: 3_000 })
    tone(context, out, { type: 'sine', from: 1_900, at, duration: 0.04, peak: 0.25 })
    return 0.05
  },
  // Buzzer grave, deux dents de scie légèrement désaccordées.
  buzzer: (context, out, at) => {
    const filter = lowpass(context, out, at, 1_400, 600, 0.6)
    tone(context, filter, { type: 'sawtooth', from: A2, at, duration: 0.6, peak: 0.35, attack: 0.01 })
    tone(context, filter, { type: 'sawtooth', from: A2 * 1.03, at, duration: 0.6, peak: 0.35, attack: 0.01 })
    return 0.6
  },
  // Fanfare : trois notes montantes, puis l'accord tenu.
  fanfare: (context, out, at) => {
    brass(context, out, [G4], at, 0.14, 0.4)
    brass(context, out, [C5], at + 0.13, 0.14, 0.4)
    brass(context, out, [E5], at + 0.26, 0.14, 0.4)
    brass(context, out, [C5, E5, G5], at + 0.4, 0.7, 0.28)
    return 1.1
  },
  // « Wah-wah » qui descend : personne n'a trouvé.
  miss: (context, out, at) => {
    const notes = [G4, G4 * 0.944, F4, E4]
    notes.forEach((frequency, index) => {
      const start = at + index * 0.28
      const duration = index === notes.length - 1 ? 0.6 : 0.26
      const filter = lowpass(context, out, start, 2_000, 500, duration)
      tone(context, filter, { type: 'sawtooth', from: frequency, at: start, duration, peak: 0.5, attack: 0.03 })
    })
    return 1.45
  },
  // Notes qui montent vite : les points s'ajoutent.
  pointsUp: (context, out, at) => arpeggio(context, out, [C5, E5, G5, C6, E6, G6], at, 0.05, 'square', 0.3),
  // Glissement : le classement se réorganise.
  rankShuffle: (context, out, at) => {
    whoosh(context, out, at, 0.25, 0.3)
    tone(context, out, { type: 'triangle', from: E5, to: C6, at: at + 0.05, duration: 0.18, peak: 0.35 })
    tone(context, out, { type: 'triangle', from: C6, to: E5, at: at + 0.2, duration: 0.18, peak: 0.3 })
    return 0.4
  },
  // « Flip » de carte : claquement filtré bref.
  cardFlip: (context, out, at) => {
    noise(context, out, { at, duration: 0.12, peak: 0.7, filter: 'bandpass', frequency: 2_500, to: 900, q: 1.5 })
    tone(context, out, { type: 'triangle', from: 600, to: 300, at: at + 0.02, duration: 0.08, peak: 0.25 })
    return 0.14
  },
  // « Pouet-pouet » de cuivres graves : des joueurs se sont fait piéger.
  trapped: (context, out, at) => {
    brass(context, out, [E4 / 2, E4], at, 0.15, 0.35)
    brass(context, out, [C4 / 2, C4], at + 0.18, 0.28, 0.35)
    return 0.46
  },
  // Accord éclatant et scintillement : la vraie réponse.
  bluffTruth: (context, out, at) => {
    brass(context, out, [C5, E5, G5, C6], at, 0.8, 0.22)
    arpeggio(context, out, [G6, E6, G6, C6 * 2], at + 0.1, 0.07, 'sine', 0.2)
    return 0.9
  },
  // Roulement de caisse claire jusqu'au podium (le tada est programmé à la fin, voir shared/sound.ts).
  drumroll: (context, out, at) => {
    const duration = SUSPENSE_DRUMROLL_MS / 1000
    snareRoll(context, out, at, duration)
    return duration
  },
  // « Ta-daa » de cuivres, puis applaudissements.
  tada: (context, out, at) => {
    brass(context, out, [C5, E5, G5], at, 0.16, 0.2)
    brass(context, out, [C5, E5, G5, C6], at + 0.18, 1.1, 0.18)
    applause(context, out, at + 0.3, 2.6)
    return 2.9
  },
  // Tirage des équipes : un clic de roulette par joueur posé dans sa colonne…
  teamDrawTick: (context, out, at) => {
    tone(context, out, { type: 'square', from: 1_200, at, duration: 0.025, peak: 0.15 })
    return 0.03
  },
  // …puis un gong grave quand le dernier est posé.
  teamDrawGong: (context, out, at) => {
    tone(context, out, { type: 'sine', from: E2 * 2, at, duration: 1.6, peak: 0.6, attack: 0.01 })
    tone(context, out, { type: 'sine', from: E2 * 5.4, at, duration: 1.1, peak: 0.2, attack: 0.01 })
    tone(context, out, { type: 'sine', from: E2 * 8.9, at, duration: 0.7, peak: 0.1, attack: 0.01 })
    return 1.6
  },
  // « Bloop » descendant, plus discret que l'arrivée : quelqu'un quitte le salon.
  playerLeft: (context, out, at) => {
    tone(context, out, { type: 'triangle', from: G5, to: G5 * 0.94, at, duration: 0.1, peak: 0.4 })
    tone(context, out, { type: 'triangle', from: C5, to: C5 * 0.94, at: at + 0.08, duration: 0.16, peak: 0.4 })
    return 0.24
  },
  // « GO » : bip une octave au-dessus du 3-2-1, plus long, sur un accord de cuivres et un coup grave.
  go: (context, out, at) => {
    tone(context, out, { type: 'sine', from: 160, to: 45, at, duration: 0.25, peak: 0.5, attack: 0.004 })
    tone(context, out, { type: 'square', from: A4 * 4, at, duration: 0.45, peak: 0.12 })
    tone(context, out, { type: 'sine', from: A4 * 4, at, duration: 0.5, peak: 0.25 })
    brass(context, out, [C5, E5, G5, C6], at + 0.02, 0.55, 0.22)
    return 0.6
  },
  // L'hôte vérifie les réponses : trois petits bips montants, comme un scanner.
  validationStart: (context, out, at) => {
    const notes = [E5, G5, C6]
    for (const [index, frequency] of notes.entries()) {
      tone(context, out, { type: 'sine', from: frequency, at: at + index * 0.12, duration: 0.09, peak: 0.45 })
      tone(context, out, { type: 'sine', from: frequency * 1.5, at: at + index * 0.12 + 0.04, duration: 0.07, peak: 0.2 })
    }
    return 0.45
  },
  // « Validé » : coup de tampon sourd, puis tintement clair.
  validated: (context, out, at) => {
    tone(context, out, { type: 'sine', from: 130, to: 55, at, duration: 0.14, peak: 0.8, attack: 0.003 })
    noise(context, out, { at, duration: 0.06, peak: 0.4, filter: 'lowpass', frequency: 900 })
    tone(context, out, { type: 'sine', from: E6, at: at + 0.08, duration: 0.35, peak: 0.35 })
    return 0.43
  },
  // Une ligne du classement entre : note pincée, de plus en plus aiguë (step : gamme majeure depuis C5).
  rowEnter: (context, out, at, step = 0) => {
    const frequency = C5 * 2 ** (MAJOR_SCALE[step % MAJOR_SCALE.length] / 12 + Math.floor(step / MAJOR_SCALE.length))
    tone(context, out, { type: 'triangle', from: frequency, at, duration: 0.18, peak: 0.6 })
    tone(context, out, { type: 'sine', from: frequency * 2, at, duration: 0.1, peak: 0.2 })
    return 0.18
  },
  // 3e sur le podium : accord court et grave.
  podiumThird: (context, out, at) => {
    brass(context, out, [E4, G4, C5], at, 0.35, 0.3)
    return 0.35
  },
  // 2e sur le podium : accord plus haut, un peu plus long.
  podiumSecond: (context, out, at) => {
    brass(context, out, [G4, C5, E5], at, 0.45, 0.3)
    return 0.45
  },
  // Équipes validées : clic de verrou, puis scintillement qui monte (distinct du gong du tirage).
  teamsValidated: (context, out, at) => {
    noise(context, out, { at, duration: 0.04, peak: 0.6, filter: 'highpass', frequency: 2_500 })
    tone(context, out, { type: 'square', from: 220, to: 160, at, duration: 0.06, peak: 0.25 })
    arpeggio(context, out, [C6, E6, G6, C6 * 2], at + 0.08, 0.05, 'sine', 0.3)
    return 0.4
  },
  // Rejouer : souffle qui monte, puis petit « ping ».
  replay: (context, out, at) => {
    whoosh(context, out, at, 0.4, 0.4)
    tone(context, out, { type: 'sine', from: C6 * 2, at: at + 0.36, duration: 0.3, peak: 0.4 })
    return 0.66
  },
}

// Degrés de la gamme majeure, en demi-tons (arrivée des lignes du classement).
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]

export function synthesize(id: SoundEffectId, context: BaseAudioContext, out: AudioNode, at: number, step?: number): number {
  return SYNTHS[id](context, out, at, step)
}
