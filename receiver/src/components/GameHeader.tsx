import type { Difficulty } from '@shared/types'
import { QRCodeSVG } from 'qrcode.react'

import { JOIN_URL_BASE, PLAYERS_SITE_HOST } from '../config'
import { strings } from '../strings'
import { DifficultyBadge } from './DifficultyBadge'
import './GameHeader.css'

interface GameHeaderProps {
  roomCode: string
  // Pastille rose « QUESTION n/N » (absente si index non fourni).
  questionIndex?: number
  questionCount?: number
  difficulty?: Difficulty
  // Dessine-moi : « MANCHE n/N ».
  isRound?: boolean
}

// En-tête des écrans de partie (maquette TV) : logo, question en cours, adresse, code et QR, avec « Déconnecté ?
// Scanne pour revenir dans la partie. » : un nouveau joueur ne peut plus rejoindre après le lancement.
export function GameHeader({ roomCode, questionIndex, questionCount, difficulty, isRound = false }: GameHeaderProps) {
  return (
    <header className="game-header">
      <span className="game-header-logo">{strings.appName}</span>
      {questionIndex !== undefined && (
        <span className="game-header-question">{(isRound ? strings.question.roundProgress : strings.question.progress)(questionIndex + 1, questionCount)}</span>
      )}
      {difficulty !== undefined && <DifficultyBadge difficulty={difficulty} />}
      <span className="game-header-join">
        <span>
          {strings.header.joinAt(PLAYERS_SITE_HOST)} <strong className="game-header-code">{roomCode}</strong>
        </span>
        <span className="game-header-rejoin">{strings.header.rejoin}</span>
      </span>
      <span className="game-header-qr">
        <QRCodeSVG value={`${JOIN_URL_BASE}${roomCode}`} size={256} level="M" marginSize={1} />
      </span>
    </header>
  )
}
