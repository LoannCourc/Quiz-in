import type { NextQuestionCountdown } from '@shared/gameFlow'
import { useState } from 'react'

import { useRemainingMs } from '../hooks/useRemainingMs'
import { phaseAnimation } from '../lib/phaseAnimation'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './TransitionInfo.css'

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
          style={phaseAnimation(countdown.endsAt - countdown.startsAt, elapsedMs)}
        />
      </span>
    </div>
  )
}
