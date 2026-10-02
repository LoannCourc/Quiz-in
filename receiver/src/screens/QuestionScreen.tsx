import { QUESTIONS_PER_GAME } from '@shared/constants'
import type { PublicSession } from '@shared/types'

import { Avatar } from '../components/Avatar'
import { Countdown } from '../components/Countdown'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { countConnected, countConnectedAnswered, hasAnswered, sortByRank } from '../lib/players'
import { strings } from '../strings'
import './QuestionScreen.css'

export function QuestionScreen({ session }: { session: PublicSession }) {
  const question = session.currentQuestion
  if (!question) return null

  const players = sortByRank(session.players)
  const connectedCount = countConnected(players)
  const answeredCount = countConnectedAnswered(session, players)

  return (
    <main className="screen question">
      <header className="question-header">
        <span className="question-progress">
          {strings.question.progress(session.currentIndex + 1, QUESTIONS_PER_GAME)}
        </span>
        <DifficultyBadge difficulty={question.difficulty} />
      </header>

      <h1 className="question-text">{question.text}</h1>

      {question.options ? (
        <ol className="question-options">
          {question.options.map((option, index) => (
            <li key={option} className={`choice choice-${index}`}>
              <span className="choice-letter">{strings.choiceLetters[index]}</span>
              <span className="choice-text">{option}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="question-free-hint">{strings.question.freeAnswerHint}</p>
      )}

      <footer className="question-footer">
        {/* Indicateur discret : on montre qui a répondu, jamais ce qu'il a répondu. */}
        <div className="question-answered">
          <div className="question-avatars">
            {players.map((player) => (
              <Avatar
                key={player.id}
                player={player}
                state={hasAnswered(session, player.id) ? 'lit' : 'dimmed'}
                showName={false}
              />
            ))}
          </div>
          <span className="question-answered-count">
            {connectedCount > 0
              ? strings.question.answeredCount(answeredCount, connectedCount)
              : strings.question.noConnectedPlayers}
          </span>
        </div>
        <Countdown
          key={session.phaseStartedAt}
          phaseStartedAt={session.phaseStartedAt}
          phaseEndsAt={session.phaseEndsAt}
        />
      </footer>
    </main>
  )
}
