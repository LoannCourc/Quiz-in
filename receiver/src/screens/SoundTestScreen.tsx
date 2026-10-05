import { SOUND_EFFECT_IDS } from '@shared/sound'
import type { SoundSettings } from '@shared/types'
import { useEffect, useState } from 'react'

import { decodedBytes, playLoop } from '../lib/sound/musicLoop'
import { decodeMusic } from '../lib/sound/musicPlayer'
import { soundEngine } from '../lib/sound/soundEngine'
import { strings } from '../strings'
import { StatusScreen } from './StatusScreen'

// Réglages du test : musique et effets activés, volume assez fort pour juger à distance.
const TEST_SETTINGS: SoundSettings = { music: true, effects: true, volume: 80 }
// Temps laissé au contexte pour démarrer avant de relever son état.
const START_WAIT_MS = 600
const EFFECT_GAP_MS = 1_000
// Boucle de musique : 20 s en tout (au moins un tour pour une boucle courte), ducking à 8 s.
const LOOP_TEST_MS = 20_000
const DUCK_AT_MS = 8_000
const DUCK_TEST_S = 2

const MIME_TYPES: Record<string, string> = {
  ogg: 'audio/ogg; codecs="vorbis"',
  oga: 'audio/ogg; codecs="vorbis"',
  m4a: 'audio/mp4; codecs="mp4a.40.2"',
  aac: 'audio/aac',
  mp3: 'audio/mpeg',
}

function mimeTypeOf(target: string): string | undefined {
  return MIME_TYPES[target.split('.').pop()?.toLowerCase() ?? '']
}

// Test du son de la TV demandé par cast-sender.html (spec 17), sans aucun geste sur la TV :
// « effects » joue chaque effet ; un fichier est téléchargé, décodé, puis joué en boucle (avec un
// ducking au milieu). Chaque étape ajoute une ligne de résultat à l'écran.
export function SoundTestScreen({ target }: { target: string }) {
  const [lines, setLines] = useState<string[]>([])
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const timers: ReturnType<typeof setTimeout>[] = []
    let stopLoop: (() => void) | null = null
    const add = (line: string) => {
      if (isCurrent) setLines((current) => [...current, line])
    }
    // Écran remplacé : les attentes ne se terminent jamais et le test s'arrête là.
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)))
    const { soundTest: texts } = strings

    async function testEffects() {
      for (const id of SOUND_EFFECT_IDS) {
        add(texts.effect(id, soundEngine.playEffect(id)))
        await wait(EFFECT_GAP_MS)
      }
    }

    async function testMusic(music: { context: AudioContext; input: AudioNode }) {
      const mimeType = mimeTypeOf(target)
      if (mimeType) add(texts.canPlay(mimeType, new Audio().canPlayType(mimeType)))
      const startedAt = performance.now()
      try {
        // Même décodage que pendant la partie (mono, MUSIC_SAMPLE_RATE) : la mémoire affichée est la vraie.
        const response = await fetch(target)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.arrayBuffer()
        const bytes = data.byteLength
        const buffer = await decodeMusic(data)
        add(texts.decoded(Math.round(performance.now() - startedAt), bytes, buffer.duration, buffer.sampleRate, buffer.numberOfChannels, decodedBytes(buffer)))
        stopLoop = playLoop(music.context, music.input, buffer, 1)
      } catch (error) {
        add(texts.decodeFailed(String(error)))
        return
      }
      add(texts.looping(LOOP_TEST_MS / 1000))
      await wait(DUCK_AT_MS)
      soundEngine.duck(DUCK_TEST_S)
      soundEngine.playEffect('questionShown')
      add(texts.ducking(DUCK_TEST_S))
      await wait(LOOP_TEST_MS - DUCK_AT_MS)
      stopLoop()
      add(texts.loopDone)
    }

    async function run() {
      soundEngine.start()
      soundEngine.applySettings(TEST_SETTINGS)
      await wait(START_WAIT_MS)
      add(texts.engineState(soundEngine.state))
      const music = soundEngine.musicInput
      if (soundEngine.state === 'running' && music) {
        await (target === 'effects' ? testEffects() : testMusic(music))
      }
      if (isCurrent) setIsDone(true)
    }

    void run()
    return () => {
      isCurrent = false
      timers.forEach(clearTimeout)
      stopLoop?.()
    }
  }, [target])

  return (
    <StatusScreen
      title={strings.soundTest.title}
      hint={target}
      lines={isDone ? [...lines, strings.soundTest.done] : lines}
      detail={navigator.userAgent}
      isLoading={!isDone}
    />
  )
}
