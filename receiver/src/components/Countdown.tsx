import { useElapsedAtMountMs, useRemainingMs } from '../hooks/useRemainingMs'
import './Countdown.css'

const URGENT_THRESHOLD_S = 5

interface CountdownProps {
  phaseStartedAt: number
  phaseEndsAt: number
}

// À monter avec key={phaseStartedAt} : la barre repart de zéro à chaque nouvelle phase.
export function Countdown({ phaseStartedAt, phaseEndsAt }: CountdownProps) {
  const remainingMs = useRemainingMs(phaseEndsAt)
  // Mesuré une seule fois : la barre CSS avance ensuite seule, sans nouveau rendu React.
  const elapsedAtMountMs = useElapsedAtMountMs(phaseStartedAt)
  const seconds = Math.ceil(remainingMs / 1000)
  const isUrgent = seconds <= URGENT_THRESHOLD_S

  return (
    <div className={isUrgent ? 'countdown is-urgent' : 'countdown'}>
      <div className="countdown-track">
        <div
          className="countdown-fill"
          style={{
            animationDuration: `${phaseEndsAt - phaseStartedAt}ms`,
            animationDelay: `-${elapsedAtMountMs}ms`,
          }}
        />
      </div>
      <span className="countdown-seconds">{seconds}</span>
    </div>
  )
}
