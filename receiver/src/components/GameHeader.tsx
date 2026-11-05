import type { Difficulty } from '@shared/types'
import { QRCodeSVG } from 'qrcode.react'

import { JOIN_URL_BASE } from '../config'
import type { ProgressKind } from '../lib/answerLayout'
import { strings } from '../strings'
import { DifficultyBadge } from './DifficultyBadge'
import { Logo } from './Logo'
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
}

// En-tête de tous les écrans de partie (maquette TV) : logo, question en cours, QR code. Même bloc et même
// place partout : aucun saut d'un écran à l'autre. Le QR code ne sert qu'à revenir : un nouveau joueur ne peut
// plus rejoindre après le lancement.
export function GameHeader({ roomCode, questionIndex, questionCount, difficulty, progressKind = 'question' }: GameHeaderProps) {
  return (
    <header className="game-header">
      <Logo size="small" />
      <div className="game-header-progress">
        {questionIndex !== undefined && <span className="game-header-question">{PROGRESS_TEXTS[progressKind](questionIndex + 1, questionCount)}</span>}
        {difficulty !== undefined && <DifficultyBadge difficulty={difficulty} />}
      </div>
      <span className="game-header-rejoin">{strings.header.rejoin}</span>
      <span className="game-header-qr">
        <QRCodeSVG value={`${JOIN_URL_BASE}${roomCode}`} size={256} level="M" marginSize={1} />
      </span>
    </header>
  )
}
