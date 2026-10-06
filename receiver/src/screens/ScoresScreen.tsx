import { SCORES_TOP_COUNT } from '@shared/constants'
import { isAnnouncingNextQuestion, isAwaitingHost, nextQuestionCountdown, upcomingQuestionNumber } from '@shared/gameFlow'
import { scoresEntryMs, scoresRowCount } from '@shared/rankingTimeline'
import type { PlayerId, PublicSession } from '@shared/types'

import { GameHeader } from '../components/GameHeader'
import { Podium } from '../components/Podium'
import { RankingList } from '../components/RankingList'
import { TeamRankingBoard } from '../components/TeamBoards'
import { NextQuestionLine, TransitionSteps } from '../components/TransitionInfo'
import { useEntryDelay } from '../hooks/useEntryDelay'
import { useRemainingMs } from '../hooks/useRemainingMs'
import { sortByRank } from '../lib/players'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './ScoresScreen.css'

const PODIUM_SIZE = 3

interface ScoresScreenProps {
  session: PublicSession
  roomCode: string
}

// Top 5 (spec 4.3) : podium des trois premiers, puis 4e et 5e avec les points gagnés.
// Pendant les 2 dernières secondes, annonce plein écran de la question suivante (même durée).
export function ScoresScreen({ session, roomCode }: ScoresScreenProps) {
  const offsetMs = useServerTimeOffset()
  // Rafraîchi plusieurs fois par seconde : bascule vers l'annonce au bon moment.
  useRemainingMs(session.phaseEndsAt)
  const upcoming = upcomingQuestionNumber(session)
  // Lignes de la dernière à la première, chacune avec son son (shared/rankingTimeline.ts).
  const entryDelay = useEntryDelay(session.phaseStartedAt)
  const rowCount = scoresRowCount(session)
  const delays = Array.from({ length: rowCount }, (_, position) => entryDelay(scoresEntryMs(position, rowCount)))

  if (upcoming !== null && session.questionCount && isAnnouncingNextQuestion(session, estimateServerNow(offsetMs))) {
    return (
      <main className="screen announce">
        {/* Sans la pastille « QUESTION n/N » de la question finie : seule l'annonce compte. */}
        <GameHeader roomCode={roomCode} />
        <TransitionSteps active={2} />
        <div className="announce-center">
          <h1 className="hero-title announce-title">{strings.transition.announce(upcoming, session.questionCount)}</h1>
          <p className="announce-hint">{strings.transition.announceHint}</p>
        </div>
      </main>
    )
  }

  const topPlayers = sortByRank(session.players).slice(0, SCORES_TOP_COUNT)
  // Points de la dernière question, publiés par l'hôte à la révélation.
  const gainedPoints: Record<PlayerId, number> = {}
  for (const [playerId, result] of Object.entries(session.reveal?.results ?? {})) {
    gainedPoints[playerId] = result.points
  }
  const countdown = nextQuestionCountdown(session)
  // Séries (spec 18) : jamais en Suspense, où rien ne doit trahir le classement caché.
  const showStreaks = !session.settings.suspense

  return (
    <main className="screen scores">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      <TransitionSteps active={1} />
      {session.settings.teams ? (
        // Groupe : classement des équipes à la place du classement des joueurs (maquette G3).
        <>
          <div className="scores-title-row">
            <h1 className="screen-title">{strings.teams.rankingTitle}</h1>
            <span className="scores-subtitle">{strings.teams.afterQuestion(session.currentIndex + 1, session.questionCount)}</span>
          </div>
          <TeamRankingBoard session={session} delays={delays} showStreaks={showStreaks} />
        </>
      ) : (
        <>
          <div className="scores-title-row">
            <h1 className="screen-title">{strings.scores.title}</h1>
            <span className="scores-subtitle">{strings.scores.afterQuestion(session.currentIndex + 1)}</span>
          </div>
          <div className="scores-body">
            <Podium players={topPlayers.slice(0, PODIUM_SIZE)} delays={delays} showStreaks={showStreaks} />
            <RankingList players={topPlayers.slice(PODIUM_SIZE)} gainedPoints={gainedPoints} delays={delays.slice(PODIUM_SIZE)} showStreaks={showStreaks} />
          </div>
        </>
      )}
      {countdown && <NextQuestionLine countdown={countdown} />}
      {isAwaitingHost(session) && <p className="awaiting-host">{strings.awaitingHost}</p>}
    </main>
  )
}
