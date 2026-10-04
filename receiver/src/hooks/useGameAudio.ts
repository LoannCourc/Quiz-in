import { audioCommand, audioPlan } from '@shared/audioPlayback'
import type { PublicSession } from '@shared/types'
import { createContext, useEffect, useRef, useState } from 'react'

import { isAudioUnlocked, onAudioUnlock } from '../lib/audioUnlock'
import { estimateServerNow } from '../lib/serverTime'
import { tvAudioPlayer } from '../lib/tvAudioPlayer'

// none : pas d'extrait (quiz classique, interrupteur coupé). loading / playing / silent : lecture
// normale. blocked : le navigateur attend un clic (plan B). unavailable : extrait illisible après un
// nouvel essai ; l'hôte peut passer la question.
export type GameAudioState = 'none' | 'loading' | 'playing' | 'silent' | 'blocked' | 'unavailable'

// Fréquence de recalage : assez fine pour le fondu de fin du timer, légère pour la box.
const TICK_MS = 200
// Échecs avant « Extrait indisponible » : un premier échec, puis un nouvel essai.
const MAX_FAILURES = 2

// Joue l'extrait de la question en cours sur la TV, calé sur l'horloge du serveur (phaseStartedAt),
// pendant tout le timer. Dès que la phase change (tout le monde a répondu, pause…), le son s'éteint par
// un fondu très court ; pas de musique pendant la révélation. Reprise après une pause : même position
// (phaseStartedAt est décalé de la durée de la pause).
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

    function start(audioUrl: string, positionS: number, volume: number) {
      if (isBusy.current) return
      if (isWaitingForGesture.current && !isAudioUnlocked()) {
        setState('blocked')
        return
      }
      isBusy.current = true
      setState('loading')
      void tvAudioPlayer.play(audioUrl, positionS, volume).then((result) => {
        isBusy.current = false
        if (result === 'superseded') return
        if (result === 'blocked') isWaitingForGesture.current = true
        if (result === 'failed') failures.current.set(audioUrl, (failures.current.get(audioUrl) ?? 0) + 1)
        setState(result === 'playing' ? 'playing' : result === 'blocked' ? 'blocked' : 'loading')
      })
    }

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
      const snapshot = { isPlaying: tvAudioPlayer.isPlaying, url: tvAudioPlayer.currentUrl }
      const command = audioCommand(plan, snapshot, audio.url)
      switch (command.kind) {
        case 'none':
          if (plan.kind !== 'silent') return
          // Un démarrage encore en chargement ne doit pas partir pendant la révélation.
          if (isBusy.current) tvAudioPlayer.cancelPending()
          setState('silent')
          return
        case 'fadeOut':
          tvAudioPlayer.fadeOutAndPause()
          setState('silent')
          return
        case 'volume':
          tvAudioPlayer.setVolume(command.volume)
          return
        case 'start':
          start(audio.url, command.positionS, command.volume)
      }
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
