import type { RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import { nameScaleStyle } from '../lib/playerNameStyle'
import { AvatarGlyph } from './AvatarGlyph'
import './RankingList.css'

interface RankingListProps {
  players: RankedPlayer[]
  columns?: 1 | 2
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

// Écran de fin : les joueurs après le podium, qui glissent l'un après l'autre de haut en bas.
export function RankingList({ players, columns = 1, dance = false }: RankingListProps) {
  return (
    <ol
      className={`ranking ranking-columns-${columns}`}
      // Deux colonnes : la première se remplit d'abord, autant de lignes que nécessaire.
      style={columns === 2 ? { gridTemplateRows: `repeat(${Math.ceil(players.length / 2)}, auto)` } : undefined}>
      {players.map((player, position) => (
        <li key={player.id} className="ranking-row" style={{ animationDelay: `${position * 80}ms` }}>
          <span className="ranking-rank">{player.rank}</span>
          <span
            className={dance ? `ranking-avatar energy-${energyOf(position, players.length)}` : 'ranking-avatar'}
            style={dance ? { animationDelay: `${-(position % 6) * DANCE_OFFSET_S}s` } : undefined}>
            <AvatarGlyph emoji={player.avatar} />
          </span>
          <span className="ranking-name" style={nameScaleStyle(player.name)}>
            {player.name}
          </span>
          <span className="ranking-score">
            {columns === 2 ? strings.ranking.compactPoints(player.score) : strings.ranking.points(player.score)}
          </span>
        </li>
      ))}
    </ol>
  )
}
