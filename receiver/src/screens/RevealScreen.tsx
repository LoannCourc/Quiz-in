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
  const steps = <TransitionSteps active={0} withRanking={hasRankingStep(session)} isLastQuestion={isLastQuestion(session)} />

  return (
    <main className={isCompact ? "screen reveal reveal-compact" : "screen reveal"}>
      <Confetti />
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      {question.options && reveal.stats.choiceCounts ? (
        <>
          {steps}
          <h1 className="hero-title reveal-title">{strings.reveal.title}</h1>
          <ChoiceResults
            options={question.options}
            counts={reveal.stats.choiceCounts}
            correctAnswer={reveal.correctAnswer}
          />
        </>
      ) : (
        <>
          {/* Maquette T2 : l'étape à gauche, l'énoncé en rappel discret à droite (pas de grand titre). */}
          <div className="reveal-free-top">
            {steps}
            <p className="reveal-free-question">{question.text}</p>
          </div>
          <FreeResults correctAnswer={reveal.correctAnswer} groups={reveal.stats.freeAnswers ?? []} />
        </>
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

// Réponse libre (maquette T2) : à gauche, la carte cyan « LA BONNE RÉPONSE » ; à droite, « VOS RÉPONSES » :
// les réponses des joueurs regroupées (texte déjà filtré par l'hôte, FREE_ANSWER_GROUPS_MAX au plus), une
// barre par groupe, de longueur proportionnelle au nombre de joueurs, ce nombre à sa droite.
function FreeResults({ correctAnswer, groups }: { correctAnswer: string; groups: FreeAnswerGroup[] }) {
  const most = Math.max(1, ...groups.map((group) => group.playerIds.length))
  return (
    <div className="reveal-free">
      <div className="free-correct">
        <p className="free-correct-label">{strings.reveal.title}</p>
        <p className={`free-correct-text ${optionsSizeClass([correctAnswer])}`}>{correctAnswer}</p>
      </div>
      <div className="free-answers">
        <p className="free-answers-label">{strings.reveal.freeAnswersTitle}</p>
        {groups.length === 0 ? (
          <p className="reveal-empty">{strings.reveal.noAnswer}</p>
        ) : (
          <>
            <ol className="free-groups">
              {groups.map((group) => (
                <li key={group.playerIds.join()} className={`free-group is-${group.verdict}`}>
                  <span className="free-group-mark">
                    <VerdictMark verdict={group.verdict} />
                  </span>
                  <span className="free-group-track">
                    <span className="free-group-bar" style={{ width: barWidth(group, most) }}>
                      <span className="free-group-text">{group.value}</span>
                    </span>
                  </span>
                  <span className="free-group-count">{strings.reveal.choiceCount(group.playerIds.length)}</span>
                </li>
              ))}
            </ol>
            <p className="free-answers-note">{strings.reveal.maskedNote}</p>
          </>
        )}
      </div>
    </div>
  )
}

// Barre d'un groupe : longueur selon son nombre de joueurs (le plus grand groupe fait toute la piste), jamais
// plus courte que son texte (environ 0,62 em par caractère, plus les marges) ; la piste la plafonne.
function barWidth(group: FreeAnswerGroup, most: number): string {
  const share = (group.playerIds.length / most) * 100
  return `max(${share.toFixed(1)}%, calc(${[...group.value].length} * 0.62em + 1.8rem))`
}

// Coche et croix dessinées en CSS (les polices du design n'ont pas ces signes) ; ½ en texte.
function VerdictMark({ verdict }: { verdict: AnswerVerdict }) {
  if (verdict === 'partial') return <span className="mark-half">{strings.reveal.verdictMarks.partial}</span>
  return <span className={verdict === 'correct' ? 'mark-check' : 'mark-cross'} aria-label={strings.reveal.verdictMarks[verdict]} />
}
