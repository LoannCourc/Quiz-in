import { isBlindTestAsk } from '@shared/quizValidation'
import type { AnswerMode, GameStatus, PublicSession } from '@shared/types'
import { useState } from 'react'

import { PerfPanel } from '../components/PerfPanel'
import { GameAudioStateContext, type GameAudioState } from '../hooks/useGameAudio'
import { usePerfEnabled } from '../hooks/usePerfEnabled'
import { useTvMusic } from '../hooks/useTvMusic'
import { useTvSound } from '../hooks/useTvSound'
import { perfMonitor } from '../lib/perf/perfMonitor'
import { ReceiverScreen } from '../screens/ReceiverScreen'
import { DevPanel } from './DevPanel'
import { SoundGallery } from './SoundGallery'
import {
  buildDemoSession,
  DEMO_MAX_ANSWERS,
  DEMO_ROOM_CODE,
  demoExtraPlayerCount,
  toDemoBlindTest,
  withDemoBluff,
  withDemoTeams,
  withLongOptions,
  type DemoOptions,
} from './demoSession'

const DEMO_STATUSES: GameStatus[] = ['lobby', 'starting', 'question', 'vote', 'validation', 'reveal', 'scores', 'paused', 'ended']

// Comme la maquette : 7 réponses sur 9 joueurs connectés.
const INITIAL_ANSWERED_COUNT = 7

function isDemoStatus(value: string | null): value is GameStatus {
  return value !== null && (DEMO_STATUSES as string[]).includes(value)
}

// Adresse : ?status=question pour ouvrir un état ; &elapsed=4.5 fait démarrer la phase 4,5 s plus tôt ;
// &capture=1 masque le panneau (captures d'écran) ; &last=1 : dernière question ; &players=20 remplit la partie, &players=0 à 8 la vide
// (salon).
// &blindtest=1 : question musicale (sans son) ; &audio=unavailable : « Extrait indisponible » ;
// &long=1 : propositions longues (mise en page) ; &long=one : une seule de 80 caractères ; &step=1 : Pas à pas (révélation et classement en attente de l'hôte) ;
// &suspense=1 : Suspense (pas de classement en cours de partie) ; &mode=free : Réponse libre ;
// &ask=title|artist|both : blind test en Réponse libre (ce qu'il faut écrire) ; &answered=10 : réponses reçues ;
// &teams=1 : Groupe (3 équipes) ; &draw=1 : écran du tirage des équipes ; &qlen=140 : énoncé de 140 caractères.
// &mode=bluff : Bluff (status=question : écriture, status=vote, status=reveal) ; &choices=21 : nombre de
// choix (avec &players=20) ; &long=1 : phrases de 100 caractères.
function initialOptions(params: URLSearchParams): DemoOptions {
  const status = params.get('status')
  return {
    status: isDemoStatus(status) ? status : 'lobby',
    answerMode: params.get('mode') === 'free' ? 'free' : params.get('mode') === 'bluff' ? 'bluff' : 'choice',
    answeredCount: Math.min(Number(params.get('answered')) || INITIAL_ANSWERED_COUNT, DEMO_MAX_ANSWERS),
    isToggleablePlayerConnected: true,
    startedAt: Date.now() - (Number(params.get('elapsed')) || 0) * 1000,
    extraPlayerCount: demoExtraPlayerCount(Number(params.get('players')) || 0),
  }
}

// Mode démo (sans code dans l'URL) : session fictive pilotée par le panneau ; ?sounds=1 : galerie des sons.
export function DemoReceiver() {
  const [params] = useState(() => new URLSearchParams(window.location.search))
  return params.get('sounds') === '1' ? <SoundGallery withSelfTest={params.get('selftest') === '1'} /> : <DemoGame params={params} />
}

// Les effets sonores suivent aussi les changements d'état du panneau (après un premier clic).
function DemoGame({ params }: { params: URLSearchParams }) {
  const [options, setOptions] = useState<DemoOptions>(() => initialOptions(params))
  const demoSession = buildDemoSession(options)
  const isBlindTest = params.get('blindtest') === '1'
  const baseSession = isBlindTest ? toDemoBlindTest(demoSession) : demoSession
  const long = params.get('long')
  const isBluff = options.answerMode === 'bluff'
  const choiceParam = Number(params.get('choices'))
  const withLong = isBluff
    ? withDemoBluff(baseSession, {
        choiceCount: choiceParam > 0 ? choiceParam : undefined,
        long: long === '1',
        answeredCount: options.answeredCount,
      })
    : long === '1' || long === 'one'
      ? withLongOptions(baseSession, isBlindTest, long === 'one' ? 'one' : 'all')
      : baseSession
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
  const withSuspense =
    params.get('suspense') === '1' ? { ...stepped, settings: { ...stepped.settings, suspense: true } } : stepped
  const ask = params.get('ask')
  const withAsk =
    isBlindTestAsk(ask) && withSuspense.currentQuestion
      ? { ...withSuspense, currentQuestion: { ...withSuspense.currentQuestion, ask } }
      : withSuspense
  // Groupe (&teams=1) ; &draw=1 : tirage à l'ouverture de la page.
  const [drawAt] = useState(() => (params.get('draw') === '1' ? Date.now() : undefined))
  const withTeams = params.get('teams') === '1' ? withDemoTeams(withAsk, drawAt, demoTeamCount(params.get('teamcount'))) : withAsk
  // &qlen=140 : énoncé de cette longueur (mise en page des questions longues, jusqu'à 4 lignes).
  const questionLength = Number(params.get('qlen'))
  const withQuestion =
    questionLength > 0 && withTeams.currentQuestion
      ? { ...withTeams, currentQuestion: { ...withTeams.currentQuestion, text: demoQuestionText(questionLength) } }
      : withTeams
  const limited = withPlayerLimit(withQuestion, params.get('players'))
  // &last=1 : dernière question de la partie (révélation suivie directement de l'écran de fin).
  const session = params.get('last') === '1' ? { ...limited, currentIndex: (limited.questionCount ?? 1) - 1 } : limited
  const audioState: GameAudioState = params.get('audio') === 'unavailable' ? 'unavailable' : 'playing'
  const isCapture = params.get('capture') === '1'
  useTvSound(session, 0)
  useTvMusic(session, isBlindTest, 0)
  // &perf=1 : panneau de mesures sur les écrans de démo (son aspect, et le coût des animations).
  const isPerfEnabled = usePerfEnabled()
  perfMonitor.noteSession(session)
  perfMonitor.noteRender()

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
      {isPerfEnabled && <PerfPanel serverOffsetMs={0} />}
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

// Énoncé de démonstration d'exactement length caractères, en mots de longueur ordinaire.
function demoQuestionText(length: number): string {
  const words = 'Quel personnage célèbre a inventé ce drôle de jeu de société pendant une longue soirée familiale'.split(' ')
  let text = ''
  for (let index = 0; text.length < length; index++) text += (text ? ' ' : '') + words[index % words.length]
  return text.slice(0, Math.max(1, length - 2)).trimEnd() + ' ?'
}

// &players=0 à 8 : moins de joueurs que la démo n'en a (les premiers gardés).
function withPlayerLimit(session: PublicSession, requested: string | null): PublicSession {
  const entries = Object.entries(session.players)
  const count = requested === null ? entries.length : Number(requested)
  return count < entries.length ? { ...session, players: Object.fromEntries(entries.slice(0, Math.max(0, count))) } : session
}

// &teamcount=2 à 4 : nombre d'équipes de la démo (3 par défaut).
function demoTeamCount(value: string | null): number {
  const count = Number(value)
  return count >= 2 && count <= 4 ? count : 3
}
