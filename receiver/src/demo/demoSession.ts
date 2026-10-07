import benchRecording from '../lib/drawing/benchRecording.json?raw'
import {
  BLUFF_TRAP_POINTS,
  BLUFF_TRUTH_POINTS,
  MAX_PLAYERS,
  QUESTION_DURATION_S,
  QUESTIONS_PER_GAME,
  REVEAL_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
} from '@shared/constants'
import { groupFreeAnswers, publicFreeAnswerGroups } from '@shared/freeAnswers'
import { revealDurationS } from '@shared/gameFlow'
import { computeRanks } from '@shared/ranking'
import { activeTeams } from '@shared/teams'
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
  RevealedBluffChoice,
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
  // Mêmes groupes que ceux publiés par l'hôte (réponses identiques regroupées, texte filtré).
  const groups = groupFreeAnswers(DEMO_QUESTION, answers, Object.keys(answers))
  return { freeAnswers: publicFreeAnswerGroups(groups, buildResults(answers)) }
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
    // Validation (Contrôle) : sans échéance, comme dans une vraie partie.
    // Sans échéance : validation (Contrôle) et vote du Bluff.
    phaseEndsAt: status === 'validation' || status === 'vote' ? 0 : startedAt + phaseDurationS(status, answerMode) * 1000,
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

// Une proposition de 80 caractères parmi trois courtes : toutes prennent la taille de la plus longue.
const ONE_LONG_OPTIONS: ChoiceOptions = [
  'Sydney',
  'Canberra',
  'Melbourne, grande ville du Victoria, capitale fédérale provisoire de 1901 à 1927',
  'Perth',
]
const ONE_LONG_SONGS: ChoiceOptions = [
  'Papaoutai – Stromae',
  'Alors on danse – Stromae',
  'Il est cinq heures, Paris s’éveille (live, Palais des Sports, 1975) – J. Dutronc',
  'Formidable – Stromae',
]

export type LongOptionsKind = 'all' | 'one'

export function withLongOptions(session: PublicSession, isBlindTest: boolean, kind: LongOptionsKind = 'all'): PublicSession {
  const options =
    kind === 'one' ? (isBlindTest ? ONE_LONG_SONGS : ONE_LONG_OPTIONS) : isBlindTest ? LONG_SONGS : LONG_OPTIONS
  const question = session.currentQuestion
  return {
    ...session,
    currentQuestion: question && { ...question, options: question.options && options },
    reveal: session.reveal && { ...session.reveal, correctAnswer: options[DEMO_QUESTION.correctIndex] },
  }
}

// Groupe (&teams=1) : joueurs répartis à tour de rôle en 3 équipes ; drawAt : heure du tirage (écran
// « Tirage des équipes » de la TV pendant quelques secondes).
export function withDemoTeams(session: PublicSession, drawAt?: number, teamCount = 3): PublicSession {
  const teams = activeTeams(teamCount)
  const players = Object.fromEntries(
    Object.entries(session.players).map(([id, player], index) => [id, { ...player, team: teams[index % teams.length] }]),
  )
  // Score d'équipe de démonstration : moyenne des scores de ses joueurs.
  const scores = Object.fromEntries(
    teams.map((team) => {
      const members = Object.values(players).filter((player) => player.team === team)
      return [team, members.reduce((sum, player) => sum + (player.score ?? 0), 0) / Math.max(1, members.length)]
    }),
  )
  const ranks = computeRanks(scores)
  return {
    ...session,
    settings: { ...session.settings, teams: true, teamMode: 'random', teamCount: teams.length },
    players,
    teams: Object.fromEntries(teams.map((team) => [team, { score: scores[team], rank: ranks[team] }])),
    ...(drawAt !== undefined && { teamDrawAt: drawAt }),
  }
}

// Bluff (&mode=bluff) : la question et les choix de la maquette B4/B5 (Monopoly), ou &choices=N choix
// (2 à 21 : la vraie réponse et N - 1 propositions de joueurs, avec &players=20), &long=1 : phrases de
// 100 caractères, pour vérifier la mise en page la plus chargée.
const BLUFF_QUESTION_TEXT = 'Quel était le tout premier nom du jeu Monopoly, avant 1935 ?'
const BLUFF_TRUTH = "The Landlord's Game"

const MOCKUP_CHOICES: RevealedBluffChoice[] = [
  { text: 'Magie Immobilière', kind: 'decoy', voters: ['tom'] },
  { text: 'Le Jeu du Propriétaire', kind: 'bluff', authors: ['lea'], voters: ['max', 'ines'] },
  { text: BLUFF_TRUTH, kind: 'truth', voters: ['noe', 'sam'] },
  { text: 'Capital Express', kind: 'bluff', authors: ['hugo'] },
  { text: 'Rue de la Paix', kind: 'decoy', voters: ['jo'] },
  { text: 'Monopolis', kind: 'bluff', authors: ['tom'] },
]

const DEMO_SENTENCE = 'Il était vendu en kit avec un plateau en bois peint à la main et des billets imprimés par la poste'

function demoSentence(index: number, long: boolean): string {
  const text = `${DEMO_SENTENCE} (${index})`
  return long ? text.padEnd(100, '.').slice(0, 100) : `Un jeu de plateau inventé en ${1900 + index}`
}

// N choix : la vraie réponse au milieu, puis une proposition par joueur ; chacun vote pour un autre choix.
function generatedChoices(count: number, long: boolean, playerIds: string[]): RevealedBluffChoice[] {
  const authors = playerIds.slice(0, count - 1)
  const truthAt = Math.floor(count / 2)
  const choices: RevealedBluffChoice[] = authors.map((author, index) => ({
    text: demoSentence(index + 1, long),
    kind: 'bluff',
    authors: [author],
  }))
  choices.splice(truthAt, 0, { text: long ? demoSentence(0, true) : BLUFF_TRUTH, kind: 'truth' })
  playerIds.forEach((id, index) => {
    let target = (index * 7 + 3) % count
    if (choices[target].authors?.includes(id)) target = (target + 1) % count
    const choice = choices[target]
    choice.voters = [...(choice.voters ?? []), id]
  })
  return choices
}

function bluffResults(choices: RevealedBluffChoice[]): Record<PlayerId, PlayerResult> {
  const results: Record<PlayerId, PlayerResult> = {}
  for (const choice of choices) {
    for (const voter of choice.voters ?? []) {
      const correct = choice.kind === 'truth'
      results[voter] = { correct, points: (results[voter]?.points ?? 0) + (correct ? BLUFF_TRUTH_POINTS : 0) }
    }
    for (const author of choice.authors ?? []) {
      const trap = (choice.voters?.length ?? 0) * BLUFF_TRAP_POINTS
      results[author] = { correct: results[author]?.correct ?? false, points: (results[author]?.points ?? 0) + trap }
    }
  }
  return results
}

export interface DemoBluffOptions {
  // Nombre de choix (2 à 21) ; absent : les 6 choix de la maquette.
  choiceCount?: number
  long: boolean
  answeredCount: number
}

export function withDemoBluff(session: PublicSession, { choiceCount, long, answeredCount }: DemoBluffOptions): PublicSession {
  const playerIds = Object.keys(session.players)
  const count = choiceCount === undefined ? undefined : Math.min(Math.max(2, choiceCount), playerIds.length + 1)
  const choices = count === undefined ? MOCKUP_CHOICES : generatedChoices(count, long, playerIds)
  const acted = Object.fromEntries(playerIds.slice(0, answeredCount).map((id) => [id, true as const]))
  const index = session.currentIndex
  const hasReveal = session.status === 'reveal' || session.status === 'scores'
  const revealEnd = session.phaseStartedAt + revealDurationS('bluff', choices.length) * 1000
  return {
    ...session,
    settings: { ...session.settings, answerMode: 'bluff' },
    phaseEndsAt: session.status === 'reveal' && session.phaseEndsAt !== 0 ? revealEnd : session.phaseEndsAt,
    currentQuestion: session.currentQuestion && {
      text: BLUFF_QUESTION_TEXT,
      difficulty: 3,
      timeLimit: session.currentQuestion.timeLimit,
      ...((session.status === 'vote' || hasReveal) && { choices: choices.map((choice) => choice.text) }),
    },
    reveal: hasReveal
      ? { correctAnswer: BLUFF_TRUTH, stats: { bluffChoices: choices }, results: bluffResults(choices) }
      : undefined,
    answeredBy: undefined,
    bluffedBy: { [index]: acted },
    votedBy: session.status === 'vote' ? { [index]: acted } : undefined,
  }
}

// Séries (?streaks=5,3,0,4) : séries des joueurs dans l'ordre du classement (spec 18). Un joueur avec une
// série a répondu juste à la question en cours : la révélation joue alors le son d'une série de 3 ou 5.
export function withDemoStreaks(session: PublicSession, streaks: readonly number[]): PublicSession {
  if (streaks.length === 0) return session
  const ranked = Object.entries(session.players).sort(([, a], [, b]) => a.rank - b.rank)
  const players = { ...session.players }
  const results = { ...session.reveal?.results }
  ranked.forEach(([id, player], position) => {
    const streak = streaks[position] ?? 0
    players[id] = { ...player, streak }
    if (streak > 0) results[id] = { points: results[id]?.points ?? 100, correct: true }
  })
  return { ...session, players, reveal: session.reveal ? { ...session.reveal, results } : undefined }
}

// Dessine-moi (&mode=draw ; &word=arc-en-ciel : mot de la révélation) : manche de Léa (« Animal », 6 lettres) avec la maison du banc d'essai déjà
// dessinée ; à la révélation, le mot. &found=N : les N premiers devineurs ont trouvé (le dernier en bandeau) ;
// &cancelled=1 : manche annulée ; &drawername=MMMMMMMMMMMM : pseudo du dessinateur (12 caractères au plus).
export function withDemoDraw(session: PublicSession, word = 'maison', foundCount = 0, isCancelled = false, drawerName?: string): PublicSession {
  const recording = JSON.parse(benchRecording) as { chunks: { data: string }[] }
  const drawing = Object.fromEntries(recording.chunks.map((chunk, index) => [String(index), chunk.data]))
  const drawer = 'lea'
  const finders = Object.keys(session.players).filter((id) => id !== drawer && session.players[id].connected).slice(0, foundCount)
  const drawFound = Object.fromEntries(finders.map((id, index) => [id, session.phaseStartedAt + (index + 1) * 4_000]))
  const results = Object.fromEntries(finders.map((id, index) => [id, { correct: true, points: 950 - index * 60 }]))
  if (finders.length > 0) results[drawer] = { correct: true, points: 600 }
  const players = drawerName ? { ...session.players, [drawer]: { ...session.players[drawer], name: drawerName } } : session.players
  return {
    ...session,
    players,
    currentQuestion: { text: 'Animal', difficulty: 2, timeLimit: 75 },
    drawTurn: { drawer, round: session.currentIndex, wordLength: 6, category: 'Animal' },
    drawing,
    drawFound,
    reveal:
      session.status === 'reveal'
        ? { correctAnswer: word, stats: isCancelled ? { drawCancelled: true } : {}, results: isCancelled ? {} : results }
        : session.reveal,
  }
}
