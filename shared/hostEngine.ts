import { isAnswerCorrect } from './answerMatching'
import { extractOf } from './audioPlayback'
import {
  ALL_ANSWERED_DELAY_S,
  MAX_PLAYERS,
  QUESTIONS_PER_GAME,
  REVEAL_GRACE_MS,
  STARTING_DURATION_S,
  TRANSITION_LOCK_MAX_MS,
} from './constants'
import { nextPhase, questionDurationS } from './gameFlow'
import { canLaunchGame, connectedPlayerIds } from './players'
import { computeRanks } from './ranking'
import { computePoints } from './scoring'
import type {
  Answer,
  AnswerMode,
  ChoiceOptions,
  GameStatus,
  PlayerId,
  PlayerResult,
  PublicQuestion,
  Question,
  Reveal,
  Session,
} from './types'

// Moteur de partie de l'hôte (spec 5 et 6), sans Firebase ni React : chaque fonction lit la
// session telle que l'hôte la reçoit et renvoie le contenu d'UN SEUL update() multi-chemins
// (chemins relatifs à sessions/{code}). Rien n'est gardé en mémoire : la partie peut toujours
// reprendre à partir de la session stockée.

// Chemin relatif à sessions/{code} → valeur (null efface le chemin).
export type SessionUpdate = Record<string, unknown>

// Partie limitée à QUESTIONS_PER_GAME questions, dans l'ordre du quiz (questions déjà validées).
// limit : partie plus courte (réservée au développement), jamais plus que QUESTIONS_PER_GAME.
export function selectGameQuestions(questions: readonly Question[], limit = QUESTIONS_PER_GAME): Question[] {
  return questions.slice(0, Math.max(0, Math.min(limit, QUESTIONS_PER_GAME)))
}

// Blind test : adresses temporaires des extraits, par identifiant de question, fournies par l'hôte
// (récupérées auprès de la source audio, renouvelées avant expiration).
export type AudioUrls = Readonly<Record<string, string>>

// Question publiée pendant QUESTION : jamais correctIndex, acceptedAnswers ni explanation.
// En Réponse libre, les propositions ne sont pas envoyées (elles contiennent la bonne réponse).
// Blind test : seulement l'adresse de l'extrait, jamais l'identifiant, le titre ni l'artiste.
export function toPublicQuestion(question: Question, answerMode: AnswerMode, audioUrl?: string): PublicQuestion {
  const published: PublicQuestion = {
    text: question.text,
    difficulty: question.difficulty,
    timeLimit: questionDurationS(answerMode, question.timeLimit),
  }
  if (answerMode === 'choice') published.options = [...question.options] as ChoiceOptions
  if (question.music && audioUrl) published.audio = { url: audioUrl, ...extractOf(question.music) }
  return published
}

function isCorrect(question: Question, value: Answer['value'], answerMode: AnswerMode): boolean {
  if (answerMode === 'choice') return typeof value === 'number' && value === question.correctIndex
  return typeof value === 'string' && isAnswerCorrect(value, question.acceptedAnswers)
}

// Validation et points d'une réponse. Le temps restant se mesure sur l'heure du serveur :
// phaseEndsAt (fin de la question) moins submittedAt (écrit par le serveur).
export function gradeAnswer(
  question: Question,
  answer: Answer,
  settings: { answerMode: AnswerMode; speedBonus: boolean },
  phaseEndsAt: number,
): PlayerResult {
  const correct = isCorrect(question, answer.value, settings.answerMode)
  const durationMs = questionDurationS(settings.answerMode, question.timeLimit) * 1000
  const points = computePoints({
    correct,
    speedBonus: settings.speedBonus,
    remainingMs: phaseEndsAt - answer.submittedAt,
    durationMs,
  })
  return { correct, points }
}

export interface RevealResult {
  reveal: Reveal
  // Résultat de chaque joueur ayant répondu à la question courante.
  results: Record<PlayerId, PlayerResult>
  // Score total et rang de chaque joueur après cette question.
  scores: Record<PlayerId, number>
  ranks: Record<PlayerId, number>
}

// Score = somme des points stockés dans answers pour les questions précédentes, plus ceux de la
// question révélée : rejouer la révélation ne compte jamais deux fois les mêmes points.
function totalScore(session: Session, playerId: PlayerId, current: PlayerResult | undefined): number {
  let total = current?.points ?? 0
  for (let index = 0; index < session.currentIndex; index++) {
    total += session.answers?.[index]?.[playerId]?.points ?? 0
  }
  return total
}

// Révélation de la question courante : bonne réponse, répartition, résultats, scores et rangs.
// Tous les joueurs sont classés, y compris les déconnectés (ils gardent leur score, spec 6.6).
export function buildReveal(question: Question, session: Session): RevealResult {
  const { answerMode } = session.settings
  const answers = session.answers?.[session.currentIndex] ?? {}
  const playerIds = Object.keys(session.players)

  const results: Record<PlayerId, PlayerResult> = {}
  for (const playerId of playerIds) {
    const answer = answers[playerId]
    if (answer) results[playerId] = gradeAnswer(question, answer, session.settings, session.phaseEndsAt)
  }

  const scores = Object.fromEntries(playerIds.map((id) => [id, totalScore(session, id, results[id])]))
  const answered = Object.entries(answers).filter(([playerId]) => playerId in session.players)

  const reveal: Reveal = {
    correctAnswer: question.options[question.correctIndex],
    stats:
      answerMode === 'choice'
        ? { choiceCounts: question.options.map((_, index) => answered.filter(([, a]) => a.value === index).length) }
        : { freeAnswers: answered.map(([playerId, a]) => ({ playerId, value: String(a.value) })) },
    results,
  }
  if (question.explanation) reveal.explanation = question.explanation
  if (question.music) {
    const { title, artist, source } = question.music
    reveal.music = { title, artist, source }
  }

  return { reveal, results, scores, ranks: computeRanks(scores) }
}

// Heure du serveur à laquelle l'hôte doit faire avancer la partie, ou null (LOBBY, PAUSED, END :
// seule une action de l'hôte fait avancer).
// QUESTION : fin du chrono plus une marge pour les dernières réponses, ou plus tôt si TOUS les
// joueurs connectés ont répondu (2 s après la dernière réponse, spec 5). Un joueur encore marqué
// connecté qui n'a pas répondu (présence en retard après un départ) empêche la fin anticipée :
// il ne peut que retarder la fin jusqu'au chrono, jamais l'avancer.
export function nextDeadline(session: Session): number | null {
  switch (session.status) {
    case 'starting':
    case 'reveal':
    case 'scores':
      return session.phaseEndsAt
    case 'question':
      return questionDeadline(session)
    case 'lobby':
    case 'validation':
    case 'paused':
    case 'ended':
      return null
  }
}

function questionDeadline(session: Session): number {
  const timeUp = session.phaseEndsAt + REVEAL_GRACE_MS
  const connected = connectedPlayerIds(session.players)
  const answers = session.answers?.[session.currentIndex] ?? {}
  if (connected.length === 0 || !connected.every((id) => answers[id] !== undefined)) return timeUp
  const lastAnswerAt = Math.max(...connected.map((id) => answers[id].submittedAt))
  return Math.min(timeUp, lastAnswerAt + ALL_ANSWERED_DELAY_S * 1000)
}

// État attendu par une transition : si la session a déjà changé (transition rejouée, autre
// appareil), la transition est ignorée.
export interface ExpectedPhase {
  status: GameStatus
  currentIndex: number
}

function phaseTimes(nowServer: number, durationS: number | null): SessionUpdate {
  return { phaseStartedAt: nowServer, phaseEndsAt: durationS === null ? 0 : nowServer + durationS * 1000 }
}

// Contenu de l'update qui fait passer à l'état suivant (STARTING → QUESTION → REVEAL → SCORES →
// QUESTION suivante ou END), ou null si la session n'est plus dans l'état attendu ou si aucune
// transition automatique n'existe. questions : questions de la partie (selectGameQuestions).
// audioUrls : adresses des extraits (blind test seulement).
export function transitionUpdate(
  session: Session,
  questions: readonly Question[],
  expected: ExpectedPhase,
  nowServer: number,
  audioUrls: AudioUrls = {},
): SessionUpdate | null {
  if (session.status !== expected.status || session.currentIndex !== expected.currentIndex) return null
  const { answerMode } = session.settings
  const questionCount = session.questionCount ?? questions.length
  const upcoming = questions[session.status === 'scores' ? session.currentIndex + 1 : session.currentIndex]
  const phase = nextPhase(session.status, { answerMode, currentIndex: session.currentIndex, questionCount }, upcoming?.timeLimit)
  if (!phase || session.status === 'lobby') return null

  const base = { status: phase.status, currentIndex: phase.currentIndex, ...phaseTimes(nowServer, phase.durationS) }
  switch (phase.status) {
    case 'question': {
      const question = questions[phase.currentIndex]
      if (!question) return null
      // reveal est effacé au passage à la question suivante (spec 7).
      return { ...base, currentQuestion: toPublicQuestion(question, answerMode, audioUrls[question.id]), reveal: null }
    }
    case 'reveal': {
      const question = questions[session.currentIndex]
      if (!question) return null
      return { ...base, ...revealPaths(session, buildReveal(question, session)) }
    }
    case 'ended':
      return { ...base, currentQuestion: null, reveal: null }
    default:
      return base
  }
}

function revealPaths(session: Session, { reveal, results, scores, ranks }: RevealResult): SessionUpdate {
  const update: SessionUpdate = { reveal }
  for (const [playerId, result] of Object.entries(results)) {
    update[`answers/${session.currentIndex}/${playerId}/correct`] = result.correct
    update[`answers/${session.currentIndex}/${playerId}/points`] = result.points
  }
  for (const playerId of Object.keys(scores)) {
    update[`players/${playerId}/score`] = scores[playerId]
    update[`players/${playerId}/rank`] = ranks[playerId]
  }
  return update
}

// Blind test : republie l'adresse renouvelée de l'extrait en cours (question, révélation ou pause,
// par exemple à la reprise après une longue pause), ou null s'il n'y a rien à changer.
export function audioUrlUpdate(
  session: Session,
  questions: readonly Question[],
  audioUrls: AudioUrls,
): SessionUpdate | null {
  const published = session.currentQuestion?.audio
  const question = questions[session.currentIndex]
  const url = question ? audioUrls[question.id] : undefined
  if (!published || !url || url === published.url) return null
  return { 'currentQuestion/audio/url': url }
}

export type LaunchRefusal =
  | 'notLobby'
  | 'freeAnswerSoon'
  | 'notEnoughPlayers'
  | 'tooManyPlayers'
  | 'noQuestions'
  | 'blindTestDisabled'
  | 'audioUnavailable'

// Blind test : interrupteur à distance (config/blindTestEnabled) et adresses des extraits.
export interface LaunchAudio {
  enabled: boolean
  urls: AudioUrls
}

export type LaunchResult = { ok: true; update: SessionUpdate } | { ok: false; reason: LaunchRefusal }

// Lancement (LOBBY → STARTING) : questionCount fixé, scores remis à zéro, réponses effacées.
// Refusé, avec la raison, si la partie ne peut pas commencer. Blind test : refusé si l'interrupteur
// est coupé ou s'il manque l'adresse d'un extrait.
export function launchUpdate(
  session: Session,
  questions: readonly Question[],
  nowServer: number,
  limit = QUESTIONS_PER_GAME,
  audio: LaunchAudio = { enabled: false, urls: {} },
): LaunchResult {
  if (session.status !== 'lobby') return { ok: false, reason: 'notLobby' }
  // 3.6 : seul le mode Choix multiples est jouable.
  if (session.settings.answerMode === 'free') return { ok: false, reason: 'freeAnswerSoon' }
  if (!canLaunchGame(session.players)) return { ok: false, reason: 'notEnoughPlayers' }
  if (Object.keys(session.players).length > MAX_PLAYERS) return { ok: false, reason: 'tooManyPlayers' }
  const gameQuestions = selectGameQuestions(questions, limit)
  if (gameQuestions.length === 0) return { ok: false, reason: 'noQuestions' }
  const musicQuestions = gameQuestions.filter((question) => question.music)
  if (musicQuestions.length > 0 && !audio.enabled) return { ok: false, reason: 'blindTestDisabled' }
  if (musicQuestions.some((question) => !audio.urls[question.id])) return { ok: false, reason: 'audioUnavailable' }

  const update: SessionUpdate = {
    status: 'starting',
    questionCount: gameQuestions.length,
    currentIndex: 0,
    ...phaseTimes(nowServer, STARTING_DURATION_S),
    currentQuestion: null,
    reveal: null,
    answers: null,
    answeredBy: null,
  }
  for (const playerId of Object.keys(session.players)) {
    update[`players/${playerId}/score`] = 0
    update[`players/${playerId}/rank`] = 1
  }
  return { ok: true, update }
}

const PAUSABLE: readonly GameStatus[] = ['starting', 'question', 'reveal', 'scores']

// Pause : on mémorise l'état et le temps restant de la phase (jamais négatif).
export function pauseUpdate(session: Session, nowServer: number): SessionUpdate | null {
  if (!PAUSABLE.includes(session.status)) return null
  return {
    status: 'paused',
    pausedFrom: session.status,
    remainingMs: Math.max(0, session.phaseEndsAt - nowServer),
  }
}

// Reprise : retour à l'état mémorisé, nouvelle fin = heure du serveur + temps restant.
// phaseStartedAt est décalé d'autant : la durée de la phase reste la même, donc la barre du
// téléphone et l'anneau de la TV (proportion du temps restant) reprennent au bon endroit.
// Le bonus de rapidité, lui, ne dépend que de phaseEndsAt (voir spec 6.2 pour la pause).
export function resumeUpdate(session: Session, nowServer: number): SessionUpdate | null {
  if (session.status !== 'paused' || !session.pausedFrom) return null
  const phaseEndsAt = nowServer + (session.remainingMs ?? 0)
  return {
    status: session.pausedFrom,
    // Décalé comme la fin : la barre et l'anneau (proportion du temps restant) restent justes.
    phaseStartedAt: session.phaseStartedAt + (phaseEndsAt - session.phaseEndsAt),
    phaseEndsAt,
    pausedFrom: null,
    remainingMs: null,
  }
}

// Verrou d'une transition en cours d'écriture. Une écriture hors ligne reste en attente dans
// Firebase : au-delà de TRANSITION_LOCK_MAX_MS, le verrou est relâché pour ne pas bloquer la partie.
export interface TransitionLock {
  key: string
  since: number
}

export function transitionKey(expected: ExpectedPhase): string {
  return `${expected.status}/${expected.currentIndex}`
}

export function isTransitionLocked(lock: TransitionLock | null, key: string, nowMs: number): boolean {
  return lock !== null && lock.key === key && nowMs - lock.since < TRANSITION_LOCK_MAX_MS
}

// Partie que l'hôte peut reprendre après une relance de l'app : elle existe, n'est pas terminée,
// et il en est l'hôte. Sinon, le code mémorisé sur l'appareil doit être effacé.
export function isResumableBy(game: { hostUid?: PlayerId; status?: GameStatus } | null, uid: PlayerId): boolean {
  return game !== null && game.hostUid === uid && game.status !== undefined && game.status !== 'ended'
}

// États où une partie est en cours : de STARTING à PAUSED (LOBBY et END exclus).
const IN_PROGRESS: readonly GameStatus[] = ['starting', 'question', 'reveal', 'scores', 'validation', 'paused']

// Terminer (contrôle de l'hôte) : fin immédiate, avec le classement actuel. Une question en
// cours n'est pas comptée (scores = ceux de la dernière révélation). Possible pendant la pause.
export function endUpdate(session: Session, nowServer: number): SessionUpdate | null {
  if (!IN_PROGRESS.includes(session.status)) return null
  return {
    status: 'ended',
    phaseStartedAt: nowServer,
    phaseEndsAt: 0,
    currentQuestion: null,
    reveal: null,
    pausedFrom: null,
    remainingMs: null,
  }
}

// Rejouer (fin de partie) : retour au LOBBY avec le même code et les mêmes joueurs ; scores,
// rangs, réponses et nombre de questions effacés. Les mêmes questions seront rejouées.
export function replayUpdate(session: Session, nowServer: number): SessionUpdate | null {
  if (session.status !== 'ended') return null
  const update: SessionUpdate = {
    status: 'lobby',
    currentIndex: 0,
    phaseStartedAt: nowServer,
    phaseEndsAt: 0,
    questionCount: null,
    currentQuestion: null,
    reveal: null,
    answers: null,
    answeredBy: null,
    pausedFrom: null,
    remainingMs: null,
  }
  for (const playerId of Object.keys(session.players)) {
    update[`players/${playerId}/score`] = null
    update[`players/${playerId}/rank`] = null
  }
  return update
}

// Ce que « Passer » va faire, pour un libellé explicite sur le bouton de l'hôte.
export type SkipTarget = 'firstQuestion' | 'reveal' | 'scores' | 'nextQuestion' | 'finalRanking'

export interface HostControls {
  skip: SkipTarget | null
  canPause: boolean
  canResume: boolean
  canEnd: boolean
  // Fin de partie : Rejouer et Quitter.
  canReplay: boolean
}

// Contrôles disponibles pour l'hôte selon l'état de la partie : aucun en LOBBY (le lancement a
// son propre bouton) ; en END, seulement Rejouer et Quitter.
export function hostControls(session: Session): HostControls {
  const canEnd = IN_PROGRESS.includes(session.status)
  const skip = skipTarget(session)
  return {
    skip,
    canPause: PAUSABLE.includes(session.status),
    canResume: session.status === 'paused',
    canEnd,
    canReplay: session.status === 'ended',
  }
}

function skipTarget(session: Session): SkipTarget | null {
  switch (session.status) {
    case 'starting':
      return 'firstQuestion'
    case 'question':
      return 'reveal'
    case 'reveal':
      return 'scores'
    case 'scores':
      return session.currentIndex + 1 < (session.questionCount ?? 0) ? 'nextQuestion' : 'finalRanking'
    default:
      return null
  }
}
