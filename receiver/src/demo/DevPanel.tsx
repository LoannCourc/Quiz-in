import type { AnswerMode, GameStatus } from '@shared/types'

import { strings } from '../strings'
import { DEMO_MAX_ANSWERS, DEMO_TOGGLEABLE_PLAYER_NAME } from './demoSession'
import './DevPanel.css'

type DemoStatus = Exclude<GameStatus, 'validation'>

const DEMO_STATUSES = Object.keys(strings.dev.statuses) as DemoStatus[]

interface DevPanelProps {
  status: GameStatus
  answerMode: AnswerMode
  answeredCount: number
  isToggleablePlayerConnected: boolean
  onSelectStatus: (status: DemoStatus) => void
  onToggleMode: () => void
  onAddAnswer: () => void
  onResetAnswers: () => void
  onTogglePlayerConnection: () => void
}

// Panneau de démonstration, hors maquette TV : il simule les actions de l'hôte et des joueurs.
export function DevPanel({
  status,
  answerMode,
  answeredCount,
  isToggleablePlayerConnected,
  onSelectStatus,
  onToggleMode,
  onAddAnswer,
  onResetAnswers,
  onTogglePlayerConnection,
}: DevPanelProps) {
  return (
    <aside className="dev-panel">
      <strong>{strings.dev.title}</strong>
      {DEMO_STATUSES.map((demoStatus) => (
        <button
          key={demoStatus}
          type="button"
          className={demoStatus === status ? 'is-active' : undefined}
          onClick={() => onSelectStatus(demoStatus)}>
          {strings.dev.statuses[demoStatus]}
        </button>
      ))}
      <button type="button" onClick={onToggleMode}>
        {answerMode === 'choice' ? strings.dev.modeChoice : strings.dev.modeFree}
      </button>
      <button type="button" onClick={onAddAnswer} disabled={answeredCount >= DEMO_MAX_ANSWERS}>
        {strings.dev.addAnswer(answeredCount, DEMO_MAX_ANSWERS)}
      </button>
      <button type="button" onClick={onResetAnswers} disabled={answeredCount === 0}>
        {strings.dev.resetAnswers}
      </button>
      <button type="button" onClick={onTogglePlayerConnection}>
        {strings.dev.playerConnection(DEMO_TOGGLEABLE_PLAYER_NAME, isToggleablePlayerConnected)}
      </button>
    </aside>
  )
}
