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
  teamsValidatedAt: true,
  bluffedBy: true,
  votedBy: true,
  sound: true,
  tvPresence: true,
  drawTurn: true,
  drawing: true,
  drawFound: true,
}

export type PublicField = keyof PublicSession

export const PUBLIC_SESSION_FIELDS = Object.keys(PUBLIC_FIELD_SET) as readonly PublicField[]

// Session publique assemblée à partir des champs lus un par un (TV et joueurs). null : pas de status,
// la partie n'existe pas. La forme est garantie par les règles de validation de la base ; la base ne
// stocke pas les objets vides : players et reveal.stats peuvent manquer. Tous les champs reçus sont gardés
// tels quels (players/{id}/streak compris).
export function toPublicSession(values: Partial<Record<PublicField, unknown>>): PublicSession | null {
  if (values.status == null) return null
  const raw = values as PublicSession
  const reveal = raw.reveal && { ...raw.reveal, stats: raw.reveal.stats ?? {} }
  return { ...raw, players: raw.players ?? {}, reveal }
}
