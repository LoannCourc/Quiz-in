import { extraStreaks } from '@shared/streak'
import type { PublicSession } from '@shared/types'

import { strings } from '../strings'
import { StreakBadge } from './StreakBadge'
import './ExtraStreaks.css'

// « Aussi en série : 🐯 Max 4 · 🐧 Noé 3 · +2 » sous le classement intermédiaire (spec 18) : les séries
// de 3 et plus des joueurs absents du classement affiché. delay : arrivée, après la dernière ligne.
export function ExtraStreaks({ session, delay }: { session: PublicSession; delay?: string }) {
  const { shown, moreCount } = extraStreaks(session)
  if (shown.length === 0) return null
  return (
    <p className="extra-streaks" style={{ animationDelay: delay }}>
      <span className="extra-streaks-label">{strings.streakExtra.label}</span>
      {shown.map(({ id, streak }) => {
        const player = session.players[id]
        return (
          <span key={id} className="extra-streak">
            <span className="extra-streak-avatar">{player.avatar}</span>
            <span>{player.name}</span>
            <StreakBadge streak={streak} delay={delay} />
          </span>
        )
      })}
      {moreCount > 0 && <span className="extra-streaks-more">{strings.streakExtra.more(moreCount)}</span>}
    </p>
  )
}
