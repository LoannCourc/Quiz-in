import type { AnswerMode, GameStatus } from '@shared/types'
import { useState } from 'react'

import { ReceiverScreen } from '../screens/ReceiverScreen'
import { DevPanel } from './DevPanel'
import { buildDemoSession, DEMO_MAX_ANSWERS, DEMO_ROOM_CODE, type DemoOptions } from './demoSession'

const DEMO_STATUSES: GameStatus[] = ['lobby', 'starting', 'question', 'reveal', 'scores', 'paused', 'ended']

// Comme la maquette : 7 réponses sur 9 joueurs connectés.
const INITIAL_ANSWERED_COUNT = 7

function isDemoStatus(value: string | null): value is GameStatus {
  return value !== null && (DEMO_STATUSES as string[]).includes(value)
}

// Adresse : ?status=question pour ouvrir un état ; &capture=1 masque le panneau (captures d'écran).
function initialOptions(params: URLSearchParams): DemoOptions {
  const status = params.get('status')
  return {
    status: isDemoStatus(status) ? status : 'lobby',
    answerMode: 'choice',
    answeredCount: INITIAL_ANSWERED_COUNT,
    isToggleablePlayerConnected: true,
    startedAt: Date.now(),
  }
}

// Mode démo (sans code dans l'URL) : session fictive pilotée par le panneau.
export function DemoReceiver() {
  const [params] = useState(() => new URLSearchParams(window.location.search))
  const [options, setOptions] = useState<DemoOptions>(() => initialOptions(params))
  const session = buildDemoSession(options)
  const isCapture = params.get('capture') === '1'

  // Changer d'état relance le chrono de la phase, comme le ferait l'hôte.
  function selectStatus(status: GameStatus) {
    setOptions((current) => ({ ...current, status, startedAt: Date.now() }))
  }

  function toggleMode() {
    const answerMode: AnswerMode = options.answerMode === 'choice' ? 'free' : 'choice'
    setOptions((current) => ({ ...current, answerMode, startedAt: Date.now() }))
  }

  function addAnswer() {
    setOptions((current) => ({ ...current, answeredCount: Math.min(current.answeredCount + 1, DEMO_MAX_ANSWERS) }))
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
      {!isCapture && (
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
      )}
    </>
  )
}
