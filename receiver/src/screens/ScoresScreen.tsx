import { isAnnouncingNextQuestion, nextQuestionCountdown, upcomingQuestionNumber } from '@shared/gameFlow'
import { scoresEntryMs, scoresRowCount } from '@shared/rankingTimeline'
import { rankingStreakBadges } from '@shared/streak'
import type { PublicSession } from '@shared/types'

import { ExtraStreaks } from '../components/ExtraStreaks'
import { GameHeader } from '../components/GameHeader'
import { HostWaitBanner } from '../components/HostWaitBanner'
import { InterimRankingBoard } from '../components/InterimRankingBoard'
import { TeamRankingBoard } from '../components/TeamBoards'
import { NextQuestionLine } from '../components/TransitionInfo'
import { useEntryDelay } from '../hooks/useEntryDelay'
import { useRemainingMs } from '../hooks/useRemainingMs'
import { progressKindOf } from '../lib/answerLayout'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './ScoresScreen.css'

interface ScoresScreenProps {
  session: PublicSession
  roomCode: string
}

// Classement entre deux questions (maquette « 1er avec une couronne » ; Groupe : classement des équipes).
// Pendant les 2 dernières secondes, annonce plein écran de la question suivante (même durée).
export function ScoresScreen({ session, roomCode }: ScoresScreenProps) {
  const offsetMs = useServerTimeOffset()
  // Rafraîchi plusieurs fois par seconde : bascule vers l'annonce au bon moment.
  useRemainingMs(session.phaseEndsAt)
  const upcoming = upcomingQuestionNumber(session)
  // Dessine-moi : « manche » au lieu de « question ».
  const isRound = session.settings.answerMode === 'draw'
  // Lignes de la dernière à la première, chacune avec son son (shared/rankingTimeline.ts).
  const entryDelay = useEntryDelay(session.phaseStartedAt)
  const rowCount = scoresRowCount(session)
  const delays = Array.from({ length: rowCount }, (_, position) => entryDelay(scoresEntryMs(position, rowCount)))

  if (upcoming !== null && session.questionCount && isAnnouncingNextQuestion(session, estimateServerNow(offsetMs))) {
    return (
      <main className="screen announce">
        {/* Sans la pastille « QUESTION n/N » de la question finie : seule l'annonce compte. */}
        <GameHeader roomCode={roomCode} />
        <div className="announce-center">
          <h1 className="hero-title announce-title">{(isRound ? strings.transition.announceRound : strings.transition.announce)(upcoming, session.questionCount)}</h1>
          <p className="announce-hint">{strings.transition.announceHint}</p>
        </div>
      </main>
    )
  }

  const countdown = nextQuestionCountdown(session)

  return (
    <main className="screen scores">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} progressKind={progressKindOf(session)} />
      {session.settings.teams ? (
        // Groupe : classement des équipes à la place du classement des joueurs (maquette G3).
        <>
          <div className="scores-title-row">
            <h1 className="screen-title">{strings.teams.rankingTitle}</h1>
            <span className="scores-subtitle">{(isRound ? strings.teams.afterRound : strings.teams.afterQuestion)(session.currentIndex + 1, session.questionCount)}</span>
          </div>
          <div className="scores-side">
            <TeamRankingBoard session={session} delays={delays} streaks={rankingStreakBadges(session)} />
            <ExtraStreaks session={session} delay={delays[0]} />
          </div>
        </>
      ) : (
        <>
          <h1 className="hero-title scores-title">{strings.scores.title}</h1>
          <InterimRankingBoard session={session} delays={delays} />
        </>
      )}
      {countdown && (
        <div className="screen-bottom-line">
          <NextQuestionLine countdown={countdown} isRound={isRound} />
        </div>
      )}
      <HostWaitBanner session={session} />
    </main>
  )
}
