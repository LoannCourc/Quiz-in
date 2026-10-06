import type { Player, PlayerId, PlayerResult } from './types'

// Série (« flamme », spec 18) : nombre de bonnes réponses d'affilée de chaque joueur, toujours individuelle
// (même en Groupe). Écrite par l'hôte avec les scores, à la révélation de chaque question.

// À partir de cette série, badge flamme sur la TV et le téléphone.
export const STREAK_BADGE_MIN = 3
// Son « série » de la TV : quand un joueur atteint tout juste l'une de ces séries (la grande, plus fort).
export const STREAK_SOUND_LEVEL = 3
export const STREAK_BIG_SOUND_LEVEL = 5
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

export function hasStreakBadge(streak: number | undefined): boolean {
  return (streak ?? 0) >= STREAK_BADGE_MIN
}

// Son de série de la révélation (un seul par question, le plus fort l'emporte) : un joueur qui vient de
// répondre juste atteint tout juste 3 ou 5. La bonne réponse est exigée : une série restée à 3 (réponse à
// moitié juste, absence) ne rejoue pas le son.
export function streakSound(players: Record<PlayerId, Pick<Player, 'streak'>>, results: Record<PlayerId, PlayerResult> | undefined): 'streak' | 'streakBig' | null {
  const reached = Object.entries(players)
    .filter(([id]) => results?.[id]?.correct === true)
    .map(([, player]) => player.streak ?? 0)
  if (reached.includes(STREAK_BIG_SOUND_LEVEL)) return 'streakBig'
  return reached.includes(STREAK_SOUND_LEVEL) ? 'streak' : null
}
