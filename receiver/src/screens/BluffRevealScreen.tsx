import { bluffRevealTimeline, bluffTrappers } from '@shared/bluff'
import type { CSSProperties } from 'react'
import { BLUFF_REVEAL_WINDOW, bluffRevealLayout } from '@shared/bluffLayout'
import { nextQuestionCountdown } from '@shared/gameFlow'
import { voteShares } from '@shared/revealGauge'
import type { Player, PlayerId, PublicSession, RevealedBluffChoice } from '@shared/types'

import { AnswerExplanation, AnswerPills, type AnswerPill } from '../components/AnswerPills'
import { BluffRevealRows, type RevealRow } from '../components/BluffChoices'
import { Confetti } from '../components/Confetti'
import { GameHeader } from '../components/GameHeader'
import { HostWaitBanner } from '../components/HostWaitBanner'
import { NextQuestionLine } from '../components/TransitionInfo'
import { useFitScale } from '../hooks/useFitScale'
import { useTimelineStep } from '../hooks/useTimelineStep'
import { ANSWER_FIT, answerSizeClass, bluffLetter } from '../lib/answerLayout'
import { strings } from '../strings'
import './BluffRevealScreen.css'

// Durée normale de l'entrée d'une carte (BluffChoices.css).
const BLUFF_ROW_IN_MS = 450

interface BluffRevealScreenProps {
  session: PublicSession
  roomCode: string
  choices: RevealedBluffChoice[]
}

// Étape 2 : tout tient à l'écran, ou la vraie réponse et les choix les plus votés ; toujours dans l'ordre des
// lettres, comme au vote, pour ne pas perdre ses repères.
function truthStepRows(rows: RevealRow[]): RevealRow[] {
  if (rows.length <= BLUFF_REVEAL_WINDOW) return rows
  const truth = rows.filter(({ choice }) => choice.kind === 'truth')
  const voted = rows
    .filter(({ choice }) => choice.kind !== 'truth' && (choice.voters?.length ?? 0) > 0)
    .sort((a, b) => (b.choice.voters?.length ?? 0) - (a.choice.voters?.length ?? 0))
  return [...truth, ...voted].slice(0, BLUFF_REVEAL_WINDOW - 1).sort((a, b) => a.index - b.index)
}

function choiceLabel(choice: RevealedBluffChoice, players: Record<PlayerId, Player>): string {
  if (choice.kind === 'truth') return strings.bluff.truthLabel
  if (choice.kind === 'decoy') return strings.bluff.decoyTag
  const names = (choice.authors ?? []).map((id) => players[id]?.name).filter((name) => name !== undefined)
  return strings.bluff.bluffOf(strings.bluff.names(names))
}

// Encadré du bas : qui a piégé combien, puis l'explication.
function trapSentence(choices: RevealedBluffChoice[], players: Record<PlayerId, Player>, explanation: string | undefined): string {
  const entries = bluffTrappers(choices).flatMap(({ id, trapped }) => (players[id] ? [{ name: players[id].name, trapped }] : []))
  return [strings.bluff.trapSummary(entries), explanation?.trim()].filter(Boolean).join(' ')
}

// Révélation du Bluff. Étape 1 (maquette B5, inchangée) : les fausses propositions se retournent l'une après
// l'autre (toutes les 2 s jusqu'à 6, toutes les 0,4 s à partir de 12 : bluffRevealStepMs), avec leur auteur ou
// « Leurre » et leurs votants. Étape 2 : « La bonne réponse », même grille que les autres jeux, avec l'auteur de
// chaque bluff et ses votes (les points sont sur les téléphones, puis au classement). La durée de la phase suit ce
// déroulé (revealDurationS) ; en Pas à pas, l'écran reste sur l'étape 2. Beaucoup de choix : au plus
// BLUFF_REVEAL_WINDOW à l'écran. Étape 1 : les derniers retournés. Étape 2 : la vraie réponse et les plus votés,
// puis le nombre de ceux qui n'ont reçu aucun vote.
export function BluffRevealScreen({ session, roomCode, choices }: BluffRevealScreenProps) {
  const indexed: RevealRow[] = choices.map((choice, index) => ({ index, choice }))
  const falseRows = indexed.filter(({ choice }) => choice.kind !== 'truth')
  // Même calendrier que les sons de la TV (cartes retournées, vraie réponse).
  const timeline = bluffRevealTimeline(choices)
  // Instants des cartes, puis de la vraie réponse : l'écran change exactement à chacun.
  const step = useTimelineStep(session.phaseStartedAt, [...timeline.flips.map((flip) => flip.atMs), timeline.truthAtMs])
  const isTruthShown = step > timeline.flips.length
  const explanation = trapSentence(choices, session.players, session.reveal?.explanation)
  const bodyRef = useFitScale(`${isTruthShown}|${choices.map((choice) => choice.text).join('|')}|${explanation}`, ANSWER_FIT)
  const countdown = nextQuestionCountdown(session)
  const countdownLine = countdown && (
    <div className="screen-bottom-line">
      <NextQuestionLine countdown={countdown} />
    </div>
  )
  const header = <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} progressKind="bluff" />

  if (isTruthShown) {
    const rows = truthStepRows(indexed)
    const hiddenCount = indexed.length - rows.length
    const shares = voteShares(choices.map((choice) => choice.voters?.length ?? 0))
    const pills: AnswerPill[] = rows.map(({ index, choice }) => ({
      key: String(index),
      letter: bluffLetter(index),
      isCorrect: choice.kind === 'truth',
      count: choice.voters?.length ?? 0,
      share: shares[index],
      label: choiceLabel(choice, session.players),
      text: choice.text,
    }))
    return (
      <main className="screen answer-screen" ref={bodyRef}>
        <Confetti />
        {header}
        <h1 className="hero-title answer-title">{strings.reveal.title}</h1>
        <div className="answer-body">
          <AnswerPills pills={pills} sizeClass={answerSizeClass(choices.map((choice) => choice.text))} />
          {hiddenCount > 0 && <p className="bluff-hidden">{strings.bluff.otherChoices(hiddenCount)}</p>}
          <AnswerExplanation text={explanation} />
        </div>
        {countdownLine}
        <HostWaitBanner session={session} waitStartedAt={session.phaseStartedAt + timeline.truthAtMs} />
      </main>
    )
  }

  const layout = bluffRevealLayout(choices.map((choice) => choice.text))
  const revealedCount = Math.min(step, timeline.flips.length)
  const rows = falseRows.slice(0, revealedCount).slice(-(BLUFF_REVEAL_WINDOW - 1))
  return (
    <main
      className={['screen bluff-reveal', layout.crowded && 'is-crowded'].filter(Boolean).join(' ')}
      // Cartes rapides : l'entrée d'une carte ne dure pas plus que l'intervalle entre deux cartes.
      style={{ '--bluff-row-in-ms': `${Math.min(BLUFF_ROW_IN_MS, timeline.stepMs)}ms` } as CSSProperties}
    >
      {header}
      <h1 className="hero-title bluff-reveal-title">{strings.bluff.revealTitle}</h1>
      <div className="bluff-reveal-body">
        <BluffRevealRows rows={rows} layout={layout} players={session.players} />
        <p className="bluff-suspense">{strings.bluff.suspense}</p>
      </div>
      {countdownLine}
    </main>
  )
}
