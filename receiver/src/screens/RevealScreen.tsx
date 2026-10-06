import { hasRankingStep, isAwaitingHost, isLastQuestion, nextQuestionCountdown } from '@shared/gameFlow'
import type { AnswerVerdict, ChoiceOptions, FreeAnswerGroup, PublicSession } from '@shared/types'

import { Confetti } from '../components/Confetti'
import { GameHeader } from '../components/GameHeader'
import { NextQuestionLine, TransitionSteps } from '../components/TransitionInfo'
import { optionsSizeClass } from '../lib/optionsSize'
import { strings } from '../strings'
import { BluffRevealScreen } from './BluffRevealScreen'
import './RevealScreen.css'

interface RevealScreenProps {
  session: PublicSession
  roomCode: string
}

export function RevealScreen({ session, roomCode }: RevealScreenProps) {
  const { currentQuestion: question, reveal } = session
  if (!question || !reveal) return null
  // Bluff : révélation en deux étapes (fausses propositions, puis la vraie réponse).
  if (reveal.stats.bluffChoices) return <BluffRevealScreen session={session} roomCode={roomCode} choices={reveal.stats.bluffChoices} />
  const countdown = nextQuestionCountdown(session)
  // Propositions très longues : révélation compacte, pour que tout tienne (sans :has(), absent de Chrome 92).
  const isCompact = question.options !== undefined && optionsSizeClass(question.options) === "options-size-very-long"

  return (
    <main className={isCompact ? "screen reveal reveal-compact" : "screen reveal"}>
      <Confetti />
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      <TransitionSteps active={0} withRanking={hasRankingStep(session)} isLastQuestion={isLastQuestion(session)} />
      <h1 className="hero-title reveal-title">{strings.reveal.title}</h1>

      {question.options && reveal.stats.choiceCounts ? (
        <ChoiceResults
          options={question.options}
          counts={reveal.stats.choiceCounts}
          correctAnswer={reveal.correctAnswer}
        />
      ) : (
        <FreeResults correctAnswer={reveal.correctAnswer} groups={reveal.stats.freeAnswers ?? []} />
      )}

      <div className="reveal-explanation-slot">
        {reveal.explanation && <p className="reveal-explanation">{reveal.explanation}</p>}
        {/* Blind test : mention obligatoire de la source des extraits. */}
        {reveal.music && <p className="reveal-credit">{strings.blindTest.credits[reveal.music.source]}</p>}
      </div>
      {countdown && <NextQuestionLine countdown={countdown} />}
      {isAwaitingHost(session) && <p className="awaiting-host">{strings.awaitingHost}</p>}
    </main>
  )
}

interface ChoiceResultsProps {
  options: ChoiceOptions
  counts: number[]
  correctAnswer: string
}

// Les 4 pilules : la bonne réponse avec contour blanc, les autres éteintes ; chacune indique
// combien de joueurs l'ont choisie. La lettre accompagne toujours la couleur.
function ChoiceResults({ options, counts, correctAnswer }: ChoiceResultsProps) {
  return (
    <ol className={`question-options reveal-options ${optionsSizeClass(options)}`}>
      {options.map((option, index) => {
        const isCorrect = option === correctAnswer
        return (
          <li key={option} className={`choice choice-${index} ${isCorrect ? 'is-correct' : 'is-dimmed'}`}>
            <span className="choice-letter">{strings.choiceLetters[index]}</span>
            <span className="choice-text">{option}</span>
            <span className="reveal-count">{strings.reveal.choiceCount(counts[index] ?? 0)}</span>
          </li>
        )
      })}
    </ol>
  )
}

// Réponse libre : même zone que les quatre pilules. À gauche, la bonne réponse à la place de la
// proposition gagnante ; à droite, les réponses des joueurs regroupées (texte déjà filtré par l'hôte,
// FREE_ANSWER_GROUPS_MAX au plus), sur deux colonnes au-delà de quatre groupes.
function FreeResults({ correctAnswer, groups }: { correctAnswer: string; groups: FreeAnswerGroup[] }) {
  return (
    <div className={`question-options reveal-options reveal-free ${optionsSizeClass([correctAnswer])}`}>
      <div className="choice choice-1 is-correct free-correct">
        <span className="choice-letter">
          <VerdictMark verdict="correct" />
        </span>
        <span className="choice-text">{correctAnswer}</span>
      </div>
      {groups.length === 0 ? (
        <p className="reveal-empty">{strings.reveal.noAnswer}</p>
      ) : (
        <ol className={groups.length > 4 ? 'free-groups is-two-columns' : 'free-groups'} aria-label={strings.reveal.freeAnswersTitle}>
          {groups.map((group) => (
            <li key={group.playerIds.join()} className={`free-group is-${group.verdict}`}>
              <span className="free-group-mark">
                <VerdictMark verdict={group.verdict} />
              </span>
              <span className="free-group-text">{group.value}</span>
              <span className="reveal-count">{strings.reveal.choiceCount(group.playerIds.length)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// Coche et croix dessinées en CSS (les polices du design n'ont pas ces signes) ; ½ en texte.
function VerdictMark({ verdict }: { verdict: AnswerVerdict }) {
  if (verdict === 'partial') return <span className="mark-half">{strings.reveal.verdictMarks.partial}</span>
  return <span className={verdict === 'correct' ? 'mark-check' : 'mark-cross'} aria-label={strings.reveal.verdictMarks[verdict]} />
}
