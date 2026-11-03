import { musicPlan, musicTracksToPrepare } from '@shared/music'
import type { MusicTrackId } from '@shared/musicTracks'
import { soundSettingsOf } from '@shared/sound'
import type { PublicSession } from '@shared/types'
import { useEffect } from 'react'

import { estimateServerNow } from '../lib/serverTime'
import { usePerfMusicForcedOff } from './usePerfEnabled'
import { musicPlayer } from '../lib/sound/musicPlayer'

// Musique de la TV pendant la partie (spec 17) : prépare les pistes du moment (salon : la sienne seule ;
// dès le lancement : celles du mode de jeu, musicTracksToPrepare), puis applique à
// chaque changement le plan de shared/music.ts (piste, jingle, arrêt avant l'extrait, pause).
// isBlindTestGame : le quiz est un blind test (pas de musique pendant la question).
// isExtractPlaying : l'extrait du blind test joue encore (fin anticipée) : la musique attend sa fin.
export function useTvMusic(session: PublicSession, isBlindTestGame: boolean, serverOffsetMs: number, isExtractPlaying = false): void {
  // Panneau de mesures : musique coupée sur la TV seule, pour comparer (sinon, réglage de l'hôte).
  const isForcedOff = usePerfMusicForcedOff()
  const isMusicOn = soundSettingsOf(session).music && !isForcedOff
  const { answerMode } = session.settings
  const plan = musicPlan(session, isBlindTestGame, isExtractPlaying)
  const { track, startAt, stopBy, fastStop, isPaused, heldTrack, fadeInMs } = plan

  useEffect(() => () => musicPlayer.reset(), [])

  useEffect(() => {
    musicPlayer.setEnabled(isMusicOn)
  }, [isMusicOn])

  // Liste en texte : la même liste (nouvel objet à chaque rendu) ne relance rien.
  const tracksKey = musicTracksToPrepare(session, answerMode, isBlindTestGame).join(',')
  useEffect(() => {
    if (isMusicOn) musicPlayer.prepare(tracksKey.split(',') as MusicTrackId[])
  }, [tracksKey, isMusicOn])

  useEffect(() => {
    musicPlayer.apply({ track, startAt, stopBy, fastStop, isPaused, heldTrack, fadeInMs }, estimateServerNow(serverOffsetMs))
  }, [track, startAt, stopBy, fastStop, isPaused, heldTrack, fadeInMs, isMusicOn, serverOffsetMs])
}
