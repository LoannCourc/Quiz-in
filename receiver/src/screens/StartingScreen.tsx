import type { PublicSession } from '@shared/types'

import { useRemainingMs } from '../hooks/useRemainingMs'
import { strings } from '../strings'
import './StartingScreen.css'

export function StartingScreen({ session }: { session: PublicSession }) {
  const remainingMs = useRemainingMs(session.phaseEndsAt)
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))

  return (
    <main className="screen starting">
      <h1 className="hero-title">{strings.starting.getReady}</h1>
      <div className="starting-disc">
        {/* La clé change à chaque seconde : React recrée l'élément et l'animation rejoue. */}
        <span key={seconds} className="starting-number">
          {seconds}
        </span>
      </div>
      <p className="starting-hint">{strings.starting.firstQuestion}</p>
    </main>
  )
}
