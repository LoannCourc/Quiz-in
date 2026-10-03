import { isHostAway } from '@shared/hostAbsence'
import type { PublicSession } from '@shared/types'

import { ConnectionLostBanner } from './components/ConnectionLostBanner'
import { HostAwayStatus } from './components/HostAwayStatus'
import { useAbandonedGameCleanup } from './hooks/useAbandonedGameCleanup'
import { useLiveSession } from './hooks/useLiveSession'
import { usePhaseStale } from './hooks/usePhaseStale'
import { ServerTimeOffsetContext } from './lib/serverTime'
import { ReceiverScreen } from './screens/ReceiverScreen'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Mode réel : affiche la partie sessions/{code} lue en temps réel dans Firebase.
export function LiveReceiver({ roomCode }: { roomCode: string }) {
  const { state, hasConnectedOnce, isConnected, serverTimeOffsetMs } = useLiveSession(roomCode)
  const isConnectionLost = hasConnectedOnce && !isConnected
  useAbandonedGameCleanup(roomCode, state.kind === 'ready' ? state.session : null, serverTimeOffsetMs)

  switch (state.kind) {
    case 'loading':
      return <StatusScreen title={strings.status.loadingTitle} isLoading />
    case 'notFound':
      return state.wasRemoved ? (
        <StatusScreen title={strings.status.gameOverTitle} hint={strings.status.gameOverHint} />
      ) : (
        <StatusScreen title={strings.status.notFoundTitle} hint={strings.status.notFoundHint(roomCode)} />
      )
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
          <LiveSessionScreen session={state.session} roomCode={roomCode} />
          {isConnectionLost && <ConnectionLostBanner />}
        </ServerTimeOffsetContext>
      )
  }
}

// Hôte absent (hostLeftAt, avec le temps avant suppression) en priorité ; sinon, phase bloquée
// depuis plus de 5 s : « En attente de l'hôte… » à la place du chrono figé.
function LiveSessionScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const isStale = usePhaseStale(session)
  if (isHostAway(session)) return <HostAwayStatus session={session} />
  if (isStale) return <StatusScreen title={strings.waitingHost.title} hint={strings.waitingHost.message} />
  return <ReceiverScreen session={session} roomCode={roomCode} />
}
