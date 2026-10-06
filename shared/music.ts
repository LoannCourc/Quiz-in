import type { MusicTrackId } from './musicTracks'
import { SUSPENSE_DRUMROLL_MS } from './sound'
import type { AnswerMode, GameStatus, PublicSession } from './types'

// Musique de la TV selon l'état de la partie (spec 17). Logique pure : la TV ne fait qu'appliquer le plan.

// Passage d'une musique à l'autre (fondu enchaîné), et arrêt rapide avant l'extrait d'un blind test.
export const MUSIC_CROSSFADE_MS = 800
export const MUSIC_FAST_STOP_MS = 300
// Musique de fin interrompue (Rejouer) : fondu de sortie, la musique du salon démarre à temps.
export const MUSIC_JINGLE_FADE_OUT_MS = 600
// Pause : la musique en cours s'arrête en MUSIC_PAUSE_FADE_MS (sa position est gardée) et la musique
// d'attente joue ; à la reprise, fondu enchaîné de MUSIC_RESUME_CROSSFADE_MS, là où elle s'était arrêtée.
export const MUSIC_PAUSE_FADE_MS = 300
export const MUSIC_RESUME_CROSSFADE_MS = 600
// Piste jouée une seule fois dont le début est passé de plus de JINGLE_LATE_MS (TV ouverte en retard) :
// pas jouée. Une boucle (musique de fin comprise) démarre aussitôt.
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
  // Pause : musique de la phase interrompue, reprise là où elle s'était arrêtée (null : silence, blind test).
  heldTrack?: MusicTrackId | null
}

// isBlindTestGame : le quiz de la partie est un blind test (l'extrait de chaque question joue seul).
// Pause : la musique d'attente joue, la musique de la phase est retenue pour la reprise (une pause
// pendant la musique d'attente ne change rien).
export function musicPlan(session: PublicSession, isBlindTestGame: boolean): MusicPlan {
  if (session.status !== 'paused') return phaseMusic(session, session.status, isBlindTestGame)
  const held = phaseMusic(session, session.pausedFrom ?? 'question', isBlindTestGame)
  if (held.track === 'waiting') return { track: 'waiting', fastStop: false, isPaused: true }
  return { track: 'waiting', heldTrack: held.track, fastStop: false, isPaused: true }
}

function phaseMusic(session: PublicSession, status: GameStatus, isBlindTestGame: boolean): MusicPlan {
  const isBlindTest = isBlindTestGame || session.currentQuestion?.audio !== undefined
  const mode = session.settings.answerMode
  const play = (track: MusicTrackId): MusicPlan => ({ track, fastStop: false, isPaused: false })
  const silence: MusicPlan = { track: null, fastStop: isBlindTest, isPaused: false }
  // Blind test : la musique se tait avant la question suivante (fin du 3-2-1, de la révélation ou du classement).
  const stopBy = isBlindTest && session.status !== 'paused' && session.phaseEndsAt > 0 ? session.phaseEndsAt : undefined

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
      // Blind test : la musique de jeu revient dès la bonne réponse. Elle continue au classement ; en Suspense,
      // la question suivante suit directement la révélation : la musique se tait alors avant son extrait.
      if (isBlindTest) return { ...play('game'), stopBy: session.settings.suspense ? stopBy : undefined }
      return play(mode === 'choice' ? 'game' : 'writing')
    case 'scores':
      // La musique de la question continue à travers le classement ; blind test : la musique de jeu revient,
      // puis se tait avant l'extrait suivant.
      if (mode === 'bluff') return play('vote')
      if (isBlindTest) return { ...play('game'), stopBy }
      return play(mode === 'choice' ? 'game' : 'writing')
    case 'ended':
      // Après le roulement de tambour en Suspense, en même temps que l'arrivée du podium ; puis en boucle
      // tant que l'écran de fin est affiché (shared/musicTracks.ts), jusqu'à Rejouer ou la fin de la partie.
      return { ...play('final'), startAt: session.phaseStartedAt + (session.settings.suspense ? SUSPENSE_DRUMROLL_MS : 0) }
    default:
      return { track: null, fastStop: false, isPaused: false }
  }
}

// Pistes d'une partie de ce mode, dans l'ordre où elles serviront : chargées et décodées à l'avance,
// dans la limite de mémoire de la TV.
export function musicTracksFor(mode: AnswerMode, isBlindTestGame: boolean): MusicTrackId[] {
  const loops: MusicTrackId[] =
    mode === 'bluff' ? ['writing', 'vote'] : isBlindTestGame || mode === 'choice' ? ['game'] : ['writing']
  return ['waiting', ...loops, 'final']
}
