import { soundCues, soundSettingsOf } from '@shared/sound'
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
// (sessions/{code}/sound) dès qu'ils changent, et joue les sons déduits de chaque nouvel état.
export function useTvSound(session: PublicSession, serverOffsetMs: number): TvSound {
  const state = useSyncExternalStore(
    (listener) => soundEngine.subscribe(listener),
    () => soundEngine.state,
  )
  const { music, effects, volume } = soundSettingsOf(session)
  const previous = useRef<PublicSession | null>(null)

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

  return { state, isWanted: music || effects }
}
