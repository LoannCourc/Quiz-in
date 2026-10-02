import { SCORES_TOP_COUNT } from '@shared/constants'
import type { PlayerId, PublicSession } from '@shared/types'

import { RankingList } from '../components/RankingList'
import { sortByRank } from '../lib/players'
import { strings } from '../strings'

export function ScoresScreen({ session }: { session: PublicSession }) {
  const topPlayers = sortByRank(session.players).slice(0, SCORES_TOP_COUNT)
  // Points de la dernière question, publiés par l'hôte à la révélation.
  const gainedPoints: Record<PlayerId, number> = {}
  for (const [playerId, result] of Object.entries(session.reveal?.results ?? {})) {
    gainedPoints[playerId] = result.points
  }

  return (
    <main className="screen scores">
      <h1 className="screen-title">{strings.scores.title}</h1>
      <RankingList players={topPlayers} gainedPoints={gainedPoints} />
    </main>
  )
}
