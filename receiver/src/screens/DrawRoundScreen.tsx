import { hasRankingStep, isAwaitingHost, isLastQuestion, nextQuestionCountdown } from '@shared/gameFlow'
import type { PublicSession } from '@shared/types'

import { Countdown } from '../components/Countdown'
import { GameHeader } from '../components/GameHeader'
import { LiveDrawing } from '../components/LiveDrawing'
import { NextQuestionLine, TransitionSteps } from '../components/TransitionInfo'
import { strings } from '../strings'
import './DrawRoundScreen.css'

// Au-delà, le mot de la révélation passe en taille réduite (il tient alors sur une ou deux lignes).
const LONG_WORD_LENGTH = 8

// Dessine-moi, manche en cours : le dessin en grand (l'essentiel de l'écran), qui dessine, l'indice
// (catégorie et nombre de lettres, décision D5) et le temps restant. Jamais le mot.
export function DrawRoundScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const turn = session.drawTurn
  const drawerName = turn ? (session.players[turn.drawer]?.name ?? '') : ''
  return (
    <main className="screen draw-round">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} isRound />
      <div className="draw-round-body">
        <LiveDrawing key={turn?.round ?? -1} drawing={session.drawing} className="draw-round-canvas" />
        <aside className="draw-round-side">
          <h1 className="hero-title draw-round-title">{strings.draw.drawing(drawerName)}</h1>
          {turn && <p className="draw-round-hint">{strings.draw.hint(turn.category, turn.wordLength)}</p>}
          <Countdown phaseStartedAt={session.phaseStartedAt} phaseEndsAt={session.phaseEndsAt} />
        </aside>
      </div>
    </main>
  )
}

// Dessine-moi, révélation : le dessin final à gauche, le mot et son dessinateur à droite, puis la manche
// suivante (pas de classement au lot 2 : pas de points).
export function DrawRevealScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const turn = session.drawTurn
  const drawerName = turn ? (session.players[turn.drawer]?.name ?? null) : null
  const countdown = nextQuestionCountdown(session)
  const word = session.reveal?.correctAnswer ?? ''
  return (
    <main className="screen draw-round">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} isRound />
      <div className="draw-round-body">
        <LiveDrawing key={turn?.round ?? -1} drawing={session.drawing} className="draw-reveal-canvas" />
        <aside className="draw-round-side">
          <TransitionSteps active={0} withRanking={hasRankingStep(session)} isLastQuestion={isLastQuestion(session)} isRound />
          <p className="draw-round-hint">{strings.draw.itWas}</p>
          <h1 className={word.length > LONG_WORD_LENGTH ? 'draw-reveal-word is-long' : 'draw-reveal-word'}>{word}</h1>
          {drawerName && <p className="draw-reveal-by">{strings.draw.drawnBy(drawerName)}</p>}
          {countdown && <NextQuestionLine countdown={countdown} isRound />}
          {isAwaitingHost(session) && <p className="awaiting-host">{strings.awaitingHost}</p>}
        </aside>
      </div>
    </main>
  )
}
