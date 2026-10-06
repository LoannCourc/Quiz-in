import { SCORES_TOP_COUNT } from './constants'
import { teamRanking } from './teams'
import type { Player, PlayerId, PlayerResult, PublicSession } from './types'

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

// Badges du classement intermédiaire de la TV (joueur → série) : les joueurs affichés (les 5 premiers ; en
// Groupe, le meilleur joueur de chaque équipe) dont la série vaut au moins 3. Aucun en Suspense : l'ordre
// des séries trahirait le classement caché. L'écran du classement n'affiche que ce que renvoie cette
// fonction.
type RankingSession = Pick<PublicSession, 'players' | 'settings' | 'teams'>

// Joueurs affichés dans le classement intermédiaire : les 5 premiers ; en Groupe, le meilleur joueur de
// chaque équipe.
function rankingShownIds(session: RankingSession): PlayerId[] {
  if (session.settings.teams) return teamRanking(session).flatMap((row) => (row.bestPlayerId ? [row.bestPlayerId] : []))
  return Object.entries(session.players)
    .sort(([, a], [, b]) => a.rank - b.rank || a.name.localeCompare(b.name, 'fr'))
    .slice(0, SCORES_TOP_COUNT)
    .map(([id]) => id)
}

export function rankingStreakBadges(session: RankingSession): Record<PlayerId, number> {
  if (session.settings.suspense) return {}
  const badges: Record<PlayerId, number> = {}
  for (const id of rankingShownIds(session)) {
    const streak = session.players[id]?.streak
    if (hasStreakBadge(streak)) badges[id] = streak ?? 0
  }
  return badges
}

// Ligne « Aussi en série » sous le classement intermédiaire : les autres joueurs avec une série de 3 et
// plus (au-delà de la 5e place ; en Groupe, hors meilleurs joueurs), la plus longue d'abord, 3 au plus,
// puis le nombre de ceux qui ne tiennent pas. Rien en Suspense.
export const EXTRA_STREAKS_SHOWN = 3

export interface ExtraStreaks {
  shown: { id: PlayerId; streak: number }[]
  moreCount: number
}

export function extraStreaks(session: RankingSession): ExtraStreaks {
  if (session.settings.suspense) return { shown: [], moreCount: 0 }
  const inRanking = new Set(rankingShownIds(session))
  const others = Object.entries(session.players)
    .filter(([id, player]) => !inRanking.has(id) && hasStreakBadge(player.streak))
    .sort(([, a], [, b]) => (b.streak ?? 0) - (a.streak ?? 0) || a.name.localeCompare(b.name, 'fr'))
    .map(([id, player]) => ({ id, streak: player.streak ?? 0 }))
  return { shown: others.slice(0, EXTRA_STREAKS_SHOWN), moreCount: Math.max(0, others.length - EXTRA_STREAKS_SHOWN) }
}

// Écran de résultat du téléphone (joueur, et hôte qui joue) : sa série, à partir de 3, quand il vient de
// répondre juste (une série gardée sans bonne réponse, à moitié juste par exemple, ne s'affiche pas). Aussi
// en Suspense : sa propre série ne dit rien de son rang. null : rien à afficher.
export function revealStreak(session: Pick<PublicSession, 'players' | 'reveal'>, uid: PlayerId): number | null {
  const streak = session.players[uid]?.streak
  return session.reveal?.results?.[uid]?.correct === true && hasStreakBadge(streak) ? (streak ?? 0) : null
}
