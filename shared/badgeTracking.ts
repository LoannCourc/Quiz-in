import {
  COMEBACK_MIN_PLAYERS,
  PERFECT_MIN_QUESTIONS,
  type BadgeGame,
  type BadgeRole,
  type FinishedGame,
  type PlayerGameOutcome,
} from './badges'
import { computeRanks } from './ranking'
import type { PlayerId, PublicSession } from './types'

// Badges : suivi d'une partie vue depuis la session publique, sur le téléphone d'un joueur (l'hôte qui joue
// compris) ou de l'hôte qui ne joue pas. Rien n'est lu ni écrit en plus dans la base. Une partie est
// « terminée » si ce téléphone a vu la révélation de sa dernière question puis l'écran de fin : « Terminer la
// partie » avant la dernière révélation, ou une partie quittée, ne comptent pas.

export const TRACKED_GAME_VERSION = 1

export interface TrackedGame {
  v: number
  code: string
  role: BadgeRole
  quizId: string
  questionCount: number
  game: BadgeGame
  // Questions (ou manches) dont la révélation a été vue.
  revealed: number[]
  // Joueur : questions entièrement justes (une réponse à moitié juste ne compte pas).
  correct: number[]
  fastestCorrectMs: number | null
  bluffFooled: number
  drawGuessed: number
  // Comeback : dernier à la moitié de la partie (voir isLastAtHalf).
  lastAtHalf: boolean
}

export interface TrackContext {
  code: string
  uid: PlayerId
  role: BadgeRole
  // Temps de réponse mesuré sur le téléphone pour la question index (affichage → appui), ou null.
  answerMs: (index: number) => number | null
}

type TrackedSession = Pick<
  PublicSession,
  'quizId' | 'status' | 'settings' | 'currentIndex' | 'questionCount' | 'phaseStartedAt' | 'currentQuestion' | 'reveal' | 'players' | 'teams' | 'drawTurn'
>

function gameOf(session: TrackedSession, previous: BadgeGame | undefined): BadgeGame {
  const { answerMode } = session.settings
  if (answerMode === 'bluff') return 'bluff'
  if (answerMode === 'draw') return 'draw'
  if (previous === 'blindTest' || session.currentQuestion?.audio || session.reveal?.music) return 'blindTest'
  return 'quiz'
}

function freshGame(session: TrackedSession, context: TrackContext, questionCount: number): TrackedGame {
  return {
    v: TRACKED_GAME_VERSION,
    code: context.code,
    role: context.role,
    quizId: session.quizId,
    questionCount,
    game: gameOf(session, undefined),
    revealed: [],
    correct: [],
    fastestCorrectMs: null,
    bluffFooled: 0,
    drawGuessed: 0,
    lastAtHalf: false,
  }
}

// Même partie que celle suivie ? Autre code, autre quiz, autre nombre de questions, autre rôle, ou retour à
// une question déjà dépassée : une nouvelle partie (« Changer de jeu » garde le code).
function isSameGame(tracked: TrackedGame, session: TrackedSession, context: TrackContext, questionCount: number): boolean {
  return (
    tracked.code === context.code &&
    tracked.role === context.role &&
    tracked.quizId === session.quizId &&
    tracked.questionCount === questionCount &&
    session.currentIndex >= Math.max(-1, ...tracked.revealed)
  )
}

// Moitié de la partie : révélation de la question ⌈n / 2⌉ (la 5e sur 10, la 4e manche sur 8).
export function halfIndex(questionCount: number): number {
  return Math.ceil(questionCount / 2) - 1
}

// Dernier : score le plus bas (égalité comprise) et strictement sous le meilleur (tous à égalité : personne).
export function isLastAtHalf(players: PublicSession['players'], uid: PlayerId): boolean {
  const scores = Object.values(players).map((player) => player.score ?? 0)
  const mine = players[uid]?.score
  if (mine === undefined || scores.length < COMEBACK_MIN_PLAYERS) return false
  return mine === Math.min(...scores) && mine < Math.max(...scores)
}

function bluffFooledAt(session: TrackedSession, uid: PlayerId): number {
  const choices = session.reveal?.stats?.bluffChoices ?? []
  return choices
    .filter((choice) => choice.authors?.includes(uid))
    .reduce((total, choice) => total + (choice.voters ?? []).filter((voter) => voter !== uid).length, 0)
}

function drawGuessedAt(session: TrackedSession, uid: PlayerId): number {
  if (session.drawTurn?.drawer !== uid || session.reveal?.stats?.drawCancelled) return 0
  return Object.entries(session.reveal?.results ?? {}).filter(([id, result]) => id !== uid && result.correct).length
}

// Révélation vue : ce qu'elle apporte au joueur (l'organisateur ne retient que la question).
function withReveal(tracked: TrackedGame, session: TrackedSession, context: TrackContext, game: BadgeGame): TrackedGame {
  const index = session.currentIndex
  const next = { ...tracked, game, revealed: [...tracked.revealed, index] }
  if (context.role !== 'player') return next
  const result = session.reveal?.results?.[context.uid]
  const isCorrect = result?.correct === true && result.partial !== true
  const answerMs = isCorrect && (game === 'quiz' || game === 'blindTest') ? context.answerMs(index) : null
  return {
    ...next,
    correct: isCorrect ? [...tracked.correct, index] : tracked.correct,
    fastestCorrectMs: answerMs === null ? tracked.fastestCorrectMs : Math.min(tracked.fastestCorrectMs ?? answerMs, answerMs),
    bluffFooled: tracked.bluffFooled + (game === 'bluff' ? bluffFooledAt(session, context.uid) : 0),
    drawGuessed: tracked.drawGuessed + (game === 'draw' ? drawGuessedAt(session, context.uid) : 0),
    lastAtHalf: index === halfIndex(tracked.questionCount) && !session.settings.teams ? isLastAtHalf(session.players, context.uid) : tracked.lastAtHalf,
  }
}

// Nouvel état de la partie suivie à chaque changement de la session. Renvoie l'objet reçu s'il ne change pas
// (rien à écrire). Salon : plus de partie suivie. Écran de fin : inchangé (voir finishedGameOf).
export function trackSession(tracked: TrackedGame | null, session: TrackedSession, context: TrackContext): TrackedGame | null {
  if (session.status === 'lobby') return null
  if (session.status === 'ended') return tracked
  const questionCount = session.questionCount
  if (questionCount === undefined || questionCount <= 0) return tracked
  const current = tracked && isSameGame(tracked, session, context, questionCount) ? tracked : freshGame(session, context, questionCount)
  const game = gameOf(session, current.game)
  const isRevealShown = session.reveal != null && (session.status === 'reveal' || session.status === 'scores')
  if (isRevealShown && !current.revealed.includes(session.currentIndex)) return withReveal(current, session, context, game)
  if (game !== current.game) return { ...current, game }
  return current === tracked ? tracked : current
}

function isWinner(session: TrackedSession, uid: PlayerId): boolean {
  if (session.settings.teams) {
    const team = session.players[uid]?.team
    return team !== undefined && session.teams?.[team]?.rank === 1
  }
  const ranks = computeRanks(Object.fromEntries(Object.entries(session.players).map(([id, player]) => [id, player.score ?? 0])))
  return ranks[uid] === 1
}

function outcomeOf(tracked: TrackedGame, session: TrackedSession, uid: PlayerId, playerCount: number): PlayerGameOutcome {
  const won = isWinner(session, uid)
  return {
    won,
    perfect: tracked.game === 'quiz' && tracked.questionCount >= PERFECT_MIN_QUESTIONS && new Set(tracked.correct).size === tracked.questionCount,
    comeback: won && tracked.lastAtHalf && !session.settings.teams && playerCount >= COMEBACK_MIN_PLAYERS,
    fastestCorrectMs: tracked.fastestCorrectMs,
    bluffFooled: tracked.bluffFooled,
    drawGuessed: tracked.drawGuessed,
  }
}

// Partie terminée à compter, ou null : pas sur l'écran de fin, autre partie, dernière révélation pas vue,
// joueur absent de la partie.
export function finishedGameOf(
  tracked: TrackedGame | null,
  session: TrackedSession,
  context: { code: string; uid: PlayerId; localDay: string },
): FinishedGame | null {
  if (session.status !== 'ended' || !tracked || tracked.code !== context.code) return null
  if (!tracked.revealed.includes(tracked.questionCount - 1)) return null
  const playerCount = Object.keys(session.players).length
  const base = {
    gameKey: `${context.code}:${session.phaseStartedAt}`,
    role: tracked.role,
    game: tracked.game,
    playerCount,
    questionCount: tracked.questionCount,
    localDay: context.localDay,
  }
  if (tracked.role === 'organizer') return base
  if (!session.players[context.uid]) return null
  return { ...base, outcome: outcomeOf(tracked, session, context.uid, playerCount) }
}

// Partie suivie relue du stockage : null si illisible ou d'une autre version (on repart de la question en cours).
export function parseTrackedGame(raw: unknown): TrackedGame | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = raw as Partial<TrackedGame>
  const isNumberList = (list: unknown) => Array.isArray(list) && list.every((item) => Number.isInteger(item))
  const isValid =
    value.v === TRACKED_GAME_VERSION &&
    typeof value.code === 'string' &&
    (value.role === 'player' || value.role === 'organizer') &&
    typeof value.quizId === 'string' &&
    Number.isInteger(value.questionCount) &&
    (value.game === 'quiz' || value.game === 'blindTest' || value.game === 'bluff' || value.game === 'draw') &&
    isNumberList(value.revealed) &&
    isNumberList(value.correct) &&
    (value.fastestCorrectMs === null || typeof value.fastestCorrectMs === 'number') &&
    typeof value.bluffFooled === 'number' &&
    typeof value.drawGuessed === 'number' &&
    typeof value.lastAtHalf === 'boolean'
  return isValid ? (value as TrackedGame) : null
}

// Chronomètre des réponses (Rapide comme l'éclair) : de la première fois que la question index est affichée
// sur ce téléphone jusqu'au dernier appui qui envoie une réponse. En mémoire seulement : une app relancée en
// pleine question ne mesure rien pour cette question.
export interface AnswerClock {
  questionShown: (code: string, index: number) => void
  answerGiven: (code: string, index: number) => void
  answerMs: (code: string, index: number) => number | null
}

const CLOCK_ENTRIES_KEPT = 40

export function createAnswerClock(now: () => number): AnswerClock {
  const entries = new Map<string, { shownAt: number; answeredAt?: number }>()
  const keyOf = (code: string, index: number) => `${code}:${index}`
  return {
    questionShown(code, index) {
      const key = keyOf(code, index)
      if (entries.has(key)) return
      entries.set(key, { shownAt: now() })
      if (entries.size > CLOCK_ENTRIES_KEPT) entries.delete(entries.keys().next().value as string)
    },
    answerGiven(code, index) {
      const entry = entries.get(keyOf(code, index))
      if (entry) entry.answeredAt = now()
    },
    answerMs(code, index) {
      const entry = entries.get(keyOf(code, index))
      return entry?.answeredAt === undefined ? null : Math.max(0, entry.answeredAt - entry.shownAt)
    },
  }
}
