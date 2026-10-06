import { hasStreakBadge } from '@shared/streak'

import { strings } from '../strings'
import './StreakBadge.css'

interface StreakBadgeProps {
  streak: number | undefined
  // Délai CSS d'arrivée de la ligne qui le porte : le badge apparaît juste après elle.
  delay?: string
}

const BADGE_AFTER_ROW_MS = 300

// Badge flamme d'une série (spec 18), à partir de 3 : deux gouttes superposées (rose, puis or), le
// nombre dedans. Formes CSS seulement, taille relative au texte de la ligne (em).
export function StreakBadge({ streak, delay }: StreakBadgeProps) {
  if (!hasStreakBadge(streak)) return null
  const count = streak ?? 0
  return (
    <span className="streak-badge" role="img" aria-label={strings.streak(count)} style={delay ? { animationDelay: `calc(${delay} + ${BADGE_AFTER_ROW_MS}ms)` } : undefined}>
      <span className="streak-flame streak-flame-outer" />
      <span className="streak-flame streak-flame-inner" />
      <span className={count >= 10 ? 'streak-count is-wide' : 'streak-count'}>{count}</span>
    </span>
  )
}
