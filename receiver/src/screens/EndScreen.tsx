import type { PublicSession } from '@shared/types'

import { RankingList } from '../components/RankingList'
import { sortByRank, type RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import './EndScreen.css'

const PODIUM_SIZE = 3
const SINGLE_COLUMN_MAX_PLAYERS = 8

// Ordre visuel classique d'un podium : 2e à gauche, 1er au centre, 3e à droite.
const PODIUM_VISUAL_ORDER = [1, 0, 2]

export function EndScreen({ session }: { session: PublicSession }) {
  const players = sortByRank(session.players)
  const podium = PODIUM_VISUAL_ORDER.map((position) => players[position]).filter(
    (player): player is RankedPlayer => player !== undefined,
  )

  return (
    <main className="screen end">
      <h1 className="screen-title end-title">{strings.end.title}</h1>
      <section className="podium">
        {podium.map((player) => (
          <div key={player.id} className={`podium-step podium-rank-${Math.min(player.rank, PODIUM_SIZE)}`}>
            <span className="podium-avatar">{player.avatar}</span>
            <span className="podium-name">{player.name}</span>
            <div className="podium-block">
              <span className="podium-rank">{strings.ranking.rank(player.rank)}</span>
              <span className="podium-score">{strings.ranking.points(player.score)}</span>
            </div>
          </div>
        ))}
      </section>
      <RankingList
        players={players}
        columns={players.length > SINGLE_COLUMN_MAX_PLAYERS ? 2 : 1}
      />
    </main>
  )
}
