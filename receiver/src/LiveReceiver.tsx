import { ConnectionLostBanner } from './components/ConnectionLostBanner'
import { useLiveSession } from './hooks/useLiveSession'
import { ServerTimeOffsetContext } from './lib/serverTime'
import { ReceiverScreen } from './screens/ReceiverScreen'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Mode réel : affiche la partie sessions/{code} lue en temps réel dans Firebase.
export function LiveReceiver({ roomCode }: { roomCode: string }) {
  const { state, hasConnectedOnce, isConnected, serverTimeOffsetMs } = useLiveSession(roomCode)
  const isConnectionLost = hasConnectedOnce && !isConnected

  switch (state.kind) {
    case 'loading':
      return <StatusScreen title={strings.status.loadingTitle} isLoading />
    case 'notFound':
      return <StatusScreen title={strings.status.notFoundTitle} hint={strings.status.notFoundHint(roomCode)} />
    case 'error':
      return (
        <StatusScreen
          title={strings.status.errorTitle}
          hint={strings.status.errorHints[state.errorKind]}
          detail={state.detail}
        />
      )
    case 'ready':
      return (
        <ServerTimeOffsetContext value={serverTimeOffsetMs}>
          <ReceiverScreen session={state.session} roomCode={roomCode} />
          {isConnectionLost && <ConnectionLostBanner />}
        </ServerTimeOffsetContext>
      )
  }
}
