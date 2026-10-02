import {
  QUESTION_DURATION_S,
  REVEAL_DURATION_S,
  SCORES_DURATION_S,
  STARTING_DURATION_S,
} from './constants'
import type { AnswerMode, GameStatus } from './types'

// Enchaînement des états du MVP (spec 5), sans VALIDATION (option Contrôle, P1).
// PAUSED n'a pas d'état suivant fixe : la reprise revient à pausedFrom avec remainingMs.

export interface FlowContext {
  answerMode: AnswerMode
  // Index de la question courante (0 pour la première) et nombre de questions de la partie.
  currentIndex: number
  questionCount: number
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

// Phase qui suit `status`, ou null s'il n'y en a pas (ENDED, PAUSED, états P1).
// timeLimitS : durée propre à la question suivante, si elle en a une.
export function nextPhase(status: GameStatus, context: FlowContext, timeLimitS?: number): Phase | null {
  const { answerMode, currentIndex, questionCount } = context
  switch (status) {
    case 'lobby':
      return { status: 'starting', currentIndex: 0, durationS: STARTING_DURATION_S }
    case 'starting':
      return { status: 'question', currentIndex: 0, durationS: questionDurationS(answerMode, timeLimitS) }
    case 'question':
      return { status: 'reveal', currentIndex, durationS: REVEAL_DURATION_S[answerMode] }
    case 'reveal':
      return { status: 'scores', currentIndex, durationS: SCORES_DURATION_S }
    case 'scores': {
      const nextIndex = currentIndex + 1
      return nextIndex < questionCount
        ? { status: 'question', currentIndex: nextIndex, durationS: questionDurationS(answerMode, timeLimitS) }
        : { status: 'ended', currentIndex, durationS: null }
    }
    case 'validation':
    case 'paused':
    case 'ended':
      return null
  }
}
