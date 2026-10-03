import { useCastRoomCode } from './hooks/useCastRoomCode'
import { LiveReceiver } from './LiveReceiver'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Mode Cast : la TV attend le code envoyé par l'app de l'hôte, puis affiche la partie comme
// avec ?code= (lecture de l'état dans Firebase). Un nouveau code repart de zéro.
export function CastReceiver() {
  const cast = useCastRoomCode()
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
