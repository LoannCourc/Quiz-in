import { AUDIO_EXTRACT_START_S, AUDIO_FADE_OUT_MS, AUDIO_PREVIEW_S } from './constants'
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
  // positionS : position à laquelle le son doit être, en secondes dans la preview ; volume de 0 à 1.
  | { kind: 'play'; positionS: number; volume: number }

interface PhaseClock {
  status: GameStatus
  phaseStartedAt: number
  phaseEndsAt: number
}

// QUESTION : l'extrait joue depuis le début de la phase, pendant tout le timer, et s'éteint en fondu
// sur ses dernières millisecondes. Toute autre phase (révélation, pause…) : silence.
export function audioPlan(audio: PublicAudio, clock: PhaseClock, nowServer: number): AudioPlan {
  if (clock.status !== 'question') return { kind: 'silent' }
  const elapsedS = Math.max(0, (nowServer - clock.phaseStartedAt) / 1000)
  const remainingMs = (audio.durationS - elapsedS) * 1000
  if (remainingMs <= 0) return { kind: 'silent' }
  return { kind: 'play', positionS: audio.startS + elapsedS, volume: Math.min(1, remainingMs / AUDIO_FADE_OUT_MS) }
}

// Heure d'expiration (ms) d'une adresse de preview Deezer, lue dans son jeton « exp= » (en secondes),
// ou null si l'adresse n'en contient pas.
export function deezerPreviewExpiresAt(url: string): number | null {
  // Forme actuelle : « …mp3?hdnea=exp=1791107825~acl=…~hmac=… ».
  const match = /[?&~=]exp=(\d+)/.exec(url)
  return match ? Number(match[1]) * 1000 : null
}
