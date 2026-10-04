import { AUDIO_EXTRACT_S, AUDIO_EXTRACT_START_S, AUDIO_FADE_OUT_MS, AUDIO_PREVIEW_S } from './constants'
import type { GameStatus, MusicTrack, PublicAudio } from './types'

// Blind test : ce que la TV doit jouer à un instant donné, calculé à partir de la session seule
// (une TV qui arrive en retard ou se recharge se recale d'elle-même). Logique pure, testée.

// Extrait d'un morceau : début et durée dans la preview (valeurs par défaut si non précisées).
export function extractOf(track: Pick<MusicTrack, 'startS' | 'durationS'>): { startS: number; durationS: number } {
  return { startS: track.startS ?? AUDIO_EXTRACT_START_S, durationS: track.durationS ?? AUDIO_EXTRACT_S }
}

export type AudioPlan =
  // Silence : rien à jouer (hors question et révélation, pause, extrait terminé).
  | { kind: 'silent' }
  // positionS : position à laquelle le son doit être, en secondes dans la preview ; volume de 0 à 1.
  // keepIfPlaying : le son déjà en cours continue sans se recaler (révélation après une fin anticipée).
  | { kind: 'play'; positionS: number; volume: number; keepIfPlaying: boolean }

interface PhaseClock {
  status: GameStatus
  phaseStartedAt: number
  phaseEndsAt: number
}

// QUESTION : l'extrait joue depuis le début de la phase, pendant sa durée.
// REVEAL : le morceau continue (ou reprend juste après l'extrait) et s'éteint en fondu sur la fin
// de la révélation, sans dépasser la preview. Toute autre phase, pause comprise : silence.
export function audioPlan(audio: PublicAudio, clock: PhaseClock, nowServer: number): AudioPlan {
  const elapsedS = Math.max(0, (nowServer - clock.phaseStartedAt) / 1000)
  if (clock.status === 'question') {
    if (elapsedS >= audio.durationS) return { kind: 'silent' }
    return { kind: 'play', positionS: audio.startS + elapsedS, volume: 1, keepIfPlaying: false }
  }
  if (clock.status === 'reveal') {
    const positionS = audio.startS + audio.durationS + elapsedS
    const remainingMs = clock.phaseEndsAt - nowServer
    if (positionS >= AUDIO_PREVIEW_S || remainingMs <= 0) return { kind: 'silent' }
    return { kind: 'play', positionS, volume: Math.min(1, remainingMs / AUDIO_FADE_OUT_MS), keepIfPlaying: true }
  }
  return { kind: 'silent' }
}

// Heure d'expiration (ms) d'une adresse de preview Deezer, lue dans son jeton « exp= » (en secondes),
// ou null si l'adresse n'en contient pas.
export function deezerPreviewExpiresAt(url: string): number | null {
  // Forme actuelle : « …mp3?hdnea=exp=1791107825~acl=…~hmac=… ».
  const match = /[?&~=]exp=(\d+)/.exec(url)
  return match ? Number(match[1]) * 1000 : null
}
