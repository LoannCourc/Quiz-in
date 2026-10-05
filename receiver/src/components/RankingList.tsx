import type { PlayerId } from '@shared/types'

import type { RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import './RankingList.css'

interface RankingListProps {
  players: RankedPlayer[]
  // Points gagnés à la dernière question, affichés comme progression.
  gainedPoints?: Record<PlayerId, number>
  columns?: 1 | 2
  // Délai CSS d'arrivée de chaque ligne (classement : de la dernière à la première, avec un son) ;
  // sinon, les lignes glissent l'une après l'autre de haut en bas.
  delays?: readonly string[]
  // Fin de partie (spec 17) : les avatars rebondissent, de moins en moins fort avec le rang ; les
  // derniers se balancent lentement (EndDance.css).
  dance?: boolean
}

// Énergie de l'avatar selon la position dans la liste : 1 (fort), 2 (moyen), 3 (balancement lent).
function energyOf(position: number, count: number): 1 | 2 | 3 {
  if (position < count / 3) return 1
  return position < (2 * count) / 3 ? 2 : 3
}

// Décalage des rebonds d'une ligne à l'autre, pour qu'ils ne battent pas tous ensemble.
const DANCE_OFFSET_S = 0.17

export function RankingList({ players, gainedPoints, columns = 1, delays, dance = false }: RankingListProps) {
  return (
    <ol
      className={`ranking ranking-columns-${columns}`}
      // Deux colonnes : la première se remplit d'abord, autant de lignes que nécessaire.
      style={columns === 2 ? { gridTemplateRows: `repeat(${Math.ceil(players.length / 2)}, auto)` } : undefined}>
      {players.map((player, position) => {
        const gained = gainedPoints?.[player.id] ?? 0
        return (
          <li
            key={player.id}
            className="ranking-row"
            style={{ animationDelay: delays?.[position] ?? `${position * 80}ms` }}>
            <span className="ranking-rank">{player.rank}</span>
            <span
              className={dance ? `ranking-avatar energy-${energyOf(position, players.length)}` : 'ranking-avatar'}
              style={dance ? { animationDelay: `${-(position % 6) * DANCE_OFFSET_S}s` } : undefined}>
              {player.avatar}
            </span>
            <span className="ranking-name">{player.name}</span>
            {gainedPoints && (
              <span className="ranking-gained">{gained > 0 ? strings.ranking.gained(gained) : ''}</span>
            )}
            <span className="ranking-score">
              {columns === 2 ? strings.ranking.compactPoints(player.score) : strings.ranking.points(player.score)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
