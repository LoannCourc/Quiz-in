import { bluffRevealTimeline } from '@shared/bluff'
import { BLUFF_REVEAL_WINDOW, bluffRevealLayout } from '@shared/bluffLayout'
import { BLUFF_TRAP_POINTS, BLUFF_TRUTH_POINTS } from '@shared/constants'
import { isAwaitingHost, nextQuestionCountdown } from '@shared/gameFlow'
import type { PublicSession, RevealedBluffChoice } from '@shared/types'

import { BluffRevealRows, type RevealRow } from '../components/BluffChoices'
import { Confetti } from '../components/Confetti'
import { GameHeader } from '../components/GameHeader'
import { NextQuestionLine, TransitionSteps } from '../components/TransitionInfo'
import { useElapsedMs } from '../hooks/useElapsedMs'
import { strings } from '../strings'
import './BluffRevealScreen.css'

interface BluffRevealScreenProps {
  session: PublicSession
  roomCode: string
  choices: RevealedBluffChoice[]
}

// Résumé des points : qui a trouvé la vraie réponse, et qui a piégé combien de joueurs.
function pointsSummary(session: PublicSession, choices: RevealedBluffChoice[]): string {
  const { bluff } = strings
  const nameOf = (id: string) => session.players[id]?.name ?? '?'
  const results = session.reveal?.results ?? {}
  const finders = Object.keys(results).filter((id) => results[id].correct).map(nameOf)
  const parts = [finders.length > 0 ? bluff.finders(bluff.names(finders), BLUFF_TRUTH_POINTS) : bluff.nobodyFound]
  for (const choice of choices) {
    const trapped = choice.voters?.length ?? 0
    if (choice.kind !== 'bluff' || trapped === 0) continue
    for (const author of choice.authors ?? []) parts.push(bluff.trapper(nameOf(author), trapped * BLUFF_TRAP_POINTS, trapped))
  }
  return parts.join(' · ')
}

// Étape 2 : tout tient à l'écran, ou la vraie réponse puis les choix votés, les plus votés d'abord.
function truthStepRows(truthRows: RevealRow[], falseRows: RevealRow[]): RevealRow[] {
  const all = [...truthRows, ...falseRows]
  if (all.length <= BLUFF_REVEAL_WINDOW) return all
  const voted = falseRows
    .filter(({ choice }) => (choice.voters?.length ?? 0) > 0)
    .sort((a, b) => (b.choice.voters?.length ?? 0) - (a.choice.voters?.length ?? 0))
  return [...truthRows, ...voted].slice(0, BLUFF_REVEAL_WINDOW - 1)
}

// Révélation du Bluff (maquette B5). Étape 1 : les fausses propositions se retournent l'une après l'autre
// (BLUFF_REVEAL_PER_CHOICE_S chacune), avec leur auteur ou « Leurre » et leurs votants. Étape 2 : la
// vraie réponse en tête, en vert, puis les autres, et le résumé des points. La durée de la phase suit ce
// déroulé (revealDurationS) ; en Pas à pas, l'écran reste sur l'étape 2.
// Beaucoup de choix : au plus BLUFF_REVEAL_WINDOW à l'écran. Étape 1 : les derniers retournés (les plus
// anciens laissent la place). Étape 2 : la vraie réponse, puis les choix qui ont reçu des votes, les plus
// votés d'abord, et le nombre de ceux qui n'en ont reçu aucun.
export function BluffRevealScreen({ session, roomCode, choices }: BluffRevealScreenProps) {
  const elapsedMs = useElapsedMs(session.phaseStartedAt)
  const indexed: RevealRow[] = choices.map((choice, index) => ({ index, choice }))
  const falseRows = indexed.filter(({ choice }) => choice.kind !== 'truth')
  const truthRows = indexed.filter(({ choice }) => choice.kind === 'truth')
  // Même calendrier que les sons de la TV (cartes retournées, vraie réponse).
  const timeline = bluffRevealTimeline(choices)
  const isTruthShown = elapsedMs >= timeline.truthAtMs
  const revealedCount = timeline.flips.filter((flip) => flip.atMs <= elapsedMs).length
  const layout = bluffRevealLayout(choices.map((choice) => choice.text))
  const rows = isTruthShown ? truthStepRows(truthRows, falseRows) : falseRows.slice(0, revealedCount).slice(-(BLUFF_REVEAL_WINDOW - 1))
  const hiddenCount = isTruthShown ? truthRows.length + falseRows.length - rows.length : 0
  const countdown = nextQuestionCountdown(session)

  return (
    <main className={['screen bluff-reveal', isTruthShown && 'is-truth-shown', layout.crowded && 'is-crowded'].filter(Boolean).join(' ')}>
      {isTruthShown && <Confetti />}
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      <TransitionSteps active={0} withRanking={!session.settings.suspense} />
      <h1 className="hero-title bluff-reveal-title">{isTruthShown ? strings.bluff.truthTitle : strings.bluff.revealTitle}</h1>
      <div className="bluff-reveal-body">
        <BluffRevealRows rows={rows} layout={layout} players={session.players} />
        {!isTruthShown && <p className="bluff-suspense">{strings.bluff.suspense}</p>}
        {hiddenCount > 0 && <p className="bluff-hidden">{strings.bluff.otherChoices(hiddenCount)}</p>}
      </div>
      {isTruthShown ? <p className="bluff-summary">{pointsSummary(session, choices)}</p> : <span />}
      {countdown && <NextQuestionLine countdown={countdown} />}
      {isAwaitingHost(session) && <p className="awaiting-host">{strings.awaitingHost}</p>}
    </main>
  )
}
