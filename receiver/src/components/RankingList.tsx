import type { PlayerId } from '@shared/types'

import type { RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import './RankingList.css'

interface RankingListProps {
  players: RankedPlayer[]
  // Points gagnés à la dernière question, affichés comme progression.
  gainedPoints?: Record<PlayerId, number>
  columns?: 1 | 2
}

export function RankingList({ players, gainedPoints, columns = 1 }: RankingListProps) {
  return (
    <ol className={`ranking ranking-columns-${columns}`}>
      {players.map((player, position) => {
        const gained = gainedPoints?.[player.id] ?? 0
        return (
          <li
            key={player.id}
            className="ranking-row"
            style={{ animationDelay: `${position * 80}ms` }}>
            <span className="ranking-rank">{player.rank}</span>
            <span className="ranking-avatar">{player.avatar}</span>
            <span className="ranking-name">{player.name}</span>
            {gainedPoints && (
              <span className="ranking-gained">{gained > 0 ? strings.ranking.gained(gained) : ''}</span>
            )}
            <span className="ranking-score">{strings.ranking.points(player.score)}</span>
          </li>
        )
      })}
    </ol>
  )
}
