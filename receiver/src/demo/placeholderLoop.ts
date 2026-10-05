// Boucle de remplacement (développement seulement, spec 17) : deux mesures funky synthétisées dans un
// AudioBuffer (basse, charleston, accords), pour tester boucles, fondus et ducking sans les vrais
// fichiers de musique, qui ne sont jamais versionnés.

const BPM = 110
const STEPS = 32
const SAMPLE_RATE = 22_050

// Basse : pas (double croche) → fréquence (Hz). Mi, sol, la : une ligne qui groove.
const BASS: Record<number, number> = { 0: 82.41, 3: 82.41, 6: 98, 8: 110, 11: 82.41, 14: 123.47, 16: 82.41, 19: 82.41, 22: 98, 24: 110, 27: 146.83, 30: 123.47 }
// Accords courts sur les contretemps.
const CHORD_STEPS = [6, 14, 22, 30]
const CHORD = [329.63, 392, 493.88]

function addNote(samples: Float32Array, start: number, frequency: number, decayS: number, level: number, harmonics: number): void {
  const length = Math.min(samples.length - start, Math.round(decayS * 4 * SAMPLE_RATE))
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE
    let wave = 0
    for (let h = 1; h <= harmonics; h++) wave += Math.sin(2 * Math.PI * frequency * h * t) / h
    samples[start + i] += wave * level * Math.exp(-t / decayS) * Math.min(1, i / 40)
  }
}

function addHat(samples: Float32Array, start: number): void {
  const length = Math.min(samples.length - start, Math.round(0.05 * SAMPLE_RATE))
  for (let i = 0; i < length; i++) samples[start + i] += (Math.random() * 2 - 1) * 0.12 * Math.exp(-i / (0.012 * SAMPLE_RATE))
}

export function createPlaceholderLoop(context: AudioContext): AudioBuffer {
  const stepLength = Math.round((60 / BPM / 4) * SAMPLE_RATE)
  const buffer = context.createBuffer(1, stepLength * STEPS, SAMPLE_RATE)
  const samples = buffer.getChannelData(0)
  for (let step = 0; step < STEPS; step++) {
    const start = step * stepLength
    const bass = BASS[step]
    if (bass !== undefined) addNote(samples, start, bass, 0.12, 0.45, 3)
    if (step % 2 === 1) addHat(samples, start)
    if (CHORD_STEPS.includes(step)) CHORD.forEach((frequency) => addNote(samples, start, frequency, 0.08, 0.12, 4))
  }
  // Fin de boucle adoucie : les notes qui débordent ne créent pas de clic au raccord.
  const fade = Math.round(0.005 * SAMPLE_RATE)
  for (let i = 0; i < fade; i++) samples[samples.length - 1 - i] *= i / fade
  const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0)
  if (peak > 0) for (let i = 0; i < samples.length; i++) samples[i] *= 0.8 / peak
  return buffer
}
