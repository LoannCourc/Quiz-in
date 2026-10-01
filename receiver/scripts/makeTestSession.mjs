// Génère une session de test à importer dans la console Firebase (sessions/TEST).
// Usage (depuis receiver/) : npm run test-session -- [état] [mode] [durée en s]
//   état : lobby | starting | question | reveal | scores | paused | ended (défaut : question)
//   mode : choice | free (défaut : choice)
//   durée : durée de la phase, assez longue pour avoir le temps d'importer (défaut : 300)
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const STATUSES = ['lobby', 'starting', 'question', 'reveal', 'scores', 'paused', 'ended']
const MODES = ['choice', 'free']

const [status = 'question', answerMode = 'choice', durationArg = '300'] = process.argv.slice(2)
const durationS = Number(durationArg)

if (!STATUSES.includes(status) || !MODES.includes(answerMode) || !(durationS > 0)) {
  console.error(`Paramètres invalides. États : ${STATUSES.join(', ')}. Modes : ${MODES.join(', ')}.`)
  process.exit(1)
}

const CURRENT_INDEX = 0
const OPTIONS = ['Mars', 'Mercure', 'Vénus', 'La Terre']
const CORRECT_INDEX = 1

const players = {
  lea: { name: 'Léa', avatar: '🦊', score: 280, rank: 1, connected: true },
  tom: { name: 'Tom', avatar: '🐼', score: 150, rank: 2, connected: true },
  jo: { name: 'Mamie Jo', avatar: '🦉', score: 150, rank: 2, connected: true },
  papa: { name: 'Papa', avatar: '🐻', score: 0, rank: 4, connected: false },
}

const fakeAnswers = [
  { playerId: 'lea', choice: 1, free: 'Mercure', points: 180 },
  { playerId: 'tom', choice: 2, free: 'Vénus', points: 0 },
]

const now = Date.now()
const answers = Object.fromEntries(
  fakeAnswers.map(({ playerId, choice, free, points }) => [
    playerId,
    { value: answerMode === 'choice' ? choice : free, submittedAt: now, correct: points > 0, points },
  ]),
)

const session = {
  hostUid: 'lea',
  quizId: 'demo',
  status,
  settings: { answerMode, speedBonus: true, control: false, teams: false },
  currentIndex: CURRENT_INDEX,
  phaseStartedAt: now,
  phaseEndsAt: now + durationS * 1000,
  currentQuestion: {
    text: 'Quelle planète est la plus proche du Soleil ?',
    ...(answerMode === 'choice' ? { options: OPTIONS } : {}),
    difficulty: 1,
    timeLimit: durationS,
  },
  players,
  answers: { [CURRENT_INDEX]: answers },
}

if (status === 'paused') {
  session.pausedFrom = 'question'
  session.remainingMs = 12000
}

if (status === 'reveal') {
  const entries = Object.entries(answers)
  session.reveal = {
    correctAnswer: OPTIONS[CORRECT_INDEX],
    explanation: 'Mercure orbite à environ 58 millions de km du Soleil.',
    stats:
      answerMode === 'choice'
        ? { choiceCounts: OPTIONS.map((_, index) => entries.filter(([, answer]) => answer.value === index).length) }
        : { freeAnswers: entries.map(([playerId, answer]) => ({ playerId, value: answer.value })) },
  }
}

const outputPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'test-data', 'session-TEST.json')
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(session, null, 2)}\n`)
console.log(`Session « ${status} » (${answerMode}, ${durationS} s) écrite dans ${outputPath}`)
console.log('À importer sur le nœud sessions/TEST, puis ouvrir le récepteur avec ?code=TEST')
