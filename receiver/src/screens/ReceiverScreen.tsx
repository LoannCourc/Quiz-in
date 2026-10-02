import type { PublicSession } from '@shared/types'

import { EndScreen } from './EndScreen'
import { LobbyScreen } from './LobbyScreen'
import { PausedScreen } from './PausedScreen'
import { QuestionScreen } from './QuestionScreen'
import { RevealScreen } from './RevealScreen'
import { ScoresScreen } from './ScoresScreen'
import { StartingScreen } from './StartingScreen'

interface ReceiverScreenProps {
  session: PublicSession
  roomCode: string
}

// Un écran par état de la partie (spec 4.3 et 5).
export function ReceiverScreen({ session, roomCode }: ReceiverScreenProps) {
  switch (session.status) {
    case 'lobby':
      return <LobbyScreen session={session} roomCode={roomCode} />
    case 'starting':
      return <StartingScreen session={session} />
    case 'question':
      return <QuestionScreen session={session} />
    case 'reveal':
      return <RevealScreen session={session} />
    case 'scores':
      return <ScoresScreen session={session} />
    case 'paused':
      return <PausedScreen />
    case 'ended':
      return <EndScreen session={session} />
    case 'validation':
      // Option Contrôle (P1) : pas d'écran au MVP.
      return null
  }
}
