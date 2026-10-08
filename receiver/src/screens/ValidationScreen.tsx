import type { PublicSession } from '@shared/types'

import { GameHeader } from '../components/GameHeader'
import { answeredByCount } from '../lib/players'
import { questionSizeClass } from '../lib/questionSize'
import { strings } from '../strings'
import './ValidationScreen.css'

// Contrôle, pendant que l'hôte valide (maquette T1) : l'énoncé en grand titre blanc, trois points qui
// s'allument tour à tour, « L'hôte valide les réponses… » et le nombre de réponses reçues. Aucun texte de
// joueur avant la révélation.
export function ValidationScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const question = session.currentQuestion
  if (!question) return null
  return (
    <main className="screen validation">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      <h1 className={['validation-question', questionSizeClass(question.text)].filter(Boolean).join(' ')}>{question.text}</h1>
      <div className="validation-status">
        <span className="validation-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p className="validation-title">{strings.validation.title}</p>
        <p className="validation-received">{strings.validation.received(answeredByCount(session))}</p>
      </div>
    </main>
  )
}
