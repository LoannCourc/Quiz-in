import { CUE_LATE_TOLERANCE_MS, phaseKey, soundCues, soundSettingsOf, timedCues } from '@shared/sound'
import type { PublicSession } from '@shared/types'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { estimateServerNow } from '../lib/serverTime'
import { soundEngine, type SoundEngineState } from '../lib/sound/soundEngine'

export interface TvSound {
  state: SoundEngineState
  // Musique ou effets activés par l'hôte.
  isWanted: boolean
}

// Son de la TV pendant la partie (spec 17) : démarre le moteur, applique les réglages de l'hôte
// (sessions/{code}/sound) dès qu'ils changent, joue les sons déduits de chaque nouvel état, et programme
// ceux de la phase en cours (3-2-1, chrono, cartes du Bluff…) sur l'horloge du serveur.
export function useTvSound(session: PublicSession, serverOffsetMs: number): TvSound {
  const state = useSyncExternalStore(
    (listener) => soundEngine.subscribe(listener),
    () => soundEngine.state,
  )
  const { music, effects, volume } = soundSettingsOf(session)
  const previous = useRef<PublicSession | null>(null)
  // Sons programmés déjà joués dans la phase en cours (remis à zéro à chaque nouvelle phase) : une mise
  // à jour de la session reprogramme la phase sans rejouer ce qui a déjà sonné.
  const played = useRef({ phase: '', keys: new Set<string>() })

  useEffect(() => {
    soundEngine.start()
  }, [])

  useEffect(() => {
    soundEngine.applySettings({ music, effects, volume })
  }, [music, effects, volume])

  useEffect(() => {
    // Valeur précédente lue puis remplacée tout de suite : le mode strict (double appel) ne rejoue rien.
    const cues = soundCues(previous.current, session, estimateServerNow(serverOffsetMs))
    previous.current = session
    cues.forEach((cue) => soundEngine.playEffect(cue))
  }, [session, serverOffsetMs])

  useEffect(() => {
    const phase = phaseKey(session)
    if (played.current.phase !== phase) played.current = { phase, keys: new Set() }
    const { keys } = played.current
    const now = estimateServerNow(serverOffsetMs)
    const timers = timedCues(session)
      .filter((cue) => cue.at >= now - CUE_LATE_TOLERANCE_MS && !keys.has(`${cue.id}@${cue.at}`))
      .map((cue) =>
        setTimeout(() => {
          keys.add(`${cue.id}@${cue.at}`)
          soundEngine.playEffect(cue.id, cue.step)
        }, Math.max(0, cue.at - now)),
      )
    return () => timers.forEach(clearTimeout)
  }, [session, serverOffsetMs])

  return { state, isWanted: music || effects }
}
