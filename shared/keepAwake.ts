import type { PublicSession } from './types'

// Anti-veille de la TV (box Android TV) : quand la garder éveillée. Logique pure, testée.
// Pendant la partie, et sur l'écran de fin pendant END_KEEP_AWAKE_MS (podium, puis « Changer de jeu » de
// l'hôte) ; au-delà, une partie terminée et laissée affichée n'empêche plus la veille. Pendant le choix du
// prochain jeu (nextGameAt) : toujours éveillée.
export const END_KEEP_AWAKE_MS = 15 * 60_000

type KeepAwakeSession = Pick<PublicSession, 'status' | 'phaseStartedAt' | 'nextGameAt'>

// Heure (serveur) après laquelle la TV peut se mettre en veille ; null : éveillée sans limite.
export function keepAwakeDeadline(session: KeepAwakeSession): number | null {
  return session.status === 'ended' && session.nextGameAt == null ? session.phaseStartedAt + END_KEEP_AWAKE_MS : null
}

export function shouldKeepAwake(session: KeepAwakeSession, nowServer: number): boolean {
  const deadline = keepAwakeDeadline(session)
  return deadline === null || nowServer < deadline
}
