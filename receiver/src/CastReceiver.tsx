import { useEffect, useState } from 'react'

import { useCastRoomCode } from './hooks/useCastRoomCode'
import { onCastAudioTest, onCastCode, onCastSoundTest } from './lib/castReceiver'
import { LiveReceiver } from './LiveReceiver'
import { AudioTestScreen } from './screens/AudioTestScreen'
import { SoundTestScreen } from './screens/SoundTestScreen'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Diagnostic du son en cours : id change à chaque envoi, pour rejouer le même test. extract : extrait
// d'un blind test (lecteur des blind tests) ; engine : moteur des effets et musiques (spec 17).
interface AudioTest {
  kind: 'extract' | 'engine'
  url: string
  id: number
}

// Test du son demandé par cast-sender.html ; un code de partie reçu ensuite reprend la main.
function useCastAudioTest(): AudioTest | null {
  const [test, setTest] = useState<AudioTest | null>(null)
  useEffect(() => {
    const start = (kind: AudioTest['kind'], url: string) => setTest((previous) => ({ kind, url, id: (previous?.id ?? 0) + 1 }))
    const stopTests = onCastAudioTest((url) => start('extract', url))
    const stopSoundTests = onCastSoundTest((target) => start('engine', target))
    const stopCodes = onCastCode(() => setTest(null))
    return () => {
      stopTests()
      stopSoundTests()
      stopCodes()
    }
  }, [])
  return test
}

// Mode Cast : la TV attend le code envoyé par l'app de l'hôte, puis affiche la partie comme
// avec ?code= (lecture de l'état dans Firebase). Un nouveau code repart de zéro.
export function CastReceiver() {
  const cast = useCastRoomCode()
  const audioTest = useCastAudioTest()
  if (audioTest?.kind === 'engine') return <SoundTestScreen key={audioTest.id} target={audioTest.url} />
  if (audioTest) return <AudioTestScreen key={audioTest.id} url={audioTest.url} />
  switch (cast.kind) {
    case 'starting':
    case 'waiting':
      return <StatusScreen title={strings.cast.waitingTitle} hint={strings.cast.waitingHint} isLoading />
    case 'error':
      return <StatusScreen title={strings.cast.errorTitle} hint={strings.cast.errorHint} detail={cast.detail} />
    case 'ready':
      return <LiveReceiver key={cast.roomCode} roomCode={cast.roomCode} isCastMode />
  }
}
