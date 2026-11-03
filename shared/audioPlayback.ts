import { AUDIO_END_FADE_MS, AUDIO_EXTRACT_START_S, AUDIO_PREVIEW_S, AUDIO_TAIL_FADE_MS, AUDIO_TAIL_VOLUME } from './constants'
import type { GameStatus, MusicTrack, PublicAudio } from './types'

// Blind test : ce que la TV doit jouer à un instant donné, calculé à partir de la session seule
// (une TV qui arrive en retard ou se recharge se recale d'elle-même). Logique pure, testée.

// Extrait d'un morceau : il commence à startS et dure le temps du timer de la question, sans
// jamais dépasser la preview.
export function extractOf(track: Pick<MusicTrack, 'startS'>, timerS: number): { startS: number; durationS: number } {
  const startS = track.startS ?? AUDIO_EXTRACT_START_S
  return { startS, durationS: Math.min(timerS, AUDIO_PREVIEW_S - startS) }
}

export type AudioPlan =
  // Silence : rien à jouer (hors question, pause, timer écoulé).
  | { kind: 'silent' }
  // positionS : position à laquelle le son doit être, en secondes dans la preview. endsAt : heure (serveur)
  // de la fin du timing. level : volume de base (1, ou AUDIO_TAIL_VOLUME après la question). fadeMs : durée
  // du fondu de fin (court au bout du chrono, long quand tout le monde a répondu avant). volume : volume
  // à cet instant, fondu de fin compris (lecteur sans rampe native).
  // continueOnly : après la question, l'extrait déjà en cours continue, mais aucun démarrage (TV rechargée,
  // reprise après une pause, extrait pas encore parti).
  | { kind: 'play'; positionS: number; endsAt: number; level: number; fadeMs: number; volume: number; continueOnly?: boolean }

interface PhaseClock {
  status: GameStatus
  phaseStartedAt: number
  phaseEndsAt: number
}

// Phases qui suivent la question, sur la même question : l'extrait commencé pendant la question y continue
// jusqu'au bout de son timing quand tout le monde a répondu avant la fin du chrono.
const TAIL_STATUSES: readonly GameStatus[] = ['validation', 'reveal', 'scores']

// QUESTION : l'extrait joue depuis le début de la phase, pendant tout le timer, et s'éteint par un fondu
// court (AUDIO_END_FADE_MS) à la fin du chrono. Révélation, Contrôle, classement de la même question (tout le
// monde a répondu avant la fin) : l'extrait déjà en cours continue jusqu'à la fin de son timing, compté
// depuis le début de la question, et s'éteint par un fondu long (AUDIO_TAIL_FADE_MS) qui finit pile à la fin
// du timing ; réponses tardives : le fondu part au moment où tout le monde a répondu, sur le temps qui
// reste. question : ce que la TV a vu de la question (null si elle ne l'a pas vue : rechargée en pleine
// révélation). Toute autre phase (pause, 3-2-1…) : silence.
export function audioPlan(audio: PublicAudio, clock: PhaseClock, nowServer: number, question: QuestionTiming | null = null): AudioPlan {
  if (clock.status === 'question') return extractPlan(audio, clock.phaseStartedAt, nowServer, AUDIO_END_FADE_MS)
  if (question !== null && TAIL_STATUSES.includes(clock.status)) {
    const endsAt = question.startedAt + audio.durationS * 1000
    // Moment de la réponse pas encore connu (champs reçus un par un) : maintenant, au plus près.
    const fadeMs = Math.max(1, Math.min(AUDIO_TAIL_FADE_MS, endsAt - (question.answeredAt ?? nowServer)))
    const plan = extractPlan(audio, question.startedAt, nowServer, fadeMs, AUDIO_TAIL_VOLUME)
    return plan.kind === 'play' ? { ...plan, continueOnly: true } : plan
  }
  return { kind: 'silent' }
}

function extractPlan(audio: PublicAudio, startedAt: number, nowServer: number, fadeMs: number, level = 1): AudioPlan {
  const elapsedS = Math.max(0, (nowServer - startedAt) / 1000)
  const endsAt = startedAt + audio.durationS * 1000
  const remainingMs = endsAt - nowServer
  if (remainingMs <= 0) return { kind: 'silent' }
  return { kind: 'play', positionS: audio.startS + elapsedS, endsAt, level, fadeMs, volume: level * fadeGain(remainingMs, fadeMs) }
}

// Fondu de fin de l'extrait, en cosinus (départ et arrivée en douceur, sans cassure) : 1 tant qu'il reste
// au moins fadeMs, puis jusqu'à 0 à la fin du timing.
export function fadeGain(remainingMs: number, fadeMs: number): number {
  if (remainingMs >= fadeMs) return 1
  if (remainingMs <= 0) return 0
  return 0.5 - 0.5 * Math.cos((Math.PI * remainingMs) / fadeMs)
}

// Courbe du fondu de fin pour la rampe native (setValueCurveAtTime), de fromRemainingMs avant la fin
// jusqu'à la fin du timing, multipliée par le volume de base.
export function fadeCurve(fromRemainingMs: number, fadeMs: number, level: number, points = 64): Float32Array {
  const curve = new Float32Array(points)
  for (let i = 0; i < points; i++) curve[i] = level * fadeGain(fromRemainingMs * (1 - i / (points - 1)), fadeMs)
  return curve
}

// La question en cours telle que la TV l'a vue : début (le chrono : phaseStartedAt, décalé après une pause)
// et moment où tout le monde a répondu (début de la révélation ou du Contrôle de cette question). Seule la
// TV le retient : la session ne le garde pas.
export interface QuestionStart extends QuestionTiming {
  index: number
}

export interface QuestionTiming {
  startedAt: number
  answeredAt?: number
}

export function nextQuestionStart(
  previous: QuestionStart | null,
  session: { status: GameStatus; currentIndex: number; phaseStartedAt: number },
): QuestionStart | null {
  const isSameQuestion = previous?.index === session.currentIndex
  if (session.status === 'question') {
    if (isSameQuestion && previous.startedAt === session.phaseStartedAt) return previous
    return { index: session.currentIndex, startedAt: session.phaseStartedAt }
  }
  // Première phase après la question (révélation ou Contrôle) : tout le monde a répondu, ou le chrono est fini.
  // La TV reçoit les champs un par un : tant que phaseStartedAt est encore celui de la question, on attend.
  const hasOwnStart = session.phaseStartedAt > (previous?.startedAt ?? Infinity)
  if (isSameQuestion && previous.answeredAt === undefined && hasOwnStart && TAIL_STATUSES.includes(session.status)) {
    return { ...previous, answeredAt: session.phaseStartedAt }
  }
  return previous
}

export function questionTimingFor(start: QuestionStart | null, currentIndex: number): QuestionTiming | null {
  return start?.index === currentIndex ? start : null
}

// Ordre à donner au lecteur de la TV, selon le plan et ce qu'il joue déjà :
// - start : démarrer à la position voulue (première lecture, TV en retard, reprise après une pause) ;
// - keep : il joue déjà cet extrait ; il garde son fondu de fin programmé, reprogrammé seulement si le
//   volume de base, la fin ou la durée du fondu changent (tout le monde a répondu : fondu long) (jamais de déplacement en pleine lecture : un recalage produirait un
//   saut audible) ;
// - fadeOut : arrêter, avec un fondu très court (fin du timing déjà fondue, pause, question suivante) ;
// - none : rien à faire.
export type AudioCommand =
  | { kind: 'start'; positionS: number; level: number; endsAt: number; fadeMs: number; volume: number }
  | { kind: 'keep'; level: number; endsAt: number; fadeMs: number; volume: number }
  | { kind: 'fadeOut' }
  | { kind: 'none' }

export interface PlayerSnapshot {
  // Vrai si le son joue et n'est pas en train de s'éteindre.
  isPlaying: boolean
  url: string | null
}

export function audioCommand(plan: AudioPlan, player: PlayerSnapshot, url: string): AudioCommand {
  if (plan.kind === 'silent') return player.isPlaying ? { kind: 'fadeOut' } : { kind: 'none' }
  const { level, endsAt, fadeMs, volume } = plan
  if (player.isPlaying && player.url === url) return { kind: 'keep', level, endsAt, fadeMs, volume }
  if (plan.continueOnly) return { kind: 'none' }
  return { kind: 'start', positionS: plan.positionS, level, endsAt, fadeMs, volume }
}

// Heure d'expiration (ms) d'une adresse de preview Deezer, lue dans son jeton « exp= » (en secondes),
// ou null si l'adresse n'en contient pas.
export function deezerPreviewExpiresAt(url: string): number | null {
  // Forme actuelle : « …mp3?hdnea=exp=1791107825~acl=…~hmac=… ».
  const match = /[?&~=]exp=(\d+)/.exec(url)
  return match ? Number(match[1]) * 1000 : null
}
