import type { AnswerMode, GameStatus } from '@shared/types'
import { useState } from 'react'

import { ReceiverScreen } from '../screens/ReceiverScreen'
import { DevPanel } from './DevPanel'
import { buildDemoSession, DEMO_MAX_ANSWERS, DEMO_ROOM_CODE, type DemoOptions } from './demoSession'

const INITIAL_DEMO: Omit<DemoOptions, 'startedAt'> = {
  status: 'lobby',
  answerMode: 'choice',
  answeredCount: 2,
  isToggleablePlayerConnected: false,
}

// Mode démo (sans code dans l'URL) : session fictive pilotée par le panneau.
export function DemoReceiver() {
  const [options, setOptions] = useState<DemoOptions>(() => ({ ...INITIAL_DEMO, startedAt: Date.now() }))
  const session = buildDemoSession(options)

  // Changer d'état relance le chrono de la phase, comme le ferait l'hôte.
  function selectStatus(status: GameStatus) {
    setOptions((current) => ({ ...current, status, startedAt: Date.now() }))
  }

  function toggleMode() {
    const answerMode: AnswerMode = options.answerMode === 'choice' ? 'free' : 'choice'
    setOptions((current) => ({ ...current, answerMode, startedAt: Date.now() }))
  }

  function addAnswer() {
    setOptions((current) => ({
      ...current,
      answeredCount: Math.min(current.answeredCount + 1, DEMO_MAX_ANSWERS),
    }))
  }

  function resetAnswers() {
    setOptions((current) => ({ ...current, answeredCount: 0 }))
  }

  function togglePlayerConnection() {
    setOptions((current) => ({
      ...current,
      isToggleablePlayerConnected: !current.isToggleablePlayerConnected,
    }))
  }

  return (
    <>
      <ReceiverScreen session={session} roomCode={DEMO_ROOM_CODE} />
      <DevPanel
        status={options.status}
        answerMode={options.answerMode}
        answeredCount={options.answeredCount}
        isToggleablePlayerConnected={options.isToggleablePlayerConnected}
        onSelectStatus={selectStatus}
        onToggleMode={toggleMode}
        onAddAnswer={addAnswer}
        onResetAnswers={resetAnswers}
        onTogglePlayerConnection={togglePlayerConnection}
      />
    </>
  )
}
