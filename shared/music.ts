import type { MusicTrackId } from './musicTracks'
import { SUSPENSE_DRUMROLL_MS } from './sound'
import type { AnswerMode, PublicSession } from './types'

// Musique de la TV selon l'état de la partie (spec 17). Logique pure : la TV ne fait qu'appliquer le plan.

// Passage d'une musique à l'autre (fondu enchaîné), et arrêt rapide avant l'extrait d'un blind test.
export const MUSIC_CROSSFADE_MS = 800
export const MUSIC_FAST_STOP_MS = 300
// Jingle du classement écourté par la phase suivante : fondu de sortie, la nouvelle musique démarre à temps.
export const MUSIC_JINGLE_FADE_OUT_MS = 600
// Pause : la musique continue, baissée à ce niveau.
export const MUSIC_PAUSE_LEVEL = 0.3
// Jingle dont le début est passé de plus de JINGLE_LATE_MS (TV ouverte en retard) : pas joué.
export const JINGLE_LATE_MS = 1_500

export interface MusicPlan {
  // Piste à jouer (boucle ou jingle), ou silence.
  track: MusicTrackId | null
  // Jingle : heure du serveur à laquelle il commence (ms).
  startAt?: number
  // Blind test : heure du serveur à laquelle la musique doit s'être tue, juste avant l'extrait.
  stopBy?: number
  // Silence imposé par l'extrait d'un blind test : arrêt rapide plutôt qu'un fondu enchaîné.
  fastStop: boolean
  isPaused: boolean
}

// isBlindTestGame : le quiz de la partie est un blind test (l'extrait de chaque question joue seul).
export function musicPlan(session: PublicSession, isBlindTestGame: boolean): MusicPlan {
  const isPaused = session.status === 'paused'
  const status = isPaused ? (session.pausedFrom ?? 'question') : session.status
  const isBlindTest = isBlindTestGame || session.currentQuestion?.audio !== undefined
  const mode = session.settings.answerMode
  const play = (track: MusicTrackId): MusicPlan => ({ track, fastStop: false, isPaused })
  const silence: MusicPlan = { track: null, fastStop: isBlindTest, isPaused }
  // Blind test : la musique se tait avant la question suivante (fin du 3-2-1 ou du classement).
  const stopBy = isBlindTest && !isPaused && session.phaseEndsAt > 0 ? session.phaseEndsAt : undefined

  switch (status) {
    case 'lobby':
      return play('waiting')
    case 'starting':
      return { ...play('waiting'), stopBy }
    case 'question':
      if (mode === 'bluff') return play('writing')
      if (isBlindTest) return silence
      return play(mode === 'choice' ? 'game' : 'writing')
    case 'validation':
      return isBlindTest ? silence : play('writing')
    case 'vote':
      return play('vote')
    case 'reveal':
      if (mode === 'bluff') return play('vote')
      if (isBlindTest) return silence
      return play(mode === 'choice' ? 'game' : 'writing')
    case 'scores':
      return { ...play('ranking'), startAt: session.phaseStartedAt, stopBy }
    case 'ended':
      // Après le roulement de tambour en Suspense, en même temps que l'arrivée du podium.
      return { ...play('final'), startAt: session.phaseStartedAt + (session.settings.suspense ? SUSPENSE_DRUMROLL_MS : 0) }
    default:
      return { track: null, fastStop: false, isPaused }
  }
}

// Pistes d'une partie de ce mode, dans l'ordre où elles serviront : chargées et décodées à l'avance,
// dans la limite de mémoire de la TV.
export function musicTracksFor(mode: AnswerMode, isBlindTestGame: boolean): MusicTrackId[] {
  const loops: MusicTrackId[] =
    mode === 'bluff' ? ['writing', 'vote'] : isBlindTestGame ? [] : mode === 'choice' ? ['game'] : ['writing']
  return ['waiting', ...loops, 'ranking', 'final']
}
