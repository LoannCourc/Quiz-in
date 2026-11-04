import { nextQuestionCountdown } from '@shared/gameFlow'
import { voteShares } from '@shared/revealGauge'
import { trackOptionParts } from '@shared/trackOption'
import type { AnswerVerdict, ChoiceOptions, FreeAnswerGroup, PublicSession } from '@shared/types'

import { AnswerExplanation, AnswerPills, type AnswerPill } from '../components/AnswerPills'
import { Confetti } from '../components/Confetti'
import { TrackOptionText } from '../components/TrackOptionText'
import { GameHeader } from '../components/GameHeader'
import { HostWaitBanner } from '../components/HostWaitBanner'
import { NextQuestionLine } from '../components/TransitionInfo'
import { useFitScale } from '../hooks/useFitScale'
import { ANSWER_FIT, answerSizeClass, progressKindOf } from '../lib/answerLayout'
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
  const fitKey = `${question?.options?.join('|')}|${reveal?.explanation}`
  const bodyRef = useFitScale(fitKey, ANSWER_FIT)
  if (!question || !reveal) return null
  // Bluff : révélation en deux étapes (fausses propositions, puis la vraie réponse).
  if (reveal.stats.bluffChoices) return <BluffRevealScreen session={session} roomCode={roomCode} choices={reveal.stats.bluffChoices} />
  const countdown = nextQuestionCountdown(session)
  const hasChoices = question.options !== undefined && reveal.stats.choiceCounts !== undefined
  // Blind test : mention obligatoire de la source des extraits.
  const credit = reveal.music && <p className="reveal-credit">{strings.blindTest.credits[reveal.music.source]}</p>

  return (
    <main className={hasChoices ? 'screen answer-screen' : 'screen reveal'} ref={hasChoices ? bodyRef : undefined}>
      <Confetti />
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} progressKind={progressKindOf(session)} qrLabel="rejoin" />
      {question.options && reveal.stats.choiceCounts ? (
        <>
          <h1 className="hero-title answer-title">{strings.reveal.title}</h1>
          <div className="answer-body">
            <ChoiceResults options={question.options} counts={reveal.stats.choiceCounts} correctAnswer={reveal.correctAnswer} />
            <AnswerExplanation text={reveal.explanation} />
            {credit}
          </div>
        </>
      ) : (
        <>
          {/* Maquette T2 : l'énoncé en rappel discret (pas de grand titre). */}
          <p className="reveal-free-question">{question.text}</p>
          <FreeResults correctAnswer={reveal.correctAnswer} groups={reveal.stats.freeAnswers ?? []} />
          <div className="reveal-explanation-slot">
            {reveal.explanation && <p className="reveal-explanation">{reveal.explanation}</p>}
            {credit}
          </div>
        </>
      )}
      {countdown && (
        <div className="screen-bottom-line">
          <NextQuestionLine countdown={countdown} />
        </div>
      )}
      <HostWaitBanner session={session} />
    </main>
  )
}

interface ChoiceResultsProps {
  options: ChoiceOptions
  counts: number[]
  correctAnswer: string
}

// Les 4 pastilles, aux mêmes places qu'à la question : la bonne réponse en cyan, et pour chacune le nombre de
// joueurs qui l'ont choisie et sa jauge. La lettre et le contour accompagnent toujours la couleur.
function ChoiceResults({ options, counts, correctAnswer }: ChoiceResultsProps) {
  const shares = voteShares(options.map((_, index) => counts[index] ?? 0))
  const pills: AnswerPill[] = options.map((option, index) => ({
    key: option,
    letter: strings.choiceLetters[index],
    isCorrect: option === correctAnswer,
    count: counts[index] ?? 0,
    share: shares[index],
    text: <TrackOptionText option={option} />,
  }))
  const isTracks = options.some((option) => trackOptionParts(option).artist !== null)
  return <AnswerPills pills={pills} sizeClass={[answerSizeClass(options.map((option) => trackOptionParts(option).title)), isTracks && 'is-tracks'].filter(Boolean).join(' ')} />
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
        <p className={`free-correct-text ${optionsSizeClass([correctAnswer])}`}>
          <TrackOptionText option={correctAnswer} className="free-correct-title" />
        </p>
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
