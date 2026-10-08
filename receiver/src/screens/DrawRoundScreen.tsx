import { drawFoundProgress } from '@shared/drawGuess'
import { hasRankingStep, isAwaitingHost, isLastQuestion, nextQuestionCountdown } from '@shared/gameFlow'
import type { PublicSession } from '@shared/types'
import type { CSSProperties } from 'react'

import { Countdown } from '../components/Countdown'
import { GameHeader } from '../components/GameHeader'
import { LiveDrawing } from '../components/LiveDrawing'
import { NextQuestionLine, TransitionSteps } from '../components/TransitionInfo'
import { useFitScale } from '../hooks/useFitScale'
import { strings } from '../strings'
import './DrawRoundScreen.css'

// Colonne de droite : réduite tant qu'elle déborde, ou qu'un mot du titre est coupé (long pseudo).
const SIDE_FIT = { variables: ['--side-scale'], boxes: '.draw-round-side', texts: '.draw-round-title' }

// Révélation : taille de départ du mot selon son mot le plus long (4,5 rem jusqu'à 6 lettres), puis
// réduite par mesure (--word-scale) tant qu'un mot est coupé ou que la colonne déborde. Passage à la ligne
// entre deux mots seulement (« château de sable »), jamais au milieu d'un mot.
const WORD_MAX_REM = 4.5
const WORD_FULL_LETTERS = 6
const WORD_FIT = { variables: ['--word-scale'], boxes: '.draw-reveal-word', texts: '.draw-reveal-word', includeRoot: true }

function wordBaseStyle(word: string): CSSProperties {
  const longest = Math.max(1, ...word.split(/s+/).map((part) => [...part].length))
  const rem = Math.min(WORD_MAX_REM, (WORD_MAX_REM * WORD_FULL_LETTERS) / longest)
  return { '--word-base': `${rem.toFixed(2)}rem` } as CSSProperties
}

// Dessine-moi, manche en cours : le dessin en grand (l'essentiel de l'écran), qui dessine, l'indice
// (catégorie et nombre de lettres, décision D5), le temps restant, puis qui a trouvé : le dernier en
// bandeau, et combien ont trouvé. Jamais le mot, jamais les essais.
export function DrawRoundScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const turn = session.drawTurn
  const drawer = turn ? session.players[turn.drawer] : undefined
  const drawerName = drawer?.name ?? ''
  const progress = drawFoundProgress(session)
  const latest = progress.latest ? session.players[progress.latest] : undefined
  const sideRef = useFitScale(`${drawerName}|${turn?.category ?? ''}|${session.settings.teams}`, SIDE_FIT)
  return (
    <main className="screen draw-round">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} isRound />
      <div className="draw-round-body">
        <LiveDrawing key={turn?.round ?? -1} drawing={session.drawing} className="draw-round-canvas" />
        <aside ref={sideRef} className="draw-round-side">
          <h1 className="hero-title draw-round-title">{strings.draw.drawing(drawerName)}</h1>
          {turn && <p className="draw-round-hint">{strings.draw.hint(turn.category, turn.wordLength)}</p>}
          {session.settings.teams && drawer?.team && (
            <p className="draw-round-team">{strings.draw.teamGuesses(strings.teams.names[drawer.team])}</p>
          )}
          <Countdown phaseStartedAt={session.phaseStartedAt} phaseEndsAt={session.phaseEndsAt} />
          <div className="draw-found">
            {latest ? (
              <p key={progress.latest} className="draw-found-banner">
                {strings.draw.found(latest.name)}
              </p>
            ) : (
              <p className="draw-found-banner is-empty" aria-hidden="true" />
            )}
            {progress.guessers.length > 0 && (
              <p className="draw-found-count">{strings.draw.foundCount(progress.found.length, progress.guessers.length)}</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}

// Dessine-moi, révélation : le dessin final à gauche, le mot et son dessinateur à droite (ou « Manche
// annulée »), puis le classement.
export function DrawRevealScreen({ session, roomCode }: { session: PublicSession; roomCode: string }) {
  const turn = session.drawTurn
  const drawerName = turn ? (session.players[turn.drawer]?.name ?? null) : null
  const countdown = nextQuestionCountdown(session)
  const word = session.reveal?.correctAnswer ?? ''
  const isCancelled = session.reveal?.stats.drawCancelled === true
  const sideRef = useFitScale(word, WORD_FIT)
  return (
    <main className="screen draw-round">
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} isRound />
      <div className="draw-round-body">
        <LiveDrawing key={turn?.round ?? -1} drawing={session.drawing} className="draw-reveal-canvas" />
        <aside ref={sideRef} className="draw-round-side draw-reveal-side">
          <TransitionSteps active={0} withRanking={hasRankingStep(session)} isLastQuestion={isLastQuestion(session)} isRound />
          <p className="draw-round-hint">{strings.draw.itWas}</p>
          <h1 className="draw-reveal-word" style={wordBaseStyle(word)}>
            {word}
          </h1>
          {drawerName && <p className="draw-reveal-by">{strings.draw.drawnBy(drawerName)}</p>}
          {isCancelled && <p className="draw-reveal-cancelled">{strings.draw.cancelled}</p>}
          {countdown && <NextQuestionLine countdown={countdown} isRound />}
          {isAwaitingHost(session) && <p className="awaiting-host">{strings.awaitingHost}</p>}
        </aside>
      </div>
    </main>
  )
}
