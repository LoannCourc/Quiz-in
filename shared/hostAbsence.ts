import { HOST_DISCONNECT_TIMEOUT_S, STALE_PHASE_MARGIN_MS } from './constants'
import type { SessionUpdate } from './hostEngine'
import type { GameStatus, PublicSession, Session } from './types'

// Hôte absent (spec 6.6) : en cas de coupure, le serveur écrit hostLeftAt (onDisconnect de
// l'hôte). Joueurs et TV l'affichent ; au-delà de HOST_DISCONNECT_TIMEOUT_S, ils suppriment la
// partie ; à son retour, l'hôte met la partie en pause et efface hostLeftAt.

type AbsenceFields = Pick<PublicSession, 'status' | 'hostLeftAt'>

// Message « L'hôte a perdu la connexion… » : pas en fin de partie (seul le nettoyage reste actif).
export function isHostAway(session: AbsenceFields): boolean {
  return session.hostLeftAt !== undefined && session.status !== 'ended'
}

// Heure serveur à partir de laquelle un joueur ou la TV peut supprimer la partie, ou null.
// Même condition que database.rules.json : strictement après hostLeftAt + délai.
export function abandonedGameDeletableAt(session: AbsenceFields): number | null {
  return session.hostLeftAt === undefined ? null : session.hostLeftAt + HOST_DISCONNECT_TIMEOUT_S * 1000
}

export function canDeleteAbandonedGame(session: AbsenceFields, nowServer: number): boolean {
  const deletableAt = abandonedGameDeletableAt(session)
  return deletableAt !== null && nowServer > deletableAt
}

// États où la partie avance seule : le départ de l'hôte les interrompt.
const RUNNING: readonly GameStatus[] = ['starting', 'question', 'reveal', 'scores', 'validation']

// Retour de l'hôte après une coupure : en un seul update, la partie passe en pause avec le
// temps qui restait AU MOMENT DU DÉPART (phaseEndsAt − hostLeftAt), et hostLeftAt est effacé.
// Déjà en pause, en lobby ou terminée : seulement l'effacement. L'hôte reprend lui-même.
export function hostReturnUpdate(session: Session): SessionUpdate | null {
  if (session.hostLeftAt === undefined) return null
  if (!RUNNING.includes(session.status)) return { hostLeftAt: null }
  return {
    status: 'paused',
    pausedFrom: session.status,
    remainingMs: Math.max(0, session.phaseEndsAt - session.hostLeftAt),
    hostLeftAt: null,
  }
}

// « 4:05 » : temps restant avant suppression, en minutes et secondes (jamais négatif).
export function formatMinutesSeconds(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Perte de connexion de l'hôte constatée par son propre téléphone (avant que le serveur ne s'en
// aperçoive) : à la reconnexion, pause avec le temps qui restait à l'instant de la perte, borné à
// la durée de la phase. En lobby, pause ou fin : rien à faire.
export function connectionLostPauseUpdate(session: Session, lostAt: number): SessionUpdate | null {
  if (!RUNNING.includes(session.status)) return null
  const phaseDurationMs = Math.max(0, session.phaseEndsAt - session.phaseStartedAt)
  return {
    status: 'paused',
    pausedFrom: session.status,
    remainingMs: Math.min(phaseDurationMs, Math.max(0, session.phaseEndsAt - lostAt)),
  }
}

type PhaseFields = Pick<PublicSession, 'status' | 'phaseEndsAt'>

// Joueurs et TV : heure serveur à partir de laquelle la phase en cours est considérée comme bloquée
// (l'hôte ne la fait plus avancer), ou null hors des phases à durée automatique.
export function stalePhaseAt(session: PhaseFields): number | null {
  if (!RUNNING.includes(session.status) || session.phaseEndsAt <= 0) return null
  return session.phaseEndsAt + STALE_PHASE_MARGIN_MS
}

export function isPhaseStale(session: PhaseFields, nowServer: number): boolean {
  const staleAt = stalePhaseAt(session)
  return staleAt !== null && nowServer >= staleAt
}
