import {
  MAX_PLAYERS,
  QUESTION_DURATION_S,
  QUESTIONS_PER_GAME,
  REVEAL_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
} from '@shared/constants'
import type {
  Answer,
  AnswerMode,
  ChoiceOptions,
  GameStatus,
  Player,
  PlayerId,
  PlayerResult,
  PublicSession,
  Question,
} from '@shared/types'

export const DEMO_ROOM_CODE = 'K7TM'

// Données de la maquette docs/design/plateau-tv.png, pour pouvoir comparer.
const DEMO_QUESTION: Question = {
  id: 'q-0003',
  text: "Quelle est la capitale de l'Australie ?",
  options: ['Sydney', 'Canberra', 'Melbourne', 'Perth'],
  correctIndex: 1,
  acceptedAnswers: ['canberra'],
  difficulty: 2,
  explanation: 'Canberra a été construite pour départager Sydney et Melbourne.',
}

// 9 joueurs comme sur la maquette ; Noé et Sam à égalité pour vérifier les rangs partagés.
const DEMO_PLAYERS: Record<PlayerId, Player> = {
  lea: { name: 'Léa', avatar: '🦊', score: 1480, rank: 1, connected: true },
  max: { name: 'Max', avatar: '🐸', score: 1410, rank: 2, connected: true },
  tom: { name: 'Tom', avatar: '🐙', score: 1295, rank: 3, connected: true },
  ines: { name: 'Inès', avatar: '🐼', score: 1250, rank: 4, connected: true },
  noe: { name: 'Noé', avatar: '🦖', score: 980, rank: 5, connected: true },
  sam: { name: 'Sam', avatar: '🦄', score: 980, rank: 5, connected: true },
  hugo: { name: 'Hugo', avatar: '🐯', score: 860, rank: 7, connected: true },
  jo: { name: 'Mamie Jo', avatar: '🐻', score: 640, rank: 8, connected: true },
  papa: { name: 'Papa', avatar: '🐧', score: 300, rank: 9, connected: false },
}

// Réponses fictives, dans l'ordre d'arrivée : index de proposition et texte libre.
const DEMO_ANSWERS: { playerId: PlayerId; choice: number; free: string; points: number }[] = [
  { playerId: 'lea', choice: 1, free: 'Canberra', points: 100 },
  { playerId: 'max', choice: 1, free: 'canberra', points: 168 },
  { playerId: 'tom', choice: 0, free: 'Sydney', points: 0 },
  { playerId: 'ines', choice: 2, free: 'Melbourne', points: 0 },
  { playerId: 'noe', choice: 1, free: 'Canbera', points: 120 },
  { playerId: 'sam', choice: 0, free: 'Sydney', points: 0 },
  { playerId: 'hugo', choice: 1, free: 'Canberra', points: 150 },
  { playerId: 'jo', choice: 3, free: 'Perth', points: 0 },
  // Dernière réponse : celle de Papa, pour tester un joueur qui a répondu puis s'est déconnecté.
  { playerId: 'papa', choice: 1, free: 'Canberra', points: 110 },
]

// Joueur dont la connexion peut être basculée depuis le panneau de démo.
export const DEMO_TOGGLEABLE_PLAYER_ID: PlayerId = 'papa'
export const DEMO_TOGGLEABLE_PLAYER_NAME = DEMO_PLAYERS[DEMO_TOGGLEABLE_PLAYER_ID].name

export const DEMO_MAX_ANSWERS = DEMO_ANSWERS.length

const DEMO_CURRENT_INDEX = 2

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

function buildResults(answers: Record<PlayerId, Answer>): Record<PlayerId, PlayerResult> {
  return Object.fromEntries(
    Object.entries(answers).map(([playerId, answer]) => [
      playerId,
      { correct: answer.correct === true, points: answer.points ?? 0 },
    ]),
  )
}

function buildAnsweredBy(answers: Record<PlayerId, Answer>): Record<PlayerId, true> {
  return Object.fromEntries(Object.keys(answers).map((playerId) => [playerId, true]))
}

export interface DemoOptions {
  status: GameStatus
  answerMode: AnswerMode
  answeredCount: number
  isToggleablePlayerConnected: boolean
  startedAt: number
  // Joueurs ajoutés aux 9 de la démo (?players=20 : partie pleine, pour vérifier la mise en page).
  extraPlayerCount: number
}

const DEMO_PLAYER_COUNT = Object.keys(DEMO_PLAYERS).length
const EXTRA_AVATARS = ['🐨', '🦁', '🐰', '🐶', '🐱', '🦉', '🐢', '🐝', '🦋', '🐳', '🦒']

export function demoExtraPlayerCount(requestedTotal: number): number {
  return Math.min(Math.max(0, requestedTotal - DEMO_PLAYER_COUNT), MAX_PLAYERS - DEMO_PLAYER_COUNT)
}

function buildExtraPlayers(count: number): Record<PlayerId, Player> {
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => {
      const rank = DEMO_PLAYER_COUNT + index + 1
      const player: Player = {
        name: `Joueur ${rank}`,
        avatar: EXTRA_AVATARS[index % EXTRA_AVATARS.length],
        score: Math.max(0, 280 - index * 20),
        rank,
        connected: true,
      }
      return [`extra${rank}`, player]
    }),
  )
}

function buildPlayers(isToggleablePlayerConnected: boolean, extraPlayerCount: number): Record<PlayerId, Player> {
  const toggleablePlayer = DEMO_PLAYERS[DEMO_TOGGLEABLE_PLAYER_ID]
  return {
    ...DEMO_PLAYERS,
    [DEMO_TOGGLEABLE_PLAYER_ID]: { ...toggleablePlayer, connected: isToggleablePlayerConnected },
    ...buildExtraPlayers(extraPlayerCount),
  }
}

// Construit la partie publique d'une session fictive, comme la TV la lit dans la base.
// Les réponses détaillées restent internes : elles servent à calculer stats et résultats.
export function buildDemoSession({
  status,
  answerMode,
  answeredCount,
  isToggleablePlayerConnected,
  startedAt,
  extraPlayerCount,
}: DemoOptions): PublicSession {
  const answers = buildAnswers(answerMode, answeredCount)
  const isPaused = status === 'paused'
  // L'hôte publie reveal à la révélation et le laisse en place pendant le classement.
  const hasReveal = status === 'reveal' || status === 'scores'
  return {
    hostUid: 'lea',
    quizId: 'demo',
    status,
    settings: { answerMode, speedBonus: true, control: false, teams: false },
    currentIndex: DEMO_CURRENT_INDEX,
    questionCount: QUESTIONS_PER_GAME,
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
    reveal: hasReveal
      ? {
          correctAnswer: DEMO_QUESTION.options[DEMO_QUESTION.correctIndex],
          explanation: DEMO_QUESTION.explanation,
          stats: buildRevealStats(answerMode, answers),
          results: buildResults(answers),
        }
      : undefined,
    players: buildPlayers(isToggleablePlayerConnected, extraPlayerCount),
    answeredBy: { [DEMO_CURRENT_INDEX]: buildAnsweredBy(answers) },
  }
}

// Blind test (?blindtest=1) : même session, question musicale. L'adresse ne mène à rien : la démo ne
// joue aucun son, elle montre seulement les écrans (indicateur d'écoute, mention à la révélation).
const DEMO_SONGS: ChoiceOptions = [
  'Papaoutai – Stromae',
  'Alors on danse – Stromae',
  'Formidable – Stromae',
  'Tous les mêmes – Stromae',
]

export function toDemoBlindTest(session: PublicSession): PublicSession {
  const question = session.currentQuestion
  return {
    ...session,
    currentQuestion: question && {
      ...question,
      text: 'Quel est ce morceau ?',
      options: question.options && DEMO_SONGS,
      audio: { url: 'https://exemple.invalid/demo.mp3', startS: 0, durationS: question.timeLimit },
    },
    reveal: session.reveal && {
      ...session.reveal,
      correctAnswer: DEMO_SONGS[DEMO_QUESTION.correctIndex],
      explanation: undefined,
      music: { title: 'Alors on danse', artist: 'Stromae', source: 'deezer' },
    },
  }
}

// Propositions longues (?long=1), pour vérifier la mise en page : la plus longue fait 80 caractères,
// le maximum autorisé. En blind test, les titres les plus longs du premier quiz.
const LONG_OPTIONS: ChoiceOptions = [
  'Le traité de Paris, signé après la guerre de Sept Ans entre la France et l’Angleterre',
  'Le traité de Versailles, signé dans la galerie des Glaces du château',
  'Le traité de Francfort, qui met fin à la guerre franco-prussienne',
  'Le traité de Westphalie',
]
const LONG_SONGS: ChoiceOptions = [
  'Que je t’aime – Johnny Hallyday',
  'Il est cinq heures, Paris s’éveille – Jacques Dutronc',
  'Avec le temps – Léo Ferré',
  'Est-ce que tu m’aimes ? – Maître Gims',
]

export function withLongOptions(session: PublicSession, isBlindTest: boolean): PublicSession {
  const options = isBlindTest ? LONG_SONGS : LONG_OPTIONS
  const question = session.currentQuestion
  return {
    ...session,
    currentQuestion: question && { ...question, options: question.options && options },
    reveal: session.reveal && { ...session.reveal, correctAnswer: options[DEMO_QUESTION.correctIndex] },
  }
}
