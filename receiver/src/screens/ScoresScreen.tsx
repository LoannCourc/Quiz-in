import { SCORES_TOP_COUNT } from '@shared/constants'
import type { PlayerId, Session } from '@shared/types'

import { RankingList } from '../components/RankingList'
import { currentAnswers, sortByRank } from '../lib/players'
import { strings } from '../strings'

export function ScoresScreen({ session }: { session: Session }) {
  const topPlayers = sortByRank(session.players).slice(0, SCORES_TOP_COUNT)
  const gainedPoints: Record<PlayerId, number> = {}
  for (const [playerId, answer] of Object.entries(currentAnswers(session))) {
    gainedPoints[playerId] = answer.points ?? 0
  }

  return (
    <main className="screen scores">
      <h1 className="screen-title">{strings.scores.title}</h1>
      <RankingList players={topPlayers} gainedPoints={gainedPoints} />
    </main>
  )
}
