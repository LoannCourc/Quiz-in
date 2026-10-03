import type { NextQuestionCountdown } from '@shared/gameFlow'
import { useState } from 'react'

import { useRemainingMs } from '../hooks/useRemainingMs'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './TransitionInfo.css'

export type TransitionStep = 0 | 1 | 2

// Étapes entre deux questions : Révélation, Classement, Question suivante (l'étape en cours en or).
export function TransitionSteps({ active }: { active: TransitionStep }) {
  return (
    <ol className="transition-steps">
      {strings.transition.steps.map((label, index) => (
        <li key={label} className={index === active ? 'transition-step is-active' : 'transition-step'}>
          {label}
        </li>
      ))}
    </ol>
  )
}

// « Prochaine question dans N… » et une fine barre qui se vide (animation CSS transform seulement,
// reprise là où en est l'attente grâce à un délai négatif). Clé par attente (reprise après pause).
export function NextQuestionLine({ countdown }: { countdown: NextQuestionCountdown }) {
  return <WaitLine key={`${countdown.startsAt}-${countdown.endsAt}`} countdown={countdown} />
}

function WaitLine({ countdown }: { countdown: NextQuestionCountdown }) {
  const offsetMs = useServerTimeOffset()
  const remainingMs = useRemainingMs(countdown.endsAt)
  // Mesuré une seule fois : la barre CSS avance ensuite seule.
  const [elapsedMs] = useState(() => estimateServerNow(offsetMs) - countdown.startsAt)
  const seconds = Math.ceil(remainingMs / 1000)
  const { nextQuestionIn, finalRankingIn } = strings.transition

  return (
    <div className="next-question">
      <span className="next-question-label">
        {countdown.isLastQuestion ? finalRankingIn(seconds) : nextQuestionIn(seconds)}
      </span>
      <span className="next-question-track">
        <span
          className="next-question-fill"
          style={{
            animationDuration: `${Math.max(1, countdown.endsAt - countdown.startsAt)}ms`,
            animationDelay: `-${Math.max(0, elapsedMs)}ms`,
          }}
        />
      </span>
    </div>
  )
}
