import { SOUND_EFFECT_IDS, SOUND_EFFECTS, SOUND_MIX, type SoundEffectId } from '@shared/sound'

import { synthesize } from '../lib/sound/effects'

// Auto-test des effets (développement seulement, ?sounds=1&selftest=1) : chaque effet est calculé hors
// ligne, sans haut-parleur, au volume maximal de l'hôte. Vérifie qu'il s'exécute sans erreur, qu'il
// produit du son et qu'il ne sature pas, et donne son niveau pour comparer les effets entre eux.

export interface EffectReport {
  id: SoundEffectId
  durationS: number
  // Niveau maximal (1 : limite de saturation) et niveau moyen (RMS).
  peak: number
  rms: number
  error?: string
}

const SAMPLE_RATE = 22_050
const MAX_RENDER_S = 4

async function renderEffect(id: SoundEffectId): Promise<EffectReport> {
  try {
    const context = new OfflineAudioContext(1, SAMPLE_RATE * MAX_RENDER_S, SAMPLE_RATE)
    const output = context.createGain()
    output.gain.value = SOUND_EFFECTS[id].volume * SOUND_MIX.effects
    output.connect(context.destination)
    const durationS = synthesize(id, context, output, 0.01)
    const samples = (await context.startRendering()).getChannelData(0)
    let peak = 0
    let sum = 0
    for (const sample of samples) {
      peak = Math.max(peak, Math.abs(sample))
      sum += sample * sample
    }
    const audible = Math.min(samples.length, Math.ceil(durationS * SAMPLE_RATE))
    return { id, durationS, peak, rms: Math.sqrt(sum / Math.max(1, audible)) }
  } catch (error) {
    return { id, durationS: 0, peak: 0, rms: 0, error: String(error) }
  }
}

export async function runSoundSelfTest(): Promise<EffectReport[]> {
  const reports: EffectReport[] = []
  for (const id of SOUND_EFFECT_IDS) reports.push(await renderEffect(id))
  return reports
}
