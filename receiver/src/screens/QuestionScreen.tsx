import type { PublicSession } from '@shared/types'

import { AudioStatus } from '../components/AudioStatus'
import { Avatar } from '../components/Avatar'
import { Countdown } from '../components/Countdown'
import { GameHeader } from '../components/GameHeader'
import { optionsSizeClass } from '../lib/optionsSize'
import { countConnected, countConnectedAnswered, hasAnswered, sortForGame } from '../lib/players'
import { strings } from '../strings'
import './QuestionScreen.css'

interface QuestionScreenProps {
  session: PublicSession
  roomCode: string
}

export function QuestionScreen({ session, roomCode }: QuestionScreenProps) {
  const question = session.currentQuestion
  if (!question) return null

  const players = sortForGame(session)
  const connectedCount = countConnected(players)
  const answeredCount = countConnectedAnswered(session, players)

  return (
    <main className="screen question">
      <GameHeader
        roomCode={roomCode}
        questionIndex={session.currentIndex}
        questionCount={session.questionCount}
        difficulty={question.difficulty}
      />

      <section className="question-main">
        <Countdown phaseStartedAt={session.phaseStartedAt} phaseEndsAt={session.phaseEndsAt} />
        {question.audio ? (
          // Blind test : seul l'indicateur d'écoute s'ajoute, jamais le titre ni la pochette.
          <div className="question-card-column">
            <h1 className="question-card">{question.text}</h1>
            <AudioStatus />
          </div>
        ) : (
          <h1 className="question-card">{question.text}</h1>
        )}
      </section>

      {question.options ? (
        <ol className={`question-options ${optionsSizeClass(question.options)}`}>
          {question.options.map((option, index) => (
            <li key={option} className={`choice choice-${index}`}>
              <span className="choice-letter">{strings.choiceLetters[index]}</span>
              <span className="choice-text">{option}</span>
            </li>
          ))}
        </ol>
      ) : (
        // Réponse libre : un grand cadre à la place des propositions, jamais le texte d'un joueur.
        <div className="question-options free-prompt">
          <p className="free-prompt-text">{strings.question.freeAnswerHint[question.ask ?? 'answer']}</p>
        </div>
      )}

      {/* Indicateur discret : on montre qui a répondu, jamais ce qu'il a répondu. */}
      <footer className="question-answered">
        <span className="question-answered-count">
          {connectedCount > 0
            ? strings.question.answeredCount(answeredCount, connectedCount)
            : strings.question.noConnectedPlayers}
        </span>
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
      </footer>
    </main>
  )
}
