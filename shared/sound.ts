import type { PublicSession, SoundSettings } from './types'

// Son de la TV (spec 17) : réglages de l'hôte, mélange des canaux, table des effets et sons déduits de
// l'état de la partie. Logique pure : la TV ne fait qu'appliquer ce qui est décidé ici.

// Volume général : cinq crans (le réglage de l'hôte), 60 par défaut.
export const SOUND_VOLUME_STEPS: readonly number[] = [20, 40, 60, 80, 100]

export const DEFAULT_SOUND_SETTINGS: SoundSettings = { music: true, effects: true, volume: 60 }

// Part de chaque canal dans le volume général : la musique reste en fond, sous les effets.
export const SOUND_MIX = { music: 0.35, effects: 0.8 } as const

// Ducking : pendant un effet important, la musique descend à DUCK_LEVEL en DUCK_ATTACK_MS, puis
// remonte en DUCK_RELEASE_MS après la fin de l'effet.
export const DUCK_LEVEL = 0.3
export const DUCK_ATTACK_MS = 150
export const DUCK_RELEASE_MS = 600

// Effets joués en même temps au plus (ménage la box), et écart minimal entre deux fois le même effet.
export const MAX_EFFECT_VOICES = 6
export const EFFECT_REPEAT_MIN_MS = 150

// Un changement d'état ne sonne que si sa phase a commencé il y a moins de CUE_MAX_AGE_MS : un état
// rattrapé en retard (réseau) reste silencieux.
export const CUE_MAX_AGE_MS = 2_000

// Effets synthétisés par la TV. volume : relatif au canal des effets ; ducks : baisse la musique.
// Table reprise telle quelle dans docs/sons.md.
export type SoundEffectId = 'playerJoined' | 'questionShown' | 'paused' | 'resumed'

export interface SoundEffectSpec {
  volume: number
  ducks: boolean
}

export const SOUND_EFFECTS: Record<SoundEffectId, SoundEffectSpec> = {
  playerJoined: { volume: 0.6, ducks: false },
  questionShown: { volume: 0.8, ducks: false },
  paused: { volume: 0.7, ducks: false },
  resumed: { volume: 0.7, ducks: false },
}

export const SOUND_EFFECT_IDS = Object.keys(SOUND_EFFECTS) as readonly SoundEffectId[]

export function isSoundVolume(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100
}

// Réglages lus dans la base ou sur l'appareil : null si la forme est invalide.
export function parseSoundSettings(value: unknown): SoundSettings | null {
  if (typeof value !== 'object' || value === null) return null
  const { music, effects, volume } = value as Record<string, unknown>
  if (typeof music !== 'boolean' || typeof effects !== 'boolean' || !isSoundVolume(volume)) return null
  return { music, effects, volume }
}

// Partie sans réglage du son (créée avant ce réglage) : réglages par défaut.
export function soundSettingsOf(session: Pick<PublicSession, 'sound'>): SoundSettings {
  return parseSoundSettings(session.sound) ?? DEFAULT_SOUND_SETTINGS
}

// Gain du volume général : courbe plus douce que linéaire (l'oreille perçoit mal les petits volumes).
export function masterGain(volume: number): number {
  return Math.pow(Math.max(0, Math.min(100, volume)) / 100, 1.5)
}

// Gains des canaux, interrupteurs compris (0 : canal coupé).
export function channelGains(settings: SoundSettings): { music: number; effects: number } {
  const master = masterGain(settings.volume)
  return {
    music: settings.music ? master * SOUND_MIX.music : 0,
    effects: settings.effects ? master * SOUND_MIX.effects : 0,
  }
}

// Sons déduits du passage de previous à next (null : premier état reçu, jamais de son, pour qu'une
// TV ouverte ou reconnectée en pleine partie ne joue pas une rafale).
export function soundCues(previous: PublicSession | null, next: PublicSession, nowServer: number): SoundEffectId[] {
  if (previous === null) return []
  const cues: SoundEffectId[] = []
  const isRecent = nowServer - next.phaseStartedAt < CUE_MAX_AGE_MS
  if (next.status === 'lobby' && Object.keys(next.players).some((id) => !(id in previous.players))) {
    cues.push('playerJoined')
  }
  const isNewQuestion = previous.status !== 'question' || previous.currentIndex !== next.currentIndex
  // Reprise après une pause : pas de nouvelle question, seulement le son de reprise.
  if (next.status === 'question' && isNewQuestion && previous.status !== 'paused' && isRecent) cues.push('questionShown')
  if (next.status === 'paused' && previous.status !== 'paused') cues.push('paused')
  if (previous.status === 'paused' && next.status !== 'paused' && next.status !== 'ended') cues.push('resumed')
  return cues
}
