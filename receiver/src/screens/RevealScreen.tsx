import type { ChoiceOptions, Session } from '@shared/types'

import { currentAnswers } from '../lib/players'
import { strings } from '../strings'
import './RevealScreen.css'

export function RevealScreen({ session }: { session: Session }) {
  const { currentQuestion: question, reveal } = session
  if (!question || !reveal) return null

  return (
    <main className="screen reveal">
      <p className="reveal-question">{question.text}</p>

      <section className="reveal-answer">
        <p className="reveal-label">{strings.reveal.title}</p>
        <p className="reveal-correct">{reveal.correctAnswer}</p>
      </section>

      {question.options && reveal.stats.choiceCounts ? (
        <ChoiceStats
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

interface ChoiceStatsProps {
  options: ChoiceOptions
  counts: number[]
  correctAnswer: string
}

function ChoiceStats({ options, counts, correctAnswer }: ChoiceStatsProps) {
  const maxCount = Math.max(1, ...counts)

  return (
    <ol className="reveal-stats">
      {options.map((option, index) => {
        const count = counts[index] ?? 0
        const isCorrect = option === correctAnswer
        return (
          <li key={option} className={isCorrect ? 'stat is-correct' : 'stat'}>
            <span className={`choice-letter choice-${index}`}>{strings.choiceLetters[index]}</span>
            <span className="stat-option">{option}</span>
            <span className="stat-bar">
              <span className="stat-bar-fill" style={{ transform: `scaleX(${count / maxCount})` }} />
            </span>
            <span className="stat-count">{count}</span>
          </li>
        )
      })}
    </ol>
  )
}

function FreeAnswers({ session }: { session: Session }) {
  const entries = session.reveal?.stats.freeAnswers ?? []
  const answers = currentAnswers(session)

  if (entries.length === 0) {
    return <p className="reveal-empty">{strings.reveal.noAnswer}</p>
  }

  return (
    <ul className="reveal-free">
      {entries.map((entry) => {
        const player = session.players[entry.playerId]
        const isCorrect = answers[entry.playerId]?.correct === true
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
