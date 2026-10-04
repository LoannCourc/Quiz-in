import type { AnswerMode, GameStatus } from '@shared/types'
import { useState } from 'react'

import { GameAudioStateContext, type GameAudioState } from '../hooks/useGameAudio'
import { ReceiverScreen } from '../screens/ReceiverScreen'
import { DevPanel } from './DevPanel'
import {
  buildDemoSession,
  DEMO_MAX_ANSWERS,
  DEMO_ROOM_CODE,
  demoExtraPlayerCount,
  toDemoBlindTest,
  withLongOptions,
  type DemoOptions,
} from './demoSession'

const DEMO_STATUSES: GameStatus[] = ['lobby', 'starting', 'question', 'reveal', 'scores', 'paused', 'ended']

// Comme la maquette : 7 réponses sur 9 joueurs connectés.
const INITIAL_ANSWERED_COUNT = 7

function isDemoStatus(value: string | null): value is GameStatus {
  return value !== null && (DEMO_STATUSES as string[]).includes(value)
}

// Adresse : ?status=question pour ouvrir un état ; &elapsed=4.5 fait démarrer la phase 4,5 s plus tôt ;
// &capture=1 masque le panneau (captures d'écran) ; &players=20 remplit la partie.
// &blindtest=1 : question musicale (sans son) ; &audio=unavailable : « Extrait indisponible » ;
// &long=1 : propositions longues (mise en page) ; &step=1 : Pas à pas (révélation et classement en attente de l'hôte) ;
// &suspense=1 : Suspense (pas de classement en cours de partie).
function initialOptions(params: URLSearchParams): DemoOptions {
  const status = params.get('status')
  return {
    status: isDemoStatus(status) ? status : 'lobby',
    answerMode: 'choice',
    answeredCount: INITIAL_ANSWERED_COUNT,
    isToggleablePlayerConnected: true,
    startedAt: Date.now() - (Number(params.get('elapsed')) || 0) * 1000,
    extraPlayerCount: demoExtraPlayerCount(Number(params.get('players')) || 0),
  }
}

// Mode démo (sans code dans l'URL) : session fictive pilotée par le panneau.
export function DemoReceiver() {
  const [params] = useState(() => new URLSearchParams(window.location.search))
  const [options, setOptions] = useState<DemoOptions>(() => initialOptions(params))
  const demoSession = buildDemoSession(options)
  const isBlindTest = params.get('blindtest') === '1'
  const baseSession = isBlindTest ? toDemoBlindTest(demoSession) : demoSession
  const withLong = params.get('long') === '1' ? withLongOptions(baseSession, isBlindTest) : baseSession
  // Pas à pas (&step=1) : la révélation et le classement attendent l'hôte, sans fin programmée.
  const isStepByStep = params.get('step') === '1'
  const stepped = isStepByStep
    ? {
        ...withLong,
        settings: { ...withLong.settings, stepByStep: true },
        phaseEndsAt: withLong.status === 'reveal' || withLong.status === 'scores' ? 0 : withLong.phaseEndsAt,
      }
    : withLong
  // Suspense (&suspense=1) : avatars triés par pseudo, étapes sans Classement.
  const session =
    params.get('suspense') === '1' ? { ...stepped, settings: { ...stepped.settings, suspense: true } } : stepped
  const audioState: GameAudioState = params.get('audio') === 'unavailable' ? 'unavailable' : 'playing'
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
      <GameAudioStateContext value={audioState}>
        <ReceiverScreen session={session} roomCode={DEMO_ROOM_CODE} />
      </GameAudioStateContext>
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
