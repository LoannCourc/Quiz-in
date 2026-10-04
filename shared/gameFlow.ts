import {
  NEXT_QUESTION_ANNOUNCE_MS,
  QUESTION_DURATION_S,
  REVEAL_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
} from './constants'
import type { AnswerMode, GameStatus, PublicSession } from './types'

// Enchaînement des états du MVP (spec 5), sans VALIDATION (option Contrôle, P1).
// PAUSED n'a pas d'état suivant fixe : la reprise revient à pausedFrom avec remainingMs.

export interface FlowContext {
  answerMode: AnswerMode
  // Index de la question courante (0 pour la première) et nombre de questions de la partie.
  currentIndex: number
  questionCount: number
  // Pas à pas : la révélation et le classement n'ont pas de durée, seule l'action de l'hôte fait avancer.
  stepByStep?: boolean
  // Suspense : pas de classement intermédiaire (révélation → question suivante, ou fin de partie).
  suspense?: boolean
}

export interface Phase {
  status: GameStatus
  // Index de la question pendant cette phase.
  currentIndex: number
  // Durée automatique en secondes ; null quand seule une action de l'hôte fait avancer.
  durationS: number | null
}

// Durée de QUESTION : celle de la question si elle en a une (spec 6.1), sinon celle du mode.
export function questionDurationS(answerMode: AnswerMode, timeLimitS?: number): number {
  return timeLimitS ?? QUESTION_DURATION_S[answerMode]
}

// Après une question (classement, ou révélation en Suspense) : question suivante, ou fin de partie.
function afterQuestion({ answerMode, currentIndex, questionCount }: FlowContext, timeLimitS?: number): Phase {
  const nextIndex = currentIndex + 1
  return nextIndex < questionCount
    ? { status: 'question', currentIndex: nextIndex, durationS: questionDurationS(answerMode, timeLimitS) }
    : { status: 'ended', currentIndex, durationS: null }
}

// Phase qui suit `status`, ou null s'il n'y en a pas (ENDED, PAUSED, états P1).
// timeLimitS : durée propre à la question suivante, si elle en a une.
export function nextPhase(status: GameStatus, context: FlowContext, timeLimitS?: number): Phase | null {
  const { answerMode, currentIndex, stepByStep = false, suspense = false } = context
  switch (status) {
    case 'lobby':
      return { status: 'starting', currentIndex: 0, durationS: STARTING_DURATION_S }
    case 'starting':
      return { status: 'question', currentIndex: 0, durationS: questionDurationS(answerMode, timeLimitS) }
    case 'question':
      return { status: 'reveal', currentIndex, durationS: stepByStep ? null : REVEAL_DURATION_S[answerMode] }
    case 'reveal':
      return suspense
        ? afterQuestion(context, timeLimitS)
        : { status: 'scores', currentIndex, durationS: stepByStep ? null : SCORES_DURATION_S }
    case 'scores':
      return afterQuestion(context, timeLimitS)
    case 'validation':
    case 'paused':
    case 'ended':
      return null
  }
}

// Attente entre deux questions (révélation puis classement), calculée sur la session seule.
export interface NextQuestionCountdown {
  // Début de l'attente (début de la révélation) et heure de la question suivante (heure serveur).
  startsAt: number
  endsAt: number
  // Après la dernière question, l'attente mène au classement final, pas à une question.
  isLastQuestion: boolean
}

// Pendant REVEAL : fin de la révélation + durée du classement. Pendant SCORES : fin du classement.
// null dans les autres états. Approximation si l'hôte a écourté une phase (« Passer »).
export function nextQuestionCountdown(session: SessionTiming): NextQuestionCountdown | null {
  const revealMs = REVEAL_DURATION_S[session.settings.answerMode] * 1000
  const isLastQuestion = session.currentIndex + 1 >= (session.questionCount ?? 0)
  // Pas à pas : pas de compte à rebours pendant l'attente (révélation et classement).
  if (isAwaitingHost(session)) return null
  if (session.status === 'reveal') {
    // Suspense : pas de classement après la révélation, la question suivante arrive à sa fin.
    const scoresMs = session.settings.suspense ? 0 : SCORES_DURATION_S * 1000
    return { startsAt: session.phaseStartedAt, endsAt: session.phaseEndsAt + scoresMs, isLastQuestion }
  }
  if (session.status === 'scores') {
    return { startsAt: session.phaseStartedAt - revealMs, endsAt: session.phaseEndsAt, isLastQuestion }
  }
  return null
}

// Numéro (à partir de 1) de la question annoncée pendant le classement : la suivante. null après
// la dernière question.
export function upcomingQuestionNumber(session: SessionTiming): number | null {
  const next = session.currentIndex + 1
  return next < (session.questionCount ?? 0) ? next + 1 : null
}

// Annonce plein écran « QUESTION n/N » pendant les dernières secondes du classement, sans
// allonger la phase.
export function isAnnouncingNextQuestion(session: SessionTiming, nowServer: number): boolean {
  return (
    session.status === 'scores' &&
    // Pas à pas : classement sans échéance (phaseEndsAt = 0), jamais d'annonce.
    !isAwaitingHost(session) &&
    upcomingQuestionNumber(session) !== null &&
    session.phaseEndsAt - nowServer <= NEXT_QUESTION_ANNOUNCE_MS
  )
}

// Champs de la session utiles au déroulé (partie publique : lisible par les joueurs et la TV).
// Pas à pas : révélation ou classement en attente de l'hôte, sans fin programmée.
export function isAwaitingHost(session: Pick<PublicSession, 'status' | 'settings'>): boolean {
  return (session.status === 'reveal' || session.status === 'scores') && session.settings.stepByStep === true
}

type SessionTiming = Pick<
  PublicSession,
  'status' | 'settings' | 'currentIndex' | 'questionCount' | 'phaseStartedAt' | 'phaseEndsAt'
>
