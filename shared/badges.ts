import type { QuizGameType } from './types'

// Badges (trophées, version 1.1) : gardés sur le téléphone seulement, jamais dans la base. Une partie compte
// une seule fois (identifiant de partie mémorisé), et seulement si elle est terminée (voir badgeTracking.ts).

export const BADGE_SCHEMA_VERSION = 1

// Catégories à trois paliers ; value : valeur atteinte, comparée aux seuils (lightning : plus petit = mieux).
export type BadgeCategory =
  | 'played'
  | 'wins'
  | 'losses'
  | 'gathering'
  | 'winStreak'
  | 'loyal'
  | 'allRounder'
  | 'marathon'
  | 'lightning'
  | 'liar'
  | 'artist'

export type SingleBadge = 'perfect' | 'comeback' | 'christmas' | 'newYear' | 'share' | 'rate'

export type BadgeTier = 1 | 2 | 3

// Identifiant d'un badge : « played.1 » … « artist.3 », ou le badge unique.
export type BadgeId = `${BadgeCategory}.${BadgeTier}` | SingleBadge

export const BADGE_TIERS: Record<BadgeCategory, readonly [number, number, number]> = {
  played: [5, 20, 100],
  wins: [5, 20, 100],
  losses: [5, 20, 100],
  gathering: [5, 10, 15],
  winStreak: [3, 5, 10],
  loyal: [3, 7, 30],
  allRounder: [1, 10, 50],
  marathon: [10, 20, 30],
  lightning: [5000, 3000, 2000],
  liar: [10, 30, 100],
  artist: [10, 30, 100],
}

export const BADGE_CATEGORIES = Object.keys(BADGE_TIERS) as readonly BadgeCategory[]
export const SINGLE_BADGES: readonly SingleBadge[] = ['perfect', 'comeback', 'christmas', 'newYear', 'share', 'rate']

// Tous les badges, dans l'ordre d'affichage (39).
export const ALL_BADGES: readonly BadgeId[] = [
  ...BADGE_CATEGORIES.flatMap((category) => ([1, 2, 3] as const).map((tier): BadgeId => `${category}.${tier}`)),
  ...SINGLE_BADGES,
]

// Sans faute : partie de Quiz d'au moins ce nombre de questions, toutes justes.
export const PERFECT_MIN_QUESTIONS = 10
// Comeback : au moins ce nombre de joueurs.
export const COMEBACK_MIN_PLAYERS = 3
// Jours différents gardés (Fidèle) : le dernier palier suffit.
const LOYAL_DAYS_KEPT = BADGE_TIERS.loyal[2]
// Identifiants des dernières parties comptées (doubles comptes).
export const PROCESSED_GAMES_KEPT = 50

export type BadgeGame = QuizGameType

// Qui a vécu la partie : un joueur (l'hôte qui joue compris), ou l'hôte qui ne joue pas (organisateur).
export type BadgeRole = 'player' | 'organizer'

// Résultat d'un joueur dans une partie terminée (absent pour l'organisateur).
export interface PlayerGameOutcome {
  won: boolean
  // Quiz d'au moins PERFECT_MIN_QUESTIONS questions, toutes justes (décidé par badgeTracking.ts).
  perfect: boolean
  comeback: boolean
  // Bonne réponse la plus rapide (Quiz et Blind test), mesurée sur le téléphone ; null : aucune.
  fastestCorrectMs: number | null
  bluffFooled: number
  drawGuessed: number
}

// Partie terminée, telle que la voit ce téléphone.
export interface FinishedGame {
  // Code de la partie et heure (serveur) de sa fin : unique, même après « Changer de jeu » (même code).
  gameKey: string
  role: BadgeRole
  game: BadgeGame
  playerCount: number
  questionCount: number
  // Jour local du téléphone à la fin (AAAA-MM-JJ).
  localDay: string
  outcome?: PlayerGameOutcome
}

export interface BadgeCounters {
  completed: number
  wins: number
  losses: number
  winStreak: number
  bestWinStreak: number
  maxPlayers: number
  perGame: Record<BadgeGame, number>
  maxQuizQuestions: number
  fastestCorrectMs: number | null
  bluffFooled: number
  drawGuessed: number
  playedDays: string[]
  perfect: number
  comeback: number
  christmas: number
  newYear: number
  shared: number
  rated: number
}

export interface BadgeState {
  v: number
  counters: BadgeCounters
  // Badge débloqué → heure (téléphone) du déblocage. Jamais retiré.
  unlocked: Partial<Record<BadgeId, number>>
  processed: string[]
  // Badges débloqués déjà vus sur l'écran « Mes badges » (pastille de l'accueil : seulement les autres).
  // Absent des données plus anciennes : tout ce qui est débloqué compte comme nouveau.
  seen: BadgeId[]
}

export function emptyBadgeState(): BadgeState {
  return {
    v: BADGE_SCHEMA_VERSION,
    counters: {
      completed: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      maxPlayers: 0,
      perGame: { quiz: 0, blindTest: 0, bluff: 0, draw: 0 },
      maxQuizQuestions: 0,
      fastestCorrectMs: null,
      bluffFooled: 0,
      drawGuessed: 0,
      playedDays: [],
      perfect: 0,
      comeback: 0,
      christmas: 0,
      newYear: 0,
      shared: 0,
      rated: 0,
    },
    unlocked: {},
    processed: [],
    seen: [],
  }
}

// Jour local (AAAA-MM-JJ) d'une date : heure du téléphone, pas du serveur.
export function localDayOf(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const CHRISTMAS_DAYS = ['12-24', '12-25']
const NEW_YEAR_DAYS = ['12-31', '01-01']

function monthDay(localDay: string): string {
  return localDay.slice(5)
}

// Valeur atteinte dans une catégorie. Touche-à-tout : parties terminées du jeu ouvert le moins joué
// (openGames : jeux ouverts aujourd'hui, lus dans la config ; jamais vide : le Quiz est toujours ouvert).
export function categoryValue(counters: BadgeCounters, category: BadgeCategory, openGames: readonly BadgeGame[]): number | null {
  switch (category) {
    case 'played':
      return counters.completed
    case 'wins':
      return counters.wins
    case 'losses':
      return counters.losses
    case 'gathering':
      return counters.maxPlayers
    case 'winStreak':
      return counters.bestWinStreak
    case 'loyal':
      return counters.playedDays.length
    case 'allRounder':
      return openGames.length === 0 ? 0 : Math.min(...openGames.map((game) => counters.perGame[game]))
    case 'marathon':
      return counters.maxQuizQuestions
    case 'lightning':
      return counters.fastestCorrectMs
    case 'liar':
      return counters.bluffFooled
    case 'artist':
      return counters.drawGuessed
  }
}

// Palier atteint (0 à 3) d'après les compteurs seuls. « Rapide comme l'éclair » : strictement sous le seuil.
export function tierReached(counters: BadgeCounters, category: BadgeCategory, openGames: readonly BadgeGame[]): 0 | BadgeTier {
  const value = categoryValue(counters, category, openGames)
  if (value === null) return 0
  const tiers = BADGE_TIERS[category]
  const reached = category === 'lightning' ? tiers.filter((limit) => value < limit).length : tiers.filter((limit) => value >= limit).length
  return reached as 0 | BadgeTier
}

function singleEarned(counters: BadgeCounters, badge: SingleBadge): boolean {
  return counters[badge === 'share' ? 'shared' : badge === 'rate' ? 'rated' : badge] > 0
}

// Badges mérités d'après les compteurs, dans l'ordre du catalogue.
export function earnedBadges(counters: BadgeCounters, openGames: readonly BadgeGame[]): BadgeId[] {
  return ALL_BADGES.filter((id) => {
    if (!id.includes('.')) return singleEarned(counters, id as SingleBadge)
    const [category, tier] = id.split('.') as [BadgeCategory, string]
    return tierReached(counters, category, openGames) >= Number(tier)
  })
}

export interface BadgeUpdate {
  state: BadgeState
  // Badges débloqués par ce changement (déjà débloqués : jamais répétés).
  unlocked: BadgeId[]
}

// Nouveaux badges : mérités et pas encore débloqués. Un badge débloqué le reste (un jeu ouvert plus tard ne
// retire rien : il compte seulement pour les paliers pas encore atteints).
function withUnlocks(state: BadgeState, openGames: readonly BadgeGame[], now: number): BadgeUpdate {
  const unlocked = earnedBadges(state.counters, openGames).filter((id) => state.unlocked[id] === undefined)
  if (unlocked.length === 0) return { state, unlocked }
  return { state: { ...state, unlocked: { ...state.unlocked, ...Object.fromEntries(unlocked.map((id) => [id, now])) } }, unlocked }
}

function withPlayedDay(days: readonly string[], day: string): string[] {
  if (days.includes(day) || days.length >= LOYAL_DAYS_KEPT) return [...days]
  return [...days, day]
}

// Compteurs après une partie terminée. L'organisateur (hôte qui ne joue pas) : Parties jouées, Joueurs réunis,
// Touche-à-tout et Fidèle seulement.
function countersAfter(counters: BadgeCounters, game: FinishedGame): BadgeCounters {
  const next: BadgeCounters = {
    ...counters,
    completed: counters.completed + 1,
    maxPlayers: Math.max(counters.maxPlayers, game.playerCount),
    perGame: { ...counters.perGame, [game.game]: counters.perGame[game.game] + 1 },
    playedDays: withPlayedDay(counters.playedDays, game.localDay),
  }
  const outcome = game.role === 'player' ? game.outcome : undefined
  if (!outcome) return next
  const winStreak = outcome.won ? counters.winStreak + 1 : 0
  const day = monthDay(game.localDay)
  const fastest = outcome.fastestCorrectMs
  return {
    ...next,
    wins: counters.wins + (outcome.won ? 1 : 0),
    losses: counters.losses + (outcome.won ? 0 : 1),
    winStreak,
    bestWinStreak: Math.max(counters.bestWinStreak, winStreak),
    maxQuizQuestions: game.game === 'quiz' ? Math.max(counters.maxQuizQuestions, game.questionCount) : counters.maxQuizQuestions,
    fastestCorrectMs: fastest === null ? counters.fastestCorrectMs : Math.min(counters.fastestCorrectMs ?? fastest, fastest),
    bluffFooled: counters.bluffFooled + outcome.bluffFooled,
    drawGuessed: counters.drawGuessed + outcome.drawGuessed,
    perfect: counters.perfect + (outcome.perfect ? 1 : 0),
    comeback: counters.comeback + (outcome.comeback ? 1 : 0),
    christmas: counters.christmas + (CHRISTMAS_DAYS.includes(day) ? 1 : 0),
    newYear: counters.newYear + (NEW_YEAR_DAYS.includes(day) ? 1 : 0),
  }
}

// Partie terminée : compteurs, puis badges débloqués. Idempotent : une partie déjà comptée ne change rien.
export function applyFinishedGame(state: BadgeState, game: FinishedGame, openGames: readonly BadgeGame[], now: number): BadgeUpdate {
  if (state.processed.includes(game.gameKey)) return { state, unlocked: [] }
  const processed = [...state.processed, game.gameKey].slice(-PROCESSED_GAMES_KEPT)
  return withUnlocks({ ...state, counters: countersAfter(state.counters, game), processed }, openGames, now)
}

export type BadgeAction = 'share' | 'rate'

// Partager ou noter l'app : déclaratif, débloqué dès l'ouverture de la fenêtre (de partage, ou du store).
export function applyBadgeAction(state: BadgeState, action: BadgeAction, openGames: readonly BadgeGame[], now: number): BadgeUpdate {
  const key = action === 'share' ? 'shared' : 'rated'
  return withUnlocks({ ...state, counters: { ...state.counters, [key]: state.counters[key] + 1 } }, openGames, now)
}

// Lecture du stockage, quelle que soit sa version. Champs lus un par un (valeur douteuse : valeur vide).
// writable : faux si les données viennent d'une version plus récente de l'app (retour à une ancienne
// version) : on les lit sans jamais les réécrire.
export interface ParsedBadgeState {
  state: BadgeState
  writable: boolean
}

const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0)
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [])

export function parseBadgeState(raw: unknown): ParsedBadgeState {
  const empty = emptyBadgeState()
  if (!isRecord(raw)) return { state: empty, writable: true }
  const version = count(raw.v)
  const source = isRecord(raw.counters) ? raw.counters : {}
  const perGame = isRecord(source.perGame) ? source.perGame : {}
  const fastest = source.fastestCorrectMs
  const counters: BadgeCounters = {
    ...empty.counters,
    ...Object.fromEntries(
      (Object.keys(empty.counters) as (keyof BadgeCounters)[])
        .filter((key) => typeof empty.counters[key] === 'number')
        .map((key) => [key, count(source[key])]),
    ),
    perGame: { quiz: count(perGame.quiz), blindTest: count(perGame.blindTest), bluff: count(perGame.bluff), draw: count(perGame.draw) },
    fastestCorrectMs: typeof fastest === 'number' && Number.isFinite(fastest) && fastest >= 0 ? fastest : null,
    playedDays: [...new Set(strings(source.playedDays).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)))].slice(0, LOYAL_DAYS_KEPT),
  }
  const known = new Set<string>(ALL_BADGES)
  const unlocked = isRecord(raw.unlocked)
    ? Object.fromEntries(Object.entries(raw.unlocked).filter(([id, at]) => known.has(id) && typeof at === 'number'))
    : {}
  const seen = [...new Set(strings(raw.seen))].filter((id): id is BadgeId => known.has(id))
  return {
    state: { v: BADGE_SCHEMA_VERSION, counters, unlocked, processed: strings(raw.processed).slice(-PROCESSED_GAMES_KEPT), seen },
    writable: version <= BADGE_SCHEMA_VERSION,
  }
}

// Écran « Mes badges » : palier atteint, valeur actuelle et remplissage de la barre vers le prochain palier
// (pleine quand les trois sont atteints). « Rapide comme l'éclair » : seuil / meilleur temps.
export interface CategoryProgress {
  tier: 0 | BadgeTier
  value: number | null
  fraction: number
}

export function categoryProgress(counters: BadgeCounters, category: BadgeCategory, openGames: readonly BadgeGame[]): CategoryProgress {
  const value = categoryValue(counters, category, openGames)
  const tier = tierReached(counters, category, openGames)
  if (tier === 3) return { tier, value, fraction: 1 }
  const next = BADGE_TIERS[category][tier]
  const raw = value === null || value <= 0 ? 0 : category === 'lightning' ? next / value : value / next
  return { tier, value, fraction: Math.min(1, Math.max(0, raw)) }
}

// Nombre de badges débloqués (accueil, en-tête de l'écran).
export function unlockedCount(state: BadgeState): number {
  return ALL_BADGES.filter((id) => state.unlocked[id] !== undefined).length
}

function unseenBadges(state: BadgeState): BadgeId[] {
  return ALL_BADGES.filter((id) => state.unlocked[id] !== undefined && !state.seen.includes(id))
}

// Badges débloqués pas encore vus (pastille du trophée de l'accueil).
export function unseenCount(state: BadgeState): number {
  return unseenBadges(state).length
}

// Écran « Mes badges » ouvert : tout ce qui est débloqué est vu. Rien de nouveau : même état (rien à écrire).
export function markAllSeen(state: BadgeState): BadgeState {
  const unseen = unseenBadges(state)
  return unseen.length === 0 ? state : { ...state, seen: [...state.seen, ...unseen] }
}
