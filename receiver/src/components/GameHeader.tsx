import type { Difficulty } from '@shared/types'
import { QRCodeSVG } from 'qrcode.react'

import { JOIN_URL_BASE, PLAYERS_SITE_HOST } from '../config'
import type { ProgressKind } from '../lib/answerLayout'
import { strings } from '../strings'
import { DifficultyBadge } from './DifficultyBadge'
import { Logo } from './Logo'
import { QuizNameLine } from './QuizNameLine'
import './GameHeader.css'

const PROGRESS_TEXTS = {
  question: strings.question.progress,
  blindTest: strings.question.blindTestProgress,
  bluff: strings.question.bluffProgress,
  round: strings.question.roundProgress,
} satisfies Record<ProgressKind, unknown>

interface GameHeaderProps {
  roomCode: string
  // Pastille rose « QUESTION n/N » (absente si index non fourni).
  questionIndex?: number
  questionCount?: number
  difficulty?: Difficulty
  progressKind?: ProgressKind
  // À côté du QR code : l'adresse et le code (question), le rappel seul (bonne réponse), ou rien (classement).
  qrLabel?: 'join' | 'rejoin' | 'none'
}

// En-tête des écrans de partie (maquette TV) : logo, question en cours, QR code. Il ne sert qu'à revenir : un
// nouveau joueur ne peut plus rejoindre après le lancement.
export function GameHeader({ roomCode, questionIndex, questionCount, difficulty, progressKind = 'question', qrLabel = 'join' }: GameHeaderProps) {
  return (
    <header className="game-header">
      <Logo size="small" />
      {/* Pastille et difficulté, puis le quiz joué en petit dessous : plus bas que le QR code, le bandeau ne
          grandit pas ; le quiz joué prend toute la place entre le logo et l'adresse. */}
      <div className="game-header-progress">
        <div className="game-header-badges">
          {questionIndex !== undefined && <span className="game-header-question">{PROGRESS_TEXTS[progressKind](questionIndex + 1, questionCount)}</span>}
          {difficulty !== undefined && <DifficultyBadge difficulty={difficulty} />}
        </div>
        <QuizNameLine place="header" />
      </div>
      {qrLabel === 'join' && (
        <span className="game-header-join">
          <span>
            {strings.header.joinAt(PLAYERS_SITE_HOST)} <strong className="game-header-code">{roomCode}</strong>
          </span>
          <span className="game-header-rejoin">{strings.header.rejoin}</span>
        </span>
      )}
      {qrLabel === 'rejoin' && (
        <span className="game-header-rejoin-short">
          {strings.header.rejoinShort.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      )}
      <span className="game-header-qr">
        <QRCodeSVG value={`${JOIN_URL_BASE}${roomCode}`} size={256} level="M" marginSize={1} />
      </span>
    </header>
  )
}
