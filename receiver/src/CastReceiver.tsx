import { useEffect, useState } from 'react'

import { useCastRoomCode } from './hooks/useCastRoomCode'
import { onCastAudioTest, onCastCode } from './lib/castReceiver'
import { LiveReceiver } from './LiveReceiver'
import { AudioTestScreen } from './screens/AudioTestScreen'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Diagnostic du son en cours : id change à chaque envoi, pour rejouer la même adresse.
interface AudioTest {
  url: string
  id: number
}

// Test du son demandé par cast-sender.html ; un code de partie reçu ensuite reprend la main.
function useCastAudioTest(): AudioTest | null {
  const [test, setTest] = useState<AudioTest | null>(null)
  useEffect(() => {
    const stopTests = onCastAudioTest((url) => setTest((previous) => ({ url, id: (previous?.id ?? 0) + 1 })))
    const stopCodes = onCastCode(() => setTest(null))
    return () => {
      stopTests()
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
  if (audioTest) return <AudioTestScreen key={audioTest.id} url={audioTest.url} />
  switch (cast.kind) {
    case 'starting':
    case 'waiting':
      return <StatusScreen title={strings.cast.waitingTitle} hint={strings.cast.waitingHint} isLoading />
    case 'error':
      return <StatusScreen title={strings.cast.errorTitle} hint={strings.cast.errorHint} detail={cast.detail} />
    case 'ready':
      return <LiveReceiver key={cast.roomCode} roomCode={cast.roomCode} />
  }
}
