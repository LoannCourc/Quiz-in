import { isHostAway } from '@shared/hostAbsence'
import type { PublicSession } from '@shared/types'
import { useLayoutEffect, type ReactNode } from 'react'

import { AudioUnlockBanner } from './components/AudioUnlockBanner'
import { ConnectionLostBanner } from './components/ConnectionLostBanner'
import { PerfPanel } from './components/PerfPanel'
import { HostAwayStatus } from './components/HostAwayStatus'
import { useAbandonedGameCleanup } from './hooks/useAbandonedGameCleanup'
import { useBlindTestInfo } from './hooks/useBlindTestInfo'
import { GameAudioStateContext, useGameAudio } from './hooks/useGameAudio'
import { useKeepAwake } from './hooks/useKeepAwake'
import { useLiveSession } from './hooks/useLiveSession'
import { usePerfEnabled } from './hooks/usePerfEnabled'
import { usePhaseStale } from './hooks/usePhaseStale'
import { useTvMusic } from './hooks/useTvMusic'
import { useTvPresence } from './hooks/useTvPresence'
import { useTvSound } from './hooks/useTvSound'
import { perfMonitor } from './lib/perf/perfMonitor'
import { ServerTimeOffsetContext } from './lib/serverTime'
import { ReceiverScreen } from './screens/ReceiverScreen'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

interface LiveReceiverProps {
  roomCode: string
  // Mode Cast : la box joue le son sans geste. Sinon (plan B, navigateur d'un PC), un clic est demandé.
  isCastMode?: boolean
}

// Mode réel : affiche la partie sessions/{code} lue en temps réel dans Firebase.
export function LiveReceiver({ roomCode, isCastMode = false }: LiveReceiverProps) {
  const { state, hasConnectedOnce, isConnected, serverTimeOffsetMs } = useLiveSession(roomCode)
  const isConnectionLost = hasConnectedOnce && !isConnected
  const isPerfEnabled = usePerfEnabled()
  useAbandonedGameCleanup(roomCode, state.kind === 'ready' ? state.session : null, serverTimeOffsetMs)
  useTvPresence(roomCode, state.kind === 'ready' && isConnected)
  // Pas de veille de la box du salon à la fin de partie (podium compris) ; coupé sans partie.
  useKeepAwake(state.kind === 'ready' && state.session.status !== 'ended')

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
          <GameAudio session={state.session} serverOffsetMs={serverTimeOffsetMs} isCastMode={isCastMode}>
            <LiveSessionScreen session={state.session} roomCode={roomCode} />
          </GameAudio>
          {isConnectionLost && <ConnectionLostBanner />}
          {isPerfEnabled && <PerfPanel serverOffsetMs={serverTimeOffsetMs} />}
        </ServerTimeOffsetContext>
      )
  }
}

interface GameAudioProps {
  session: PublicSession
  serverOffsetMs: number
  isCastMode: boolean
  children: ReactNode
}

// Son de la TV, monté pour toute la partie (il continue d'un écran à l'autre) : extrait du blind test,
// effets et musiques (spec 17). Plan B : bandeau « Cliquez pour activer le son » tant que le navigateur
// n'a pas autorisé le son (avant un blind test, ou dès que l'hôte a activé musique ou effets).
function GameAudio({ session, serverOffsetMs, isCastMode, children }: GameAudioProps) {
  const { isEnabled, isBlindTest } = useBlindTestInfo(session.quizId)
  const audioState = useGameAudio(session, isEnabled, serverOffsetMs)
  const sound = useTvSound(session, serverOffsetMs)
  useTvMusic(session, isBlindTest, serverOffsetMs)
  const isBeforeGame = session.status === 'lobby' || session.status === 'starting'
  const needsBlindTestUnlock = isEnabled && ((isBlindTest && isBeforeGame) || audioState === 'blocked')
  const needsUnlock = !isCastMode && (needsBlindTestUnlock || (sound.isWanted && sound.state === 'suspended'))
  return (
    <GameAudioStateContext value={audioState}>
      {children}
      {needsUnlock && <AudioUnlockBanner />}
    </GameAudioStateContext>
  )
}

// Hôte absent (hostLeftAt, avec le temps avant suppression) en priorité ; sinon, phase bloquée
// depuis plus de 5 s : « En attente de l'hôte… » à la place du chrono figé.
function LiveSessionScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const isStale = usePhaseStale(session)
  usePerfDisplayed(session.phaseStartedAt)
  perfMonitor.noteRender()
  if (isHostAway(session)) return <HostAwayStatus session={session} />
  if (isStale) return <StatusScreen title={strings.waitingHost.title} hint={strings.waitingHost.message} />
  return <ReceiverScreen session={session} roomCode={roomCode} />
}

// Panneau ?perf=1 : heure de la première image qui montre une nouvelle phase. L'effet de mise en page
// s'exécute avant que l'image soit peinte ; requestAnimationFrame tombe juste avant cette peinture.
function usePerfDisplayed(phaseStartedAt: number): void {
  useLayoutEffect(() => {
    const frameId = requestAnimationFrame(() => perfMonitor.noteDisplayed(phaseStartedAt))
    return () => cancelAnimationFrame(frameId)
  }, [phaseStartedAt])
}
