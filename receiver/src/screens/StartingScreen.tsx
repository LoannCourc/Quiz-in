import type { Session } from '@shared/types'

import { useRemainingMs } from '../hooks/useRemainingMs'
import { strings } from '../strings'
import './StartingScreen.css'

export function StartingScreen({ session }: { session: Session }) {
  const remainingMs = useRemainingMs(session.phaseEndsAt)
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))

  return (
    <main className="screen starting">
      <p className="starting-label">{strings.starting.getReady}</p>
      {/* La clé change à chaque seconde : React recrée l'élément et l'animation rejoue. */}
      <p key={seconds} className="starting-number">
        {seconds}
      </p>
    </main>
  )
}
