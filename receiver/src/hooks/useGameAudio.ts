import { audioPlan } from '@shared/audioPlayback'
import type { PublicSession } from '@shared/types'
import { createContext, useEffect, useRef, useState } from 'react'

import { isAudioUnlocked, onAudioUnlock } from '../lib/audioUnlock'
import { estimateServerNow } from '../lib/serverTime'
import { tvAudioPlayer } from '../lib/tvAudioPlayer'

// none : pas d'extrait (quiz classique, interrupteur coupé). loading / playing / silent : lecture
// normale. blocked : le navigateur attend un clic (plan B). unavailable : extrait illisible après un
// nouvel essai ; l'hôte peut passer la question.
export type GameAudioState = 'none' | 'loading' | 'playing' | 'silent' | 'blocked' | 'unavailable'

// Fréquence de recalage : assez fine pour le fondu de fin de révélation, légère pour la box.
const TICK_MS = 200
// Écart toléré entre la position jouée et la position attendue avant de se recaler.
const MAX_DRIFT_S = 1.5
// Échecs avant « Extrait indisponible » : un premier échec, puis un nouvel essai.
const MAX_FAILURES = 2

// Joue l'extrait de la question en cours sur la TV, calé sur l'horloge du serveur (phaseStartedAt) :
// QUESTION, puis le morceau continue pendant la révélation et s'éteint en fondu ; pause = silence,
// reprise = même position (phaseStartedAt est décalé de la durée de la pause).
export function useGameAudio(session: PublicSession, isEnabled: boolean, serverOffsetMs: number): GameAudioState {
  const [state, setState] = useState<GameAudioState>('none')
  const isBusy = useRef(false)
  const failures = useRef(new Map<string, number>())
  const isWaitingForGesture = useRef(false)
  // Valeurs simples : la session est un nouvel objet à chaque mise à jour de la base.
  const published = isEnabled ? session.currentQuestion?.audio : undefined
  const url = published?.url
  const startS = published?.startS ?? 0
  const durationS = published?.durationS ?? 0
  const { status, phaseStartedAt, phaseEndsAt } = session

  useEffect(
    () =>
      onAudioUnlock(() => {
        isWaitingForGesture.current = false
      }),
    [],
  )

  useEffect(() => {
    const audio = url ? { url, startS, durationS } : null
    function tick() {
      if (!audio) {
        tvAudioPlayer.stop()
        setState('none')
        return
      }
      if ((failures.current.get(audio.url) ?? 0) >= MAX_FAILURES) {
        tvAudioPlayer.stop()
        setState('unavailable')
        return
      }
      const plan = audioPlan(audio, { status, phaseStartedAt, phaseEndsAt }, estimateServerNow(serverOffsetMs))
      if (plan.kind === 'silent') {
        if (tvAudioPlayer.isPlaying) tvAudioPlayer.pause()
        setState('silent')
        return
      }
      if (isBusy.current) return
      if (isWaitingForGesture.current && !isAudioUnlocked()) {
        setState('blocked')
        return
      }
      if (tvAudioPlayer.isPlaying && tvAudioPlayer.currentUrl === audio.url) {
        tvAudioPlayer.setVolume(plan.volume)
        const drift = Math.abs(tvAudioPlayer.positionS - plan.positionS)
        if (plan.keepIfPlaying || drift <= MAX_DRIFT_S) return
      }
      isBusy.current = true
      setState('loading')
      void tvAudioPlayer.play(audio.url, plan.positionS, plan.volume).then((result) => {
        isBusy.current = false
        if (result === 'superseded') return
        if (result === 'blocked') isWaitingForGesture.current = true
        if (result === 'failed') failures.current.set(audio.url, (failures.current.get(audio.url) ?? 0) + 1)
        setState(result === 'playing' ? 'playing' : result === 'blocked' ? 'blocked' : 'loading')
      })
    }

    tick()
    const interval = setInterval(tick, TICK_MS)
    return () => clearInterval(interval)
  }, [url, startS, durationS, status, phaseStartedAt, phaseEndsAt, serverOffsetMs])

  // Fin de la partie affichée (nouveau code, page fermée) : plus de son.
  useEffect(() => () => tvAudioPlayer.stop(), [])

  return state
}

// État du son de la partie, pour les écrans (indicateur d'écoute, « Extrait indisponible »).
export const GameAudioStateContext = createContext<GameAudioState>('none')
