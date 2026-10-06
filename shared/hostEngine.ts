import { extractOf } from './audioPlayback'
import { bluffRevealData, buildVoteChoices, isBluffQuestion, voteDeadline, writingDeadline } from './bluff'
import {
  ALL_ANSWERED_DELAY_S,
  CORRECT_ANSWER_POINTS,
  MAX_PLAYERS,
  QUESTIONS_PER_GAME,
  REVEAL_GRACE_MS,
  STARTING_DURATION_S,
  TRANSITION_LOCK_MAX_MS,
} from './constants'
import {
  acceptedParts,
  groupFreeAnswers,
  matchFreeAnswer,
  publicFreeAnswerGroups,
  resultOf,
  type AcceptedParts,
  type ValidationDecisions,
} from './freeAnswers'
import { hasValidationPhase, isAwaitingHost, isUntimedPhase, nextPhase, questionDurationS } from './gameFlow'
import { canLaunchGame, connectedPlayerIds } from './players'
import { computeRanks } from './ranking'
import { computePoints } from './scoring'
import {
  activeTeams,
  teamCountOf,
  teamLaunchRefusal,
  teamPresenceSnapshot,
  teamQuestionPoints,
  teamStandings,
  type TeamRefusal,
} from './teams'
import type {
  Answer,
  AnswerMode,
  BluffQuestion,
  ChoiceOptions,
  GameQuestion,
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
export function selectGameQuestions<T extends GameQuestion>(questions: readonly T[], limit = QUESTIONS_PER_GAME): T[] {
  return questions.slice(0, Math.max(0, Math.min(limit, QUESTIONS_PER_GAME)))
}

// Blind test : adresses temporaires des extraits, par identifiant de question, fournies par l'hôte
// (récupérées auprès de la source audio, renouvelées avant expiration).
export type AudioUrls = Readonly<Record<string, string>>

// Question publiée pendant QUESTION : jamais correctIndex, acceptedAnswers ni explanation.
// En Réponse libre, les propositions ne sont pas envoyées (elles contiennent la bonne réponse) ;
// un blind test publie ce qu'il faut écrire (ask : titre, artiste ou les deux).
// Blind test : seulement l'adresse de l'extrait, jamais l'identifiant, le titre ni l'artiste.
// Bluff : l'énoncé seul (les choix sont publiés au début du vote, sans la vraie réponse désignée).
export function toPublicQuestion(question: GameQuestion, answerMode: AnswerMode, audioUrl?: string): PublicQuestion {
  const published: PublicQuestion = {
    text: question.text,
    difficulty: question.difficulty,
    timeLimit: questionDurationS(answerMode, question.timeLimit),
  }
  if (isBluffQuestion(question)) return published
  if (answerMode === 'choice') published.options = [...question.options] as ChoiceOptions
  if (answerMode === 'free' && question.music && question.ask) published.ask = question.ask
  if (question.music && audioUrl) published.audio = { url: audioUrl, ...extractOf(question.music, published.timeLimit) }
  return published
}

// Parties justes d'une réponse selon la correction automatique (en Réponse libre, blind test « both » :
// titre et artiste séparément).
function autoParts(question: Question, answer: Answer, answerMode: AnswerMode): AcceptedParts {
  if (answerMode === 'choice') return { main: typeof answer.value === 'number' && answer.value === question.correctIndex }
  if (typeof answer.value !== 'string') return { main: false }
  return acceptedParts(matchFreeAnswer(question, answer), answer)
}

// Réponse corrigée à la fin de la question : résultat automatique, et points d'une réponse
// entièrement juste (pour une réponse acceptée plus tard par l'hôte, en Contrôle).
export interface GradedAnswer extends PlayerResult {
  fullPoints: number
}

// Correction et points d'une réponse. Le temps restant se mesure sur l'heure du serveur :
// phaseEndsAt (fin de la question) moins submittedAt (écrit par le serveur).
export function gradeAnswer(
  question: Question,
  answer: Answer,
  settings: { answerMode: AnswerMode; speedBonus: boolean },
  phaseEndsAt: number,
): GradedAnswer {
  const fullPoints = computePoints({
    correct: true,
    speedBonus: settings.speedBonus,
    remainingMs: phaseEndsAt - answer.submittedAt,
    durationMs: questionDurationS(settings.answerMode, question.timeLimit) * 1000,
  })
  return { ...resultOf(autoParts(question, answer, settings.answerMode), fullPoints), fullPoints }
}

function publicResult({ correct, points, partial, parts }: PlayerResult): PlayerResult {
  return { correct, points, ...(partial && { partial }), ...(parts && { parts }) }
}

// Après la validation (Contrôle) : correction écrite à la fin de la question, revue par l'hôte.
// Une réponse sans fullPoints (écrite par une version précédente) vaut 100 points sans bonus.
function validatedResult(question: Question, answer: Answer, decisions: ValidationDecisions): PlayerResult {
  if (typeof answer.value !== 'string') return { correct: false, points: 0 }
  const parts = acceptedParts(matchFreeAnswer(question, answer), answer, decisions)
  return resultOf(parts, answer.fullPoints ?? CORRECT_ANSWER_POINTS)
}

export interface RevealResult {
  reveal: Reveal
  // Résultat de chaque joueur ayant répondu à la question courante.
  results: Record<PlayerId, PlayerResult>
  // Score total et rang de chaque joueur après cette question.
  scores: Record<PlayerId, number>
  ranks: Record<PlayerId, number>
}

// Score = somme des points stockés pour les questions précédentes (answers, ou bluffPoints en Bluff),
// plus ceux de la question révélée : rejouer la révélation ne compte jamais deux fois les mêmes points.
function totalScore(session: Session, playerId: PlayerId, current: PlayerResult | undefined): number {
  let total = current?.points ?? 0
  for (let index = 0; index < session.currentIndex; index++) {
    total += session.answers?.[index]?.[playerId]?.points ?? session.bluffPoints?.[index]?.[playerId] ?? 0
  }
  return total
}

function withScores(session: Session, reveal: Reveal, results: Record<PlayerId, PlayerResult>): RevealResult {
  const scores = Object.fromEntries(Object.keys(session.players).map((id) => [id, totalScore(session, id, results[id])]))
  return { reveal, results, scores, ranks: computeRanks(scores) }
}

// Bluff : révélation de la question courante (vraie réponse, choix avec auteurs et votants, points).
export function buildBluffReveal(question: BluffQuestion, session: Session): RevealResult {
  const { choices, results } = bluffRevealData(session)
  const reveal: Reveal = { correctAnswer: question.answer, stats: { bluffChoices: choices }, results }
  if (question.explanation) reveal.explanation = question.explanation
  return withScores(session, reveal, results)
}

// Résultat de chaque joueur ayant répondu : correction automatique à la fin de la question, ou,
// après une validation (decisions fourni), correction écrite à la fin de la question revue par l'hôte.
function questionResults(
  question: Question,
  session: Session,
  decisions?: ValidationDecisions,
): Record<PlayerId, PlayerResult> {
  const answers = session.answers?.[session.currentIndex] ?? {}
  const results: Record<PlayerId, PlayerResult> = {}
  for (const playerId of Object.keys(session.players)) {
    const answer = answers[playerId]
    if (!answer) continue
    results[playerId] = decisions
      ? validatedResult(question, answer, decisions)
      : publicResult(gradeAnswer(question, answer, session.settings, session.phaseEndsAt))
  }
  return results
}

// Révélation de la question courante : bonne réponse, répartition (Choix multiples) ou groupes de
// réponses filtrés (Réponse libre), résultats, scores et rangs. Tous les joueurs sont classés, y
// compris les déconnectés (ils gardent leur score, spec 6.6). decisions : après une validation.
export function buildReveal(question: Question, session: Session, decisions?: ValidationDecisions): RevealResult {
  const { answerMode } = session.settings
  const answers = session.answers?.[session.currentIndex] ?? {}
  const playerIds = Object.keys(session.players)
  const results = questionResults(question, session, decisions)
  const answered = Object.entries(answers).filter(([playerId]) => playerId in session.players)

  const reveal: Reveal = {
    correctAnswer: question.options[question.correctIndex],
    stats:
      answerMode === 'choice'
        ? { choiceCounts: question.options.map((_, index) => answered.filter(([, a]) => a.value === index).length) }
        : {
            freeAnswers: publicFreeAnswerGroups(
              groupFreeAnswers(question, answers, playerIds),
              results,
              decisions?.hidden,
            ),
          },
    results,
  }
  if (question.explanation) reveal.explanation = question.explanation
  if (question.music) {
    const { title, artist, source } = question.music
    reveal.music = { title, artist, source }
  }

  return withScores(session, reveal, results)
}

// Heure du serveur à laquelle l'hôte doit faire avancer la partie, ou null (LOBBY, PAUSED, END :
// seule une action de l'hôte fait avancer).
// QUESTION : fin du chrono plus une marge pour les dernières réponses, ou plus tôt si TOUS les
// joueurs connectés ont répondu (2 s après la dernière réponse, spec 5). Un joueur encore marqué
// connecté qui n'a pas répondu (présence en retard après un départ) empêche la fin anticipée :
// il ne peut que retarder la fin jusqu'au chrono, jamais l'avancer.
export function nextDeadline(session: Session): number | null {
  switch (session.status) {
    case 'reveal':
      // Pas à pas : la révélation (et le classement) attend l'hôte, aucune transition automatique.
      return isAwaitingHost(session) ? null : session.phaseEndsAt
    case 'scores':
      return isAwaitingHost(session) ? null : session.phaseEndsAt
    case 'starting':
      return session.phaseEndsAt
    case 'question':
      // Bluff : écriture des fausses réponses.
      return session.settings.answerMode === 'bluff' ? writingDeadline(session) : questionDeadline(session)
    case 'vote':
      return voteDeadline(session)
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

// Contenu de l'update qui fait passer à l'état suivant (STARTING → QUESTION → [VALIDATION →] REVEAL
// → SCORES → QUESTION suivante ou END), ou null si la session n'est plus dans l'état attendu ou si
// aucune transition automatique n'existe. questions : questions de la partie (selectGameQuestions).
// audioUrls : adresses des extraits (blind test seulement). decisions : décisions de l'hôte, pour
// la sortie de VALIDATION (voir validateUpdate).
export function transitionUpdate(
  session: Session,
  questions: readonly GameQuestion[],
  expected: ExpectedPhase,
  nowServer: number,
  audioUrls: AudioUrls = {},
  decisions: ValidationDecisions = {},
  random: () => number = Math.random,
): SessionUpdate | null {
  if (session.status !== expected.status || session.currentIndex !== expected.currentIndex) return null
  const { answerMode } = session.settings
  const questionCount = session.questionCount ?? questions.length
  const suspense = session.settings.suspense === true
  // Question qui démarre ensuite : la suivante après le classement, ou après la révélation en Suspense.
  const isBeforeNextQuestion = session.status === 'scores' || (session.status === 'reveal' && suspense)
  const upcoming = questions[isBeforeNextQuestion ? session.currentIndex + 1 : session.currentIndex]
  const context = {
    answerMode,
    currentIndex: session.currentIndex,
    questionCount,
    stepByStep: session.settings.stepByStep === true,
    suspense,
    validation: hasValidationPhase(session.settings),
    choiceCount: session.currentQuestion?.choices?.length,
  }
  const phase = nextPhase(session.status, context, upcoming?.timeLimit)
  if (!phase || session.status === 'lobby') return null

  const base = { status: phase.status, currentIndex: phase.currentIndex, ...phaseTimes(nowServer, phase.durationS) }
  switch (phase.status) {
    case 'question': {
      const question = questions[phase.currentIndex]
      if (!question) return null
      // reveal est effacé au passage à la question suivante (spec 7).
      return { ...base, currentQuestion: toPublicQuestion(question, answerMode, audioUrls[question.id]), reveal: null }
    }
    case 'vote': {
      // Bluff : choix publiés sans auteur ni type ; auteurs et index de chacun gardés pour la suite.
      const question = questions[session.currentIndex]
      if (!question || !isBluffQuestion(question)) return null
      return { ...base, ...votePaths(session, question, random) }
    }
    case 'validation': {
      // Correction automatique écrite dès la fin de la question (Rapidité calculée sur cette fin).
      const question = questions[session.currentIndex]
      if (!question || isBluffQuestion(question)) return null
      return { ...base, ...gradingPaths(session, question), ...teamPresencePaths(session) }
    }
    case 'reveal': {
      const question = questions[session.currentIndex]
      if (!question) return null
      if (isBluffQuestion(question)) {
        const result = buildBluffReveal(question, session)
        return { ...base, ...revealPaths(session, result), ...teamPresencePaths(session), ...teamPaths(session, result.results) }
      }
      const reviewed = session.status === 'validation' ? decisions : undefined
      const result = buildReveal(question, session, reviewed)
      // Joueurs comptés pour les équipes : figés à la fin de la question (avant une validation éventuelle).
      const presence = reviewed ? {} : teamPresencePaths(session)
      return { ...base, ...revealPaths(session, result), ...presence, ...teamPaths(session, result.results) }
    }
    case 'ended':
      return { ...base, currentQuestion: null, reveal: null }
    default:
      return base
  }
}

// Bluff, début du vote : choix mélangés publiés dans currentQuestion (textes seuls) ; types et auteurs
// gardés par l'hôte (bluffChoices) ; index de son propre choix pour chaque auteur (bluffOwn, lisible
// par lui seul : son écran le grise et les règles refusent ce vote).
function votePaths(session: Session, question: BluffQuestion, random: () => number): SessionUpdate {
  const index = session.currentIndex
  const { choices, own } = buildVoteChoices(question, session, random)
  return {
    'currentQuestion/choices': choices.map((choice) => choice.text),
    [`bluffChoices/${index}`]: choices,
    [`bluffOwn/${index}`]: Object.keys(own).length > 0 ? own : null,
  }
}

// Groupe : joueurs comptés pour les équipes à la fin de la question (connectés et dans une équipe).
function teamPresencePaths(session: Session): SessionUpdate {
  if (!session.settings.teams) return {}
  return { [`teamPresence/${session.currentIndex}`]: teamPresenceSnapshot(session.players) }
}

// Groupe : points d'équipe de la question (moyenne des joueurs comptés), puis score et rang de
// chaque équipe, recalculés depuis le début : rejouer la révélation ne compte rien deux fois.
function teamPaths(session: Session, results: Record<PlayerId, PlayerResult>): SessionUpdate {
  if (!session.settings.teams) return {}
  const index = session.currentIndex
  const teams = activeTeams(teamCountOf(session.settings, Object.keys(session.players).length))
  const presence = session.teamPresence?.[index] ?? teamPresenceSnapshot(session.players)
  const points = teamQuestionPoints(session.players, presence, results, teams)
  const standings = teamStandings({ ...session.teamPoints, [index]: points }, teams, index)
  const update: SessionUpdate = { [`teamPoints/${index}`]: points }
  for (const team of teams) update[`teams/${team}`] = standings[team]
  return update
}

// « Valider » (Contrôle) : révélation avec les décisions de l'hôte, ou null hors de VALIDATION.
export function validateUpdate(
  session: Session,
  questions: readonly Question[],
  decisions: ValidationDecisions,
  nowServer: number,
): SessionUpdate | null {
  if (session.status !== 'validation') return null
  const expected = { status: session.status, currentIndex: session.currentIndex }
  return transitionUpdate(session, questions, expected, nowServer, {}, decisions)
}

function resultPaths(session: Session, playerId: PlayerId, result: PlayerResult): SessionUpdate {
  const path = `answers/${session.currentIndex}/${playerId}`
  return {
    [`${path}/correct`]: result.correct,
    [`${path}/points`]: result.points,
    [`${path}/partial`]: result.partial ?? null,
  }
}

// Fin de la question avec Contrôle : correction automatique et points d'une réponse entièrement juste.
function gradingPaths(session: Session, question: Question): SessionUpdate {
  const answers = session.answers?.[session.currentIndex] ?? {}
  const update: SessionUpdate = {}
  for (const playerId of Object.keys(session.players)) {
    const answer = answers[playerId]
    if (!answer) continue
    const graded = gradeAnswer(question, answer, session.settings, session.phaseEndsAt)
    Object.assign(update, resultPaths(session, playerId, graded))
    update[`answers/${session.currentIndex}/${playerId}/fullPoints`] = graded.fullPoints
  }
  return update
}

// Points de la question : dans answers, ou dans bluffPoints en Bluff (un joueur peut y marquer des
// points sans avoir voté, grâce à sa proposition).
function revealPaths(session: Session, { reveal, results, scores, ranks }: RevealResult): SessionUpdate {
  const update: SessionUpdate = { reveal }
  const isBluff = session.settings.answerMode === 'bluff'
  for (const [playerId, result] of Object.entries(results)) {
    if (isBluff) update[`bluffPoints/${session.currentIndex}/${playerId}`] = result.points
    else Object.assign(update, resultPaths(session, playerId, result))
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
  questions: readonly GameQuestion[],
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
  | 'notEnoughPlayers'
  | 'tooManyPlayers'
  | 'noQuestions'
  | 'blindTestDisabled'
  | 'audioUnavailable'
  | TeamRefusal

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
  questions: readonly GameQuestion[],
  nowServer: number,
  limit = QUESTIONS_PER_GAME,
  audio: LaunchAudio = { enabled: false, urls: {} },
): LaunchResult {
  if (session.status !== 'lobby') return { ok: false, reason: 'notLobby' }
  if (!canLaunchGame(session.players)) return { ok: false, reason: 'notEnoughPlayers' }
  if (Object.keys(session.players).length > MAX_PLAYERS) return { ok: false, reason: 'tooManyPlayers' }
  const teamRefusal = teamLaunchRefusal(session)
  if (teamRefusal) return { ok: false, reason: teamRefusal }
  const gameQuestions = selectGameQuestions(questions, limit)
  if (gameQuestions.length === 0) return { ok: false, reason: 'noQuestions' }
  const musicQuestions = gameQuestions.filter((question) => !isBluffQuestion(question) && question.music)
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
    teams: null,
    teamPoints: null,
    teamPresence: null,
    ...BLUFF_RESET,
  }
  for (const playerId of Object.keys(session.players)) {
    update[`players/${playerId}/score`] = 0
    update[`players/${playerId}/rank`] = 1
  }
  // Groupe : nombre d'équipes figé au lancement (les joueurs ne changent plus).
  if (session.settings.teams) {
    update['settings/teamCount'] = teamCountOf(session.settings, Object.keys(session.players).length)
  }
  return { ok: true, update }
}

// Bluff : nœuds effacés au lancement et à « Rejouer ».
const BLUFF_RESET: SessionUpdate = {
  bluffs: null,
  bluffChecks: null,
  bluffedBy: null,
  bluffChoices: null,
  bluffOwn: null,
  votes: null,
  votedBy: null,
  bluffPoints: null,
}

const PAUSABLE: readonly GameStatus[] = ['starting', 'question', 'vote', 'validation', 'reveal', 'scores']

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
  // Phase sans échéance (validation, attente du Pas à pas) : elle le reste ; sinon elle
  // repartirait aussitôt.
  if (isUntimedPhase({ status: session.pausedFrom, settings: session.settings })) {
    return { status: session.pausedFrom, phaseEndsAt: 0, pausedFrom: null, remainingMs: null }
  }
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
const IN_PROGRESS: readonly GameStatus[] = ['starting', 'question', 'vote', 'reveal', 'scores', 'validation', 'paused']

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
// Groupe : les équipes sont gardées (seuls leurs scores sont effacés).
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
    teams: null,
    teamPoints: null,
    teamPresence: null,
    ...BLUFF_RESET,
  }
  for (const playerId of Object.keys(session.players)) {
    update[`players/${playerId}/score`] = null
    update[`players/${playerId}/rank`] = null
  }
  return update
}

// Ce que « Passer » va faire, pour un libellé explicite sur le bouton de l'hôte.
export type SkipTarget = 'firstQuestion' | 'vote' | 'validation' | 'reveal' | 'scores' | 'nextQuestion' | 'finalRanking'

export type AwaitingNext = 'ranking' | 'nextQuestion' | 'finalRanking'

// Destination du bouton de l'hôte en pas à pas : révélation → classement ; classement → question
// suivante, ou classement final après la dernière question.
function awaitingNextOf(session: Session): AwaitingNext | null {
  if (!isAwaitingHost(session)) return null
  // Suspense : pas de classement intermédiaire, la révélation mène à la suite.
  if (session.status === 'reveal' && !session.settings.suspense) return 'ranking'
  return afterQuestionTarget(session)
}

// Après une question : question suivante, ou classement final après la dernière.
function afterQuestionTarget(session: Session): 'nextQuestion' | 'finalRanking' {
  return session.currentIndex + 1 < (session.questionCount ?? 0) ? 'nextQuestion' : 'finalRanking'
}

export interface HostControls {
  skip: SkipTarget | null
  canPause: boolean
  canResume: boolean
  canEnd: boolean
  // Fin de partie : Rejouer et Quitter.
  canReplay: boolean
  // Pas à pas, phase en attente : gros bouton nommé d'après sa destination (classement, question
  // suivante, classement final). Même transition que Passer. null sinon (pause comprise).
  awaitingNext: AwaitingNext | null
  // Contrôle, phase VALIDATION : gros bouton « Valider les réponses » (validateUpdate).
  canValidate: boolean
  // Bluff, vote sans minuteur : gros bouton « Clore le vote » (même transition que Passer, avec une
  // confirmation s'il manque des votes). Passer n'est alors pas proposé dans le panneau.
  canCloseVote: boolean
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
    awaitingNext: awaitingNextOf(session),
    canValidate: session.status === 'validation',
    canCloseVote: session.status === 'vote',
  }
}

function skipTarget(session: Session): SkipTarget | null {
  switch (session.status) {
    case 'starting':
      return 'firstQuestion'
    case 'question':
      if (session.settings.answerMode === 'bluff') return 'vote'
      return hasValidationPhase(session.settings) ? 'validation' : 'reveal'
    case 'vote':
      // « Clore le vote » (gros bouton, avec confirmation) remplace Passer.
      return null
    case 'validation':
      // Même chose que « Valider les réponses » avec les décisions automatiques.
      return 'reveal'
    case 'reveal':
      return session.settings.suspense ? afterQuestionTarget(session) : 'scores'
    case 'scores':
      return afterQuestionTarget(session)
    default:
      return null
  }
}
