import { AUDIO_EXTRACT_S } from '@shared/constants'
import { useEffect, useState } from 'react'

import { tvAudioPlayer } from '../lib/tvAudioPlayer'
import { strings } from '../strings'
import { StatusScreen } from './StatusScreen'

// Début de l'extrait joué pendant le test (au milieu de la preview, comme un vrai blind test).
const TEST_START_S = 5

type TestState =
  | { kind: 'loading' }
  | { kind: 'playing'; delayMs: number }
  | { kind: 'finished' }
  | { kind: 'blocked' }
  | { kind: 'failed' }

function hint(state: TestState): string {
  switch (state.kind) {
    case 'loading':
      return strings.audioTest.loading
    case 'playing':
      return strings.audioTest.playing(state.delayMs)
    case 'finished':
      return strings.audioTest.finished(AUDIO_EXTRACT_S)
    case 'blocked':
      return strings.audioTest.blocked
    case 'failed':
      return strings.audioTest.failed
  }
}

// Diagnostic du son demandé par cast-sender.html : joue l'extrait avec le lecteur des blind tests,
// sans aucun geste sur la TV, et affiche le résultat.
export function AudioTestScreen({ url }: { url: string }) {
  const [state, setState] = useState<TestState>({ kind: 'loading' })

  useEffect(() => {
    let stopTimer: ReturnType<typeof setTimeout> | undefined
    // Écran remplacé (nouveau test) avant la fin du chargement : on ignore le résultat.
    let isCurrent = true
    const startedAt = performance.now()
    void tvAudioPlayer.play(url, TEST_START_S, 1).then((result) => {
      if (!isCurrent || result === 'superseded') return
      if (result !== 'playing') {
        setState({ kind: result })
        return
      }
      setState({ kind: 'playing', delayMs: Math.round(performance.now() - startedAt) })
      stopTimer = setTimeout(() => {
        tvAudioPlayer.stop()
        setState({ kind: 'finished' })
      }, AUDIO_EXTRACT_S * 1000)
    })
    return () => {
      isCurrent = false
      clearTimeout(stopTimer)
      tvAudioPlayer.stop()
    }
  }, [url])

  return (
    <StatusScreen
      title={strings.audioTest.title}
      hint={hint(state)}
      detail={navigator.userAgent}
      isLoading={state.kind === 'loading'}
    />
  )
}
