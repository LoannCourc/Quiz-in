import { bluffRevealTimeline } from './bluff'
import { connectedPlayerIds } from './players'
import { computeRanks } from './ranking'
import type { PlayerId, PublicSession, SoundSettings } from './types'

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
// Son programmé dont l'heure est passée de plus de CUE_LATE_TOLERANCE_MS : abandonné (jamais de rafale
// de sons en retard après une reconnexion).
export const CUE_LATE_TOLERANCE_MS = 400
// Chrono : un tic par seconde pendant les CLOCK_TICK_COUNT dernières secondes, puis le buzzer.
export const CLOCK_TICK_COUNT = 5
// Décompte du 3-2-1 : un bip par seconde.
export const COUNTDOWN_BEEPS = 3
// Classement : le glissement suit les points qui montent.
export const RANK_SHUFFLE_DELAY_MS = 700
// Bluff : le « piégé » suit de peu la carte retournée.
export const TRAPPED_DELAY_MS = 350
// Suspense : roulement de tambour, puis tada.
export const SUSPENSE_DRUMROLL_MS = 2_400

// Effets synthétisés par la TV. volume : relatif au canal des effets ; ducks : baisse la musique.
// Table reprise telle quelle dans docs/sons.md.
export type SoundEffectId =
  | 'playerJoined'
  | 'questionShown'
  | 'paused'
  | 'resumed'
  | 'countdown'
  | 'answerPop'
  | 'allAnswered'
  | 'clockTick'
  | 'buzzer'
  | 'fanfare'
  | 'miss'
  | 'pointsUp'
  | 'rankShuffle'
  | 'cardFlip'
  | 'trapped'
  | 'bluffTruth'
  | 'drumroll'
  | 'tada'
  | 'teamDraw'

export interface SoundEffectSpec {
  volume: number
  ducks: boolean
}

export const SOUND_EFFECTS: Record<SoundEffectId, SoundEffectSpec> = {
  playerJoined: { volume: 0.6, ducks: false },
  questionShown: { volume: 0.8, ducks: false },
  paused: { volume: 0.7, ducks: false },
  resumed: { volume: 0.7, ducks: false },
  countdown: { volume: 0.8, ducks: true },
  answerPop: { volume: 0.4, ducks: false },
  allAnswered: { volume: 0.7, ducks: false },
  clockTick: { volume: 0.45, ducks: false },
  buzzer: { volume: 0.8, ducks: true },
  fanfare: { volume: 0.9, ducks: true },
  miss: { volume: 0.8, ducks: true },
  pointsUp: { volume: 0.5, ducks: false },
  rankShuffle: { volume: 0.5, ducks: false },
  cardFlip: { volume: 0.6, ducks: false },
  trapped: { volume: 0.7, ducks: true },
  bluffTruth: { volume: 0.9, ducks: true },
  drumroll: { volume: 0.8, ducks: true },
  tada: { volume: 1, ducks: true },
  teamDraw: { volume: 0.8, ducks: true },
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

// Blind test : l'extrait joue seul (ni tic ni buzzer, l'extrait qui s'arrête fait office de signal).
function isBlindTestQuestion(session: PublicSession): boolean {
  return session.currentQuestion?.audio !== undefined
}

// Qui a fini la phase en cours (répondu, proposition acceptée, voté) parmi les joueurs connectés.
// null hors des phases où l'on répond.
function progressOf(session: PublicSession): { done: number; total: number } | null {
  const index = session.currentIndex
  let doneBy: Record<PlayerId, true> | undefined
  if (session.status === 'question') {
    doneBy = session.settings.answerMode === 'bluff' ? session.bluffedBy?.[index] : session.answeredBy?.[index]
  } else if (session.status === 'vote') {
    doneBy = session.votedBy?.[index]
  } else {
    return null
  }
  const connected = connectedPlayerIds(session.players)
  return { done: connected.filter((id) => doneBy?.[id] === true).length, total: connected.length }
}

function isEveryoneDone(session: PublicSession): boolean {
  const progress = progressOf(session)
  return progress !== null && progress.total > 0 && progress.done >= progress.total
}

// Classement : un rang a changé avec les points de la dernière question (rangs d'avant recalculés
// à partir des scores moins ces points).
export function ranksChanged(session: Pick<PublicSession, 'players' | 'reveal'>): boolean {
  const results = session.reveal?.results ?? {}
  const before: Record<PlayerId, number> = {}
  for (const [id, player] of Object.entries(session.players)) before[id] = player.score - (results[id]?.points ?? 0)
  const previousRanks = computeRanks(before)
  return Object.entries(session.players).some(([id, player]) => previousRanks[id] !== player.rank)
}

// Son de la révélation d'une question (hors Bluff) : fanfare si au moins un joueur a trouvé.
function revealCue(session: PublicSession): SoundEffectId | null {
  if (session.reveal?.stats.bluffChoices) return null
  const results = Object.values(session.reveal?.results ?? {})
  return results.some((result) => result.correct) ? 'fanfare' : 'miss'
}

// Sons d'entrée dans une phase (jamais à une reprise après pause : seul le son de reprise joue).
function phaseEntryCue(session: PublicSession): SoundEffectId | null {
  switch (session.status) {
    case 'question':
    case 'vote':
      return 'questionShown'
    case 'reveal':
      return revealCue(session)
    case 'scores':
      return 'pointsUp'
    case 'ended':
      return session.settings.suspense ? 'drumroll' : 'tada'
    default:
      return null
  }
}

// Sons déduits du passage de previous à next (null : premier état reçu, jamais de son, pour qu'une
// TV ouverte ou reconnectée en pleine partie ne joue pas une rafale).
export function soundCues(previous: PublicSession | null, next: PublicSession, nowServer: number): SoundEffectId[] {
  if (previous === null) return []
  const cues: SoundEffectId[] = []
  const isRecent = nowServer - next.phaseStartedAt < CUE_MAX_AGE_MS
  const isNewPhase = previous.status !== next.status || previous.currentIndex !== next.currentIndex

  if (next.status === 'lobby' && Object.keys(next.players).some((id) => !(id in previous.players))) cues.push('playerJoined')
  if (next.teamDrawAt !== undefined && next.teamDrawAt !== previous.teamDrawAt && nowServer - next.teamDrawAt < CUE_MAX_AGE_MS) {
    cues.push('teamDraw')
  }

  if (next.status === 'paused' && previous.status !== 'paused') cues.push('paused')
  if (previous.status === 'paused' && next.status !== 'paused' && next.status !== 'ended') cues.push('resumed')
  if (isNewPhase && previous.status !== 'paused' && isRecent) {
    const entry = phaseEntryCue(next)
    if (entry) cues.push(entry)
  }

  // Même phase : un joueur de plus a fini ; « tous » quand le dernier joueur connecté a fini.
  if (!isNewPhase) {
    const before = progressOf(previous)
    const after = progressOf(next)
    if (before && after && after.done > before.done) cues.push(isEveryoneDone(next) ? 'allAnswered' : 'answerPop')
  }
  return cues
}

// Son programmé à une heure du serveur (ms).
export interface TimedCue {
  id: SoundEffectId
  at: number
}

// Phase en cours : un changement de clé remet à zéro les sons programmés déjà joués.
export function phaseKey(session: PublicSession): string {
  return `${session.status}|${session.currentIndex}|${session.phaseStartedAt}`
}

// Sons programmés de la phase en cours, d'après l'horloge du serveur : 3-2-1, tic et buzzer du chrono,
// cartes du Bluff, glissement du classement, tada après le roulement de tambour du Suspense.
export function timedCues(session: PublicSession): TimedCue[] {
  const { status, phaseStartedAt: start, phaseEndsAt: end } = session
  switch (status) {
    case 'starting':
      return end > 0 ? beforeEnd(end, COUNTDOWN_BEEPS, 'countdown').filter((cue) => cue.at >= start) : []
    case 'question':
    case 'vote':
      if (end <= 0 || isBlindTestQuestion(session) || isEveryoneDone(session)) return []
      return [...beforeEnd(end, CLOCK_TICK_COUNT, 'clockTick').filter((cue) => cue.at >= start), { id: 'buzzer', at: end }]
    case 'reveal':
      return bluffRevealCues(session)
    case 'scores':
      return ranksChanged(session) ? [{ id: 'rankShuffle', at: start + RANK_SHUFFLE_DELAY_MS }] : []
    case 'ended':
      return session.settings.suspense ? [{ id: 'tada', at: start + SUSPENSE_DRUMROLL_MS }] : []
    default:
      return []
  }
}

// count sons, un par seconde, la dernière seconde finissant à end.
function beforeEnd(end: number, count: number, id: SoundEffectId): TimedCue[] {
  return Array.from({ length: count }, (_, step) => ({ id, at: end - (count - step) * 1000 }))
}

function bluffRevealCues(session: PublicSession): TimedCue[] {
  const choices = session.reveal?.stats.bluffChoices
  if (!choices) return []
  const start = session.phaseStartedAt
  const timeline = bluffRevealTimeline(choices)
  const cues: TimedCue[] = []
  for (const flip of timeline.flips) {
    cues.push({ id: 'cardFlip', at: start + flip.atMs })
    if ((flip.choice.voters?.length ?? 0) > 0) cues.push({ id: 'trapped', at: start + flip.atMs + TRAPPED_DELAY_MS })
  }
  cues.push({ id: 'bluffTruth', at: start + timeline.truthAtMs })
  return cues
}
