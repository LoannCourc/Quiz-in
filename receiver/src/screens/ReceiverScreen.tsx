import { withHiddenBluffChoices } from '@shared/bluff'
import type { PublicSession } from '@shared/types'

import { DrawRevealScreen, DrawRoundScreen } from './DrawRoundScreen'
import { ValidationScreen } from './ValidationScreen'
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

// Un écran par état de la partie (spec 4.3 et 5). Bluff : propositions masquées par l'hôte en « ••• ».
export function ReceiverScreen({ session: received, roomCode }: ReceiverScreenProps) {
  const session = withHiddenBluffChoices(received)
  switch (session.status) {
    case 'lobby':
      return <LobbyScreen session={session} roomCode={roomCode} />
    case 'starting':
      return <StartingScreen session={session} />
    case 'question':
      // Dessine-moi : le dessin en direct à la place de la question.
      if (session.settings.answerMode === 'draw') return <DrawRoundScreen session={session} roomCode={roomCode} />
      return <QuestionScreen session={session} roomCode={roomCode} />
    case 'vote':
      // Bluff : l'écriture des fausses réponses, puis le vote, sur le même écran que la question.
      return <QuestionScreen session={session} roomCode={roomCode} />
    case 'reveal':
      if (session.settings.answerMode === 'draw') return <DrawRevealScreen session={session} roomCode={roomCode} />
      return <RevealScreen session={session} roomCode={roomCode} />
    case 'scores':
      return <ScoresScreen session={session} roomCode={roomCode} />
    case 'paused':
      return <PausedScreen />
    case 'ended':
      return <EndScreen session={session} />
    case 'validation':
      // Contrôle : l'énoncé reste affiché pendant que l'hôte valide les réponses (maquette T1).
      return <ValidationScreen session={session} roomCode={roomCode} />
  }
}
