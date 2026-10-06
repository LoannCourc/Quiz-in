import { voteProgress, type VoteProgress } from '@shared/bluff'
import { bluffChoicesLayout } from '@shared/bluffLayout'
import type { PublicSession } from '@shared/types'

import { AudioStatus } from '../components/AudioStatus'
import { Avatar } from '../components/Avatar'
import { BluffVoteChoices } from '../components/BluffChoices'
import { Countdown } from '../components/Countdown'
import { GameHeader } from '../components/GameHeader'
import { useFitScale } from '../hooks/useFitScale'
import { TeamAvatarGroups } from '../components/TeamBoards'
import { optionsSizeClass } from '../lib/optionsSize'
import { isTightQuestion, MANY_PLAYERS_MIN, questionSizeClass } from '../lib/questionSize'
import { answeredByCount, countConnected, countConnectedAnswered, hasAnswered, sortForGame } from '../lib/players'
import { strings } from '../strings'
import './QuestionScreen.css'

// Échelles réduites dans l'ordre : la barre des joueurs (--bar-scale), puis le texte de la consigne ou des
// propositions du vote (--text-scale). L'écran entier, le cadre de la consigne et la liste des propositions
// ne doivent jamais déborder.
const FIT_OPTIONS = { variables: ['--bar-scale', '--text-scale'], boxes: '.free-prompt, .bluff-choices', includeRoot: true }

interface QuestionScreenProps {
  session: PublicSession
  roomCode: string
  // Contrôle : même écran pendant la validation par l'hôte, sans chrono ni avatars.
  isValidation?: boolean
}

export function QuestionScreen({ session, roomCode, isValidation = false }: QuestionScreenProps) {
  const question = session.currentQuestion
  // Tout tient à l'écran : la barre des joueurs rétrécit d'abord, puis la consigne ou les propositions.
  const fitKey = `${session.status}|${question?.text}|${question?.choices?.join('|')}|${Object.keys(session.players).length}|${session.settings.teams}`
  const screenRef = useFitScale(fitKey, FIT_OPTIONS)
  if (!question) return null

  const players = sortForGame(session)
  const connectedCount = countConnected(players)
  const answeredCount = countConnectedAnswered(session, players)
  // Bluff (maquette B4) : écriture des fausses réponses, puis vote parmi les choix publiés.
  const isBluff = session.settings.answerMode === 'bluff'
  const isVote = isBluff && session.status === 'vote'
  // Beaucoup de choix (petit texte) : question plus basse, sans consigne, pour leur laisser la place.
  const voteLayout = bluffChoicesLayout(question.choices ?? [])
  const isCrowded = isVote && voteLayout.crowded
  // Vote sans minuteur : « X/Y ont voté » à la place de l'anneau (attendus : connectés et votants).
  const votes = isVote ? voteProgress(session) : null
  const answeredLabel = isBluff
      ? strings.bluff.writtenCount(answeredCount, connectedCount)
      : strings.question.answeredCount(answeredCount, connectedCount)
  const questionCard = (
    <h1 className={['question-card', isVote ? 'is-compact' : questionSizeClass(question.text)].filter(Boolean).join(' ')}>{question.text}</h1>
  )
  // Énoncé long ou beaucoup de joueurs : marges et cadre réduits, pour que la barre des joueurs tienne.
  const screenClass = isVote
    ? `screen question question-vote${isCrowded ? ' is-crowded' : ''}`
    : `screen question${isTightQuestion(question.text, players.length) ? ' is-tight' : ''}${question.options ? '' : ' has-prompt'}`

  return (
    <main className={screenClass} ref={screenRef}>
      <GameHeader
        roomCode={roomCode}
        questionIndex={session.currentIndex}
        questionCount={session.questionCount}
        difficulty={question.difficulty}
      />

      <section className="question-main">
        {votes ? (
          <VoteCount progress={votes} />
        ) : (
          !isValidation && <Countdown phaseStartedAt={session.phaseStartedAt} phaseEndsAt={session.phaseEndsAt} />
        )}
        {question.audio ? (
          // Blind test : seul l'indicateur d'écoute s'ajoute, jamais le titre ni la pochette.
          <div className="question-card-column">
            {questionCard}
            <AudioStatus />
          </div>
        ) : (
          questionCard
        )}
      </section>

      {isVote ? (
        <>
          <p className="bluff-hint">{strings.bluff.voteHint}</p>
          <BluffVoteChoices choices={question.choices ?? []} layout={voteLayout} />
        </>
      ) : isBluff ? (
        // Écriture : rien des propositions des joueurs n'apparaît avant le vote.
        <div className="question-options free-prompt">
          <p className="free-prompt-text">{strings.bluff.writeHint}</p>
        </div>
      ) : isValidation ? (
        <div className="question-options free-prompt validation-prompt">
          <p className="free-prompt-text">{strings.validation.title}</p>
          <p className="validation-received">{strings.validation.received(answeredByCount(session))}</p>
        </div>
      ) : question.options ? (
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
      {!isValidation && (
        <footer className="question-answered">
          {/* Vote : le compte est déjà à la place du minuteur. */}
          {!votes && (
            <span className="question-answered-count">
              {connectedCount > 0 ? answeredLabel : strings.question.noConnectedPlayers}
            </span>
          )}
          {votes ? (
            // Vote : une fine barre de progression suffit (le compte est en haut), la place va aux propositions.
            <VoteProgressBar progress={votes} />
          ) : session.settings.teams ? (
            // Groupe : avatars regroupés par équipe (maquette G2).
            <TeamAvatarGroups session={session} players={players} />
          ) : (
            <div className={players.length >= MANY_PLAYERS_MIN ? 'question-avatars is-many' : 'question-avatars'}>
              {players.map((player) => (
                <Avatar
                  key={player.id}
                  player={player}
                  state={hasAnswered(session, player.id) ? 'lit' : 'dimmed'}
                  showName={false}
                />
              ))}
            </div>
          )}
        </footer>
      )}
    </main>
  )
}

// Bluff, vote sans minuteur : combien ont voté, à la place de l'anneau du chrono.
function VoteCount({ progress }: { progress: VoteProgress }) {
  return (
    <div className="vote-count">
      <span className="vote-count-number">{strings.bluff.voteCountNumber(progress.voted, progress.expected)}</span>
      <span className="vote-count-label">{strings.bluff.voteCountLabel}</span>
    </div>
  )
}

// Bluff, vote : progression des votes en une fine barre, à la place des avatars.
function VoteProgressBar({ progress }: { progress: VoteProgress }) {
  const share = progress.expected > 0 ? progress.voted / progress.expected : 0
  return (
    <div className="vote-progress" role="progressbar" aria-valuenow={progress.voted} aria-valuemax={progress.expected}>
      <span className="vote-progress-fill" style={{ transform: `scaleX(${share})` }} />
    </div>
  )
}
