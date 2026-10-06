import type { PlayerResult } from './types'

// Série (« flamme », spec 18) : nombre de bonnes réponses d'affilée de chaque joueur, toujours individuelle
// (même en Groupe). Écrite par l'hôte avec les scores, à la révélation de chaque question.

// À partir de cette série, badge flamme sur la TV et le téléphone.
export const STREAK_BADGE_MIN = 3
// Son « série » de la TV : à exactement ces valeurs (le second plus fort).
export const STREAK_SOUND_LEVELS: readonly number[] = [3, 5]
// Plafond : une partie compte 50 questions au plus (même valeur dans database.rules.json).
export const STREAK_MAX = 50

// Nouvelle série après une question :
// - bonne réponse (choix juste, réponse libre validée, vote pour la vraie réponse au Bluff) : +1 ;
// - à moitié juste (blind test « titre et artiste ») : inchangée ;
// - mauvaise réponse, ou pas de réponse en étant connecté (question passée par l'hôte comprise) : 0 ;
// - pas de réponse et déconnecté à la fin de la question : inchangée (un joueur qui part puis revient
//   garde sa série).
export function nextStreak(previous: number | undefined, result: PlayerResult | undefined, isConnected: boolean): number {
  const current = previous ?? 0
  if (!result) return isConnected ? 0 : current
  if (result.partial) return current
  return result.correct ? Math.min(STREAK_MAX, current + 1) : 0
}
