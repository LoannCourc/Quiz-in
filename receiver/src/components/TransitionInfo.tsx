import type { NextQuestionCountdown } from '@shared/gameFlow'
import { useState } from 'react'

import { useFitScale } from '../hooks/useFitScale'

import { useRemainingMs } from '../hooks/useRemainingMs'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './TransitionInfo.css'

export type TransitionStep = 0 | 1 | 2

// Toujours sur une ligne : texte des étapes réduit tant que la rangée dépasse sa colonne (Dessine-moi).
const STEPS_FIT = { variables: ['--steps-scale'], boxes: '.transition-steps', texts: '.transition-steps' }

// Étapes entre deux questions : Révélation, Classement, Question suivante (l'étape en cours en or).
// Suspense ou dernière question (withRanking faux) : sans l'étape Classement, qui n'a pas lieu ; dernière
// question : « Classement final » à la place de « Question suivante ».
export function TransitionSteps({
  active,
  withRanking = true,
  isLastQuestion = false,
  isRound = false,
}: {
  active: TransitionStep
  withRanking?: boolean
  isLastQuestion?: boolean
  // Dessine-moi : « Manche suivante ».
  isRound?: boolean
}) {
  const { steps: questionSteps, finalStep, nextRoundStep } = strings.transition
  const baseSteps = isRound ? [questionSteps[0], questionSteps[1], nextRoundStep] : questionSteps
  const activeLabel = baseSteps[active]
  const labels = isLastQuestion ? [...baseSteps.slice(0, 2), finalStep] : baseSteps
  const steps = withRanking ? labels : labels.filter((_, index) => index !== 1)
  const fitRef = useFitScale(steps.join('|'), STEPS_FIT)
  return (
    <div ref={fitRef} className="transition-steps-fit">
    <ol className="transition-steps">
      {steps.map((label) => (
        <li key={label} className={label === activeLabel ? 'transition-step is-active' : 'transition-step'}>
          {label}
        </li>
      ))}
    </ol>
    </div>
  )
}

// « Prochaine question dans N… » et une fine barre qui se vide (animation CSS transform seulement,
// reprise là où en est l'attente grâce à un délai négatif). Clé par attente (reprise après pause).
export function NextQuestionLine({ countdown, isRound = false }: { countdown: NextQuestionCountdown; isRound?: boolean }) {
  return <WaitLine key={`${countdown.startsAt}-${countdown.endsAt}`} countdown={countdown} isRound={isRound} />
}

function WaitLine({ countdown, isRound }: { countdown: NextQuestionCountdown; isRound: boolean }) {
  const offsetMs = useServerTimeOffset()
  const remainingMs = useRemainingMs(countdown.endsAt)
  // Mesuré une seule fois : la barre CSS avance ensuite seule.
  const [elapsedMs] = useState(() => estimateServerNow(offsetMs) - countdown.startsAt)
  const seconds = Math.ceil(remainingMs / 1000)
  const { nextQuestionIn, nextRoundIn, finalRankingIn } = strings.transition

  return (
    <div className="next-question">
      <span className="next-question-label">
        {countdown.isLastQuestion ? finalRankingIn(seconds) : (isRound ? nextRoundIn : nextQuestionIn)(seconds)}
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
