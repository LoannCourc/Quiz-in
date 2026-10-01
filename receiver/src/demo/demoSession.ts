import {
  QUESTION_DURATION_S,
  REVEAL_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
} from '@shared/constants'
import type {
  Answer,
  AnswerMode,
  GameStatus,
  Player,
  PlayerId,
  Question,
  Session,
} from '@shared/types'

export const DEMO_ROOM_CODE = 'K7PX'

const DEMO_QUESTION: Question = {
  id: 'q-0001',
  text: 'Quelle planète est la plus proche du Soleil ?',
  options: ['Mars', 'Mercure', 'Vénus', 'La Terre'],
  correctIndex: 1,
  acceptedAnswers: ['mercure'],
  difficulty: 1,
  explanation: 'Mercure orbite à environ 58 millions de km du Soleil.',
}

// Deux joueurs à égalité pour vérifier l'affichage des rangs partagés (1er, 1er, 3e).
const DEMO_PLAYERS: Record<PlayerId, Player> = {
  lea: { name: 'Léa', avatar: '🦊', score: 450, rank: 1, connected: true },
  tom: { name: 'Tom', avatar: '🐼', score: 450, rank: 1, connected: true },
  jo: { name: 'Mamie Jo', avatar: '🦉', score: 320, rank: 3, connected: true },
  hugo: { name: 'Hugo', avatar: '🐸', score: 200, rank: 4, connected: true },
  ines: { name: 'Inès', avatar: '🦄', score: 150, rank: 5, connected: true },
  papa: { name: 'Papa', avatar: '🐻', score: 100, rank: 6, connected: false },
}

// Réponses fictives, dans l'ordre d'arrivée : index de proposition et texte libre.
const DEMO_ANSWERS: { playerId: PlayerId; choice: number; free: string; points: number }[] = [
  { playerId: 'lea', choice: 1, free: 'Mercure', points: 180 },
  { playerId: 'jo', choice: 1, free: 'mercure', points: 150 },
  { playerId: 'tom', choice: 2, free: 'Vénus', points: 0 },
  { playerId: 'hugo', choice: 1, free: 'Mercur', points: 120 },
  { playerId: 'ines', choice: 0, free: 'Mars', points: 0 },
  // Dernière réponse : celle de Papa, pour tester un joueur qui a répondu puis s'est déconnecté.
  { playerId: 'papa', choice: 3, free: 'La Terre', points: 0 },
]

// Joueur dont la connexion peut être basculée depuis le panneau de démo.
export const DEMO_TOGGLEABLE_PLAYER_ID: PlayerId = 'papa'
export const DEMO_TOGGLEABLE_PLAYER_NAME = DEMO_PLAYERS[DEMO_TOGGLEABLE_PLAYER_ID].name

export const DEMO_MAX_ANSWERS = DEMO_ANSWERS.length

const DEMO_CURRENT_INDEX = 3

function phaseDurationS(status: GameStatus, answerMode: AnswerMode): number {
  switch (status) {
    case 'starting':
      return STARTING_DURATION_S
    case 'question':
      return DEMO_QUESTION.timeLimit ?? QUESTION_DURATION_S[answerMode]
    case 'reveal':
      return REVEAL_DURATION_S[answerMode]
    case 'scores':
      return SCORES_DURATION_S
    default:
      return 0
  }
}

function buildAnswers(answerMode: AnswerMode, answeredCount: number): Record<PlayerId, Answer> {
  const answers: Record<PlayerId, Answer> = {}
  for (const demo of DEMO_ANSWERS.slice(0, answeredCount)) {
    answers[demo.playerId] = {
      value: answerMode === 'choice' ? demo.choice : demo.free,
      submittedAt: 0,
      correct: demo.points > 0,
      points: demo.points,
    }
  }
  return answers
}

function buildRevealStats(answerMode: AnswerMode, answers: Record<PlayerId, Answer>) {
  const entries = Object.entries(answers)
  if (answerMode === 'choice') {
    const choiceCounts = DEMO_QUESTION.options.map(
      (_, index) => entries.filter(([, answer]) => answer.value === index).length,
    )
    return { choiceCounts }
  }
  return {
    freeAnswers: entries.map(([playerId, answer]) => ({ playerId, value: String(answer.value) })),
  }
}

export interface DemoOptions {
  status: GameStatus
  answerMode: AnswerMode
  answeredCount: number
  isToggleablePlayerConnected: boolean
  startedAt: number
}

function buildPlayers(isToggleablePlayerConnected: boolean): Record<PlayerId, Player> {
  const toggleablePlayer = DEMO_PLAYERS[DEMO_TOGGLEABLE_PLAYER_ID]
  return {
    ...DEMO_PLAYERS,
    [DEMO_TOGGLEABLE_PLAYER_ID]: { ...toggleablePlayer, connected: isToggleablePlayerConnected },
  }
}

// Construit une session fictive, comme si l'hôte l'avait publiée dans la base.
export function buildDemoSession({
  status,
  answerMode,
  answeredCount,
  isToggleablePlayerConnected,
  startedAt,
}: DemoOptions): Session {
  const answers = buildAnswers(answerMode, answeredCount)
  const isPaused = status === 'paused'
  return {
    hostUid: 'lea',
    quizId: 'demo',
    status,
    settings: { answerMode, speedBonus: true, control: false, teams: false },
    currentIndex: DEMO_CURRENT_INDEX,
    phaseStartedAt: startedAt,
    phaseEndsAt: startedAt + phaseDurationS(status, answerMode) * 1000,
    pausedFrom: isPaused ? 'question' : undefined,
    remainingMs: isPaused ? 12_000 : undefined,
    currentQuestion: {
      text: DEMO_QUESTION.text,
      options: answerMode === 'choice' ? DEMO_QUESTION.options : undefined,
      difficulty: DEMO_QUESTION.difficulty,
      timeLimit: phaseDurationS('question', answerMode),
    },
    reveal:
      status === 'reveal'
        ? {
            correctAnswer: DEMO_QUESTION.options[DEMO_QUESTION.correctIndex],
            explanation: DEMO_QUESTION.explanation,
            stats: buildRevealStats(answerMode, answers),
          }
        : undefined,
    players: buildPlayers(isToggleablePlayerConnected),
    answers: { [DEMO_CURRENT_INDEX]: answers },
  }
}
