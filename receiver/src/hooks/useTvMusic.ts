import { musicPlan, musicTracksFor } from '@shared/music'
import { soundSettingsOf } from '@shared/sound'
import type { PublicSession } from '@shared/types'
import { useEffect } from 'react'

import { estimateServerNow } from '../lib/serverTime'
import { musicPlayer } from '../lib/sound/musicPlayer'

// Musique de la TV pendant la partie (spec 17) : prépare les pistes du mode de jeu, puis applique à
// chaque changement le plan de shared/music.ts (piste, jingle, arrêt avant l'extrait, pause).
// isBlindTestGame : le quiz est un blind test (pas de musique pendant la question et la révélation).
export function useTvMusic(session: PublicSession, isBlindTestGame: boolean, serverOffsetMs: number): void {
  const isMusicOn = soundSettingsOf(session).music
  const { answerMode } = session.settings
  const plan = musicPlan(session, isBlindTestGame)
  const { track, startAt, stopBy, fastStop, isPaused, heldTrack } = plan

  useEffect(() => () => musicPlayer.reset(), [])

  useEffect(() => {
    musicPlayer.setEnabled(isMusicOn)
  }, [isMusicOn])

  useEffect(() => {
    if (isMusicOn) musicPlayer.prepare(musicTracksFor(answerMode, isBlindTestGame))
  }, [answerMode, isBlindTestGame, isMusicOn])

  useEffect(() => {
    musicPlayer.apply({ track, startAt, stopBy, fastStop, isPaused, heldTrack }, estimateServerNow(serverOffsetMs))
  }, [track, startAt, stopBy, fastStop, isPaused, heldTrack, isMusicOn, serverOffsetMs])
}
