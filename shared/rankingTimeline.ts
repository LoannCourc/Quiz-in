import { SCORES_TOP_COUNT } from './constants'
import { teamRanking } from './teams'
import type { PublicSession } from './types'

// Arrivée des lignes du classement et des marches du podium sur la TV (spec 17). L'écran (délais des
// animations) et les sons (shared/sound.ts) lisent ces mêmes instants, en ms depuis le début de la phase.

// Classement entre les questions : la première ligne entre après le son des points, puis une ligne toutes
// les SCORES_ENTRY_STEP_MS, de la dernière à la première (au moins 120 ms entre deux sons).
export const SCORES_FIRST_ENTRY_MS = 400
export const SCORES_ENTRY_STEP_MS = 250

// Fin de partie : le 3e, puis le 2e, puis le 1er arrivent sur le podium, à PODIUM_ENTRY_STEP_MS d'écart.
export const PODIUM_FIRST_ENTRY_MS = 300
export const PODIUM_ENTRY_STEP_MS = 800
export const PODIUM_SIZE = 3

// Lignes du classement : les SCORES_TOP_COUNT premiers joueurs, ou toutes les équipes en Groupe.
export function scoresRowCount(session: Pick<PublicSession, 'settings' | 'players' | 'teams'>): number {
  if (session.settings.teams) return teamRanking(session).length
  return Math.min(SCORES_TOP_COUNT, Object.keys(session.players).length)
}

// Instant d'entrée de la ligne à cette position (0 : premier) parmi count lignes.
export function scoresEntryMs(position: number, count: number): number {
  return SCORES_FIRST_ENTRY_MS + (count - 1 - position) * SCORES_ENTRY_STEP_MS
}

// Marches occupées du podium final : joueurs, ou équipes en Groupe (au plus 3).
export function podiumPlaceCount(session: Pick<PublicSession, 'settings' | 'players' | 'teams'>): number {
  const count = session.settings.teams ? teamRanking(session).length : Object.keys(session.players).length
  return Math.min(PODIUM_SIZE, count)
}

// Instant d'arrivée sur le podium de cette place (0 : premier), après podiumStartMs (fin du roulement
// de tambour en Suspense, sinon 0).
export function podiumEntryMs(place: number, podiumStartMs: number): number {
  return podiumStartMs + PODIUM_FIRST_ENTRY_MS + (PODIUM_SIZE - 1 - place) * PODIUM_ENTRY_STEP_MS
}
