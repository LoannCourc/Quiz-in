import { SCORES_TOP_COUNT } from '@shared/constants'
import type { PlayerId, PublicSession } from '@shared/types'

import { GameHeader } from '../components/GameHeader'
import { Podium } from '../components/Podium'
import { RankingList } from '../components/RankingList'
import { sortByRank } from '../lib/players'
import { strings } from '../strings'
import './ScoresScreen.css'

const PODIUM_SIZE = 3

interface ScoresScreenProps {
  session: PublicSession
  roomCode: string
}

// Top 5 (spec 4.3) : podium des trois premiers, puis 4e et 5e avec les points gagnés.
export function ScoresScreen({ session, roomCode }: ScoresScreenProps) {
  const topPlayers = sortByRank(session.players).slice(0, SCORES_TOP_COUNT)
  // Points de la dernière question, publiés par l'hôte à la révélation.
  const gainedPoints: Record<PlayerId, number> = {}
  for (const [playerId, result] of Object.entries(session.reveal?.results ?? {})) {
    gainedPoints[playerId] = result.points
  }

  return (
    <main className="screen scores">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      <div className="scores-title-row">
        <h1 className="screen-title">{strings.scores.title}</h1>
        <span className="scores-subtitle">{strings.scores.afterQuestion(session.currentIndex + 1)}</span>
      </div>
      <div className="scores-body">
        <Podium players={topPlayers.slice(0, PODIUM_SIZE)} />
        <RankingList players={topPlayers.slice(PODIUM_SIZE)} gainedPoints={gainedPoints} />
      </div>
    </main>
  )
}
