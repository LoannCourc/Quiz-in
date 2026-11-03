import { audioCommand, audioPlan, nextQuestionStart, questionTimingFor, type QuestionStart } from '@shared/audioPlayback'
import type { PublicAudio, PublicSession } from '@shared/types'
import { createContext, useEffect, useRef, useState } from 'react'

import { isAudioUnlocked, onAudioUnlock } from '../lib/audioUnlock'
import { estimateServerNow } from '../lib/serverTime'
import { tvAudioPlayer } from '../lib/tvAudioPlayer'

// none : pas d'extrait (quiz classique, interrupteur coupé). loading / playing / silent : lecture
// normale. blocked : le navigateur attend un clic (plan B). unavailable : extrait illisible après un
// nouvel essai ; l'hôte peut passer la question.
export type GameAudioState = 'none' | 'loading' | 'playing' | 'silent' | 'blocked' | 'unavailable'

// Fréquence de recalage : le fondu de fin est joué par le moteur audio ; la vérification ne sert qu'aux
// changements (démarrage, arrêt, et volume du lecteur simple), légère pour la box.
const TICK_MS = 200
// Échecs avant « Extrait indisponible » : un premier échec, puis un nouvel essai.
const MAX_FAILURES = 2

// Joue l'extrait de la question en cours sur la TV, calé sur l'horloge du serveur (phaseStartedAt),
// pendant tout le timer. Tout le monde a répondu avant la fin du chrono : l'extrait continue pendant la
// révélation (et le Contrôle, le classement) jusqu'au bout de son timing, compté depuis le début de la
// question ; la musique attend sa fin (useTvMusic). Pause, 3-2-1, question suivante : fondu très court.
// Reprise après une pause pendant la question : même position (phaseStartedAt est décalé de la durée de
// la pause) ; après une pause pendant la révélation, l'extrait ne repart pas.
export function useGameAudio(session: PublicSession, isEnabled: boolean, serverOffsetMs: number, nextAudio: PublicAudio | null = null): GameAudioState {
  const [state, setState] = useState<GameAudioState>('none')
  const isBusy = useRef(false)
  const failures = useRef(new Map<string, number>())
  const isWaitingForGesture = useRef(false)
  // Valeurs simples : la session est un nouvel objet à chaque mise à jour de la base.
  const published = isEnabled ? session.currentQuestion?.audio : undefined
  const url = published?.url
  const startS = published?.startS ?? 0
  const durationS = published?.durationS ?? 0
  const { status, phaseStartedAt, phaseEndsAt, currentIndex } = session
  // Début de la question vu par la TV (la session ne le garde pas après la question) : mis à jour pendant
  // le rendu, sans effet, pour être juste dès le premier rendu de la révélation.
  const [questionStart, setQuestionStart] = useState<QuestionStart | null>(null)
  const nextStart = nextQuestionStart(questionStart, session)
  if (nextStart !== questionStart) setQuestionStart(nextStart)
  const question = questionTimingFor(nextStart, currentIndex)
  const questionStartedAt = question?.startedAt ?? null
  const answeredAt = question?.answeredAt ?? null

  useEffect(
    () =>
      onAudioUnlock(() => {
        isWaitingForGesture.current = false
      }),
    [],
  )

  useEffect(() => {
    const audio = url ? { url, startS, durationS } : null

    function start(audioUrl: string, positionS: number, tail: { level: number; endsAt: number; fadeMs: number; volume: number }) {
      if (isBusy.current) return
      if (isWaitingForGesture.current && !isAudioUnlocked()) {
        setState('blocked')
        return
      }
      isBusy.current = true
      setState('loading')
      void tvAudioPlayer.play(audioUrl, positionS, tail, estimateServerNow(serverOffsetMs)).then((result) => {
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
      const nowServer = estimateServerNow(serverOffsetMs)
      const timing = questionStartedAt === null ? null : { startedAt: questionStartedAt, answeredAt: answeredAt ?? undefined }
      const plan = audioPlan(audio, { status, phaseStartedAt, phaseEndsAt }, nowServer, timing)
      const snapshot = { isPlaying: tvAudioPlayer.isPlaying, url: tvAudioPlayer.currentUrl }
      const command = audioCommand(plan, snapshot, audio.url)
      switch (command.kind) {
        case 'none':
          if (plan.kind === 'play' && !plan.continueOnly) return
          // Un démarrage encore en chargement ne doit pas partir pendant la révélation.
          if (isBusy.current) tvAudioPlayer.cancelPending()
          setState('silent')
          return
        case 'fadeOut':
          tvAudioPlayer.fadeOutAndPause()
          setState('silent')
          return
        case 'keep':
          tvAudioPlayer.keep(command, nowServer)
          return
        case 'start':
          start(audio.url, command.positionS, command)
      }
    }

    tick()
    const interval = setInterval(tick, TICK_MS)
    return () => clearInterval(interval)
  }, [url, startS, durationS, status, phaseStartedAt, phaseEndsAt, questionStartedAt, answeredAt, serverOffsetMs])

  // Extrait de la question suivante (nextAudio, hôte 1.2.1 et plus) : préchargé dès la révélation, pour un
  // son à l'heure dès la première seconde. Libéré au salon et à la fin de la partie seulement : à la question
  // suivante, l'hôte efface nextAudio pendant que l'extrait préchargé démarre (champs reçus un par un).
  const nextUrl = isEnabled ? nextAudio?.url : undefined
  const nextStartS = nextAudio?.startS ?? 0
  const isOver = status === 'lobby' || status === 'ended'
  useEffect(() => {
    if (isOver) tvAudioPlayer.releasePreload()
    else if (nextUrl) tvAudioPlayer.preload(nextUrl, nextStartS)
  }, [nextUrl, nextStartS, isOver])

  // Fin de la partie affichée (nouveau code, page fermée) : plus de son.
  useEffect(
    () => () => {
      tvAudioPlayer.stop()
      tvAudioPlayer.releasePreload()
    },
    [],
  )

  return state
}

// État du son de la partie, pour les écrans (indicateur d'écoute, « Extrait indisponible »).
export const GameAudioStateContext = createContext<GameAudioState>('none')
