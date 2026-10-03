import type { ChoiceOptions, PublicSession } from '@shared/types'

import { Confetti } from '../components/Confetti'
import { GameHeader } from '../components/GameHeader'
import { strings } from '../strings'
import './RevealScreen.css'

interface RevealScreenProps {
  session: PublicSession
  roomCode: string
}

export function RevealScreen({ session, roomCode }: RevealScreenProps) {
  const { currentQuestion: question, reveal } = session
  if (!question || !reveal) return null

  return (
    <main className="screen reveal">
      <Confetti />
      <GameHeader roomCode={roomCode} questionIndex={session.currentIndex} questionCount={session.questionCount} />
      <h1 className="hero-title reveal-title">{strings.reveal.title}</h1>

      {question.options && reveal.stats.choiceCounts ? (
        <ChoiceResults
          options={question.options}
          counts={reveal.stats.choiceCounts}
          correctAnswer={reveal.correctAnswer}
        />
      ) : (
        <FreeAnswers session={session} />
      )}

      {reveal.explanation && <p className="reveal-explanation">{reveal.explanation}</p>}
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
    <ol className="question-options reveal-options">
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

function FreeAnswers({ session }: { session: PublicSession }) {
  const entries = session.reveal?.stats.freeAnswers ?? []
  const results = session.reveal?.results ?? {}

  if (entries.length === 0) {
    return <p className="reveal-empty">{strings.reveal.noAnswer}</p>
  }

  return (
    <ul className="reveal-free">
      {entries.map((entry) => {
        const player = session.players[entry.playerId]
        const isCorrect = results[entry.playerId]?.correct === true
        return (
          <li key={entry.playerId} className={isCorrect ? 'free-answer is-correct' : 'free-answer'}>
            <span className="free-answer-avatar">{player?.avatar}</span>
            <span className="free-answer-value">{entry.value}</span>
            <span className="free-answer-mark">{isCorrect ? '✓' : '✗'}</span>
          </li>
        )
      })}
    </ul>
  )
}
