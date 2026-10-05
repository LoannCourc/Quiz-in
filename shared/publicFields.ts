import type { PublicSession } from './types'

// Champs publics de sessions/{code}, lus un par un par les joueurs et la TV (les règles interdisent
// de lire la session d'un bloc : answers est réservé à l'hôte). Une seule liste pour tous : un champ
// ajouté à PublicSession sans être listé ici est une erreur de typage, jamais un oubli d'un côté.
const PUBLIC_FIELD_SET: Record<keyof PublicSession, true> = {
  hostUid: true,
  quizId: true,
  status: true,
  settings: true,
  currentIndex: true,
  questionCount: true,
  phaseStartedAt: true,
  phaseEndsAt: true,
  pausedFrom: true,
  remainingMs: true,
  hostLeftAt: true,
  currentQuestion: true,
  reveal: true,
  players: true,
  answeredBy: true,
  teams: true,
  teamPoints: true,
  teamPresence: true,
  teamDrawAt: true,
}

export type PublicField = keyof PublicSession

export const PUBLIC_SESSION_FIELDS = Object.keys(PUBLIC_FIELD_SET) as readonly PublicField[]
