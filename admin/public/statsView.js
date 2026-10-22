// Calculs de la page des statistiques à partir de /stats (docs/statistiques.md). Module pur, sans Firebase ni
// DOM : testé par tests/unit/adminStatsView.test.ts.

export const MODE_LABELS = { quiz: 'Quiz', bluff: 'Bluff', draw: 'Dessine-moi' }
export const POOL_LABELS = { themes: 'Quiz par thèmes', mix: 'Mélange de Bluff' }
export const DEFAULT_MIN_ANSWERS = 20
const RANKING_SIZE = 10

// La base renvoie un tableau quand les clés numériques se suivent (reached, playerCounts) : même lecture
// pour un objet ou un tableau, cases vides ignorées.
function entriesOf(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).filter(([, item]) => item !== null && item !== undefined)
}

function count(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

// Part (0 à 1) ou null si le total est nul.
export function rate(part, total) {
  return total > 0 ? Math.min(1, part / total) : null
}

export function formatRate(value) {
  return value === null ? '–' : `${Math.round(value * 100)} %`
}

export function totals(stats) {
  const rows = modeRows(stats)
  const started = rows.reduce((sum, row) => sum + row.started, 0)
  const completed = rows.reduce((sum, row) => sum + row.completed, 0)
  return { started, completed, rate: rate(completed, started) }
}

// Jeux les plus joués : parties démarrées et terminées, taux de parties terminées.
export function modeRows(stats) {
  return entriesOf(stats?.modes)
    .filter(([mode]) => mode in MODE_LABELS)
    .map(([mode, value]) => {
      const started = count(value?.started)
      const completed = count(value?.completed)
      return { id: mode, label: MODE_LABELS[mode], started, completed, rate: rate(completed, started) }
    })
    .sort((a, b) => b.started - a.started)
}

// Quiz (et ensembles tirés) les plus joués ; titles : titre de chaque quiz lu dans /quizzes.
export function topGames(stats, titles = {}, limit = RANKING_SIZE) {
  const quizzes = entriesOf(stats?.quizzes).map(([id, value]) => ({ id, label: titles[id] ?? id, kind: 'quiz', started: count(value?.started), completed: count(value?.completed) }))
  const pools = entriesOf(stats?.pools)
    .filter(([id]) => id in POOL_LABELS)
    .map(([id, value]) => ({ id, label: POOL_LABELS[id], kind: 'pool', started: count(value?.started), completed: count(value?.completed) }))
  return [...quizzes, ...pools]
    .map((row) => ({ ...row, rate: rate(row.completed, row.started) }))
    .sort((a, b) => b.started - a.started || a.label.localeCompare(b.label, 'fr'))
    .slice(0, limit)
}

// Courbe d'abandon d'un jeu : parties arrivées à chaque question (part des parties démarrées). L'écart entre
// deux questions est le nombre de parties abandonnées entre les deux.
export function dropOff(stats, mode) {
  const value = stats?.modes?.[mode]
  const started = count(value?.started)
  const reached = new Map(entriesOf(value?.reached).map(([index, games]) => [Number(index), count(games)]))
  const last = Math.max(-1, ...reached.keys())
  return Array.from({ length: last + 1 }, (_, index) => {
    const games = reached.get(index) ?? 0
    const next = index < last ? (reached.get(index + 1) ?? 0) : null
    return { index, games, share: rate(games, started), abandoned: next === null ? null : Math.max(0, games - next) }
  })
}

// Répartition du nombre de joueurs (connectés au lancement, hôte compris s'il joue).
export function playerHistogram(stats) {
  const counts = new Map(entriesOf(stats?.playerCounts).map(([players, games]) => [Number(players), count(games)]))
  const present = [...counts.keys()].filter((players) => counts.get(players) > 0)
  if (present.length === 0) return []
  const total = [...counts.values()].reduce((sum, games) => sum + games, 0)
  const min = Math.min(...present)
  const max = Math.max(...present)
  return Array.from({ length: max - min + 1 }, (_, i) => {
    const games = counts.get(min + i) ?? 0
    return { players: min + i, games, share: rate(games, total) }
  })
}

// Questions les plus dures et les plus faciles, parmi celles qui ont au moins minAnswers réponses.
export function questionRanking(stats, minAnswers = DEFAULT_MIN_ANSWERS, limit = RANKING_SIZE) {
  const rows = []
  for (const [quizId, questions] of entriesOf(stats?.questions)) {
    for (const [questionId, value] of entriesOf(questions)) {
      const answered = count(value?.answered)
      if (answered < Math.max(1, minAnswers)) continue
      const correct = Math.min(answered, count(value?.correct))
      rows.push({ quizId, questionId, answered, correct, rate: correct / answered })
    }
  }
  const byRate = (direction) => (a, b) => direction * (a.rate - b.rate) || b.answered - a.answered || a.questionId.localeCompare(b.questionId)
  return {
    counted: rows.length,
    hardest: [...rows].sort(byRate(1)).slice(0, limit),
    easiest: [...rows].sort(byRate(-1)).slice(0, limit),
  }
}

// Jour UTC au format AAAA-MM-JJ (même date que l'app).
export function utcDay(time) {
  return new Date(time).toISOString().slice(0, 10)
}

// Tendance des days derniers jours (UTC), jours sans partie compris.
export function dailyTrend(stats, now, days = 30) {
  const daily = stats?.daily ?? {}
  return Array.from({ length: days }, (_, i) => {
    const day = utcDay(now - (days - 1 - i) * 86_400_000)
    return { day, started: count(daily[day]?.started), completed: count(daily[day]?.completed) }
  })
}

// Quiz dont la page affiche le titre : ceux qui ont des parties ou des questions comptées.
export function quizIdsToName(stats) {
  return [...new Set([...entriesOf(stats?.quizzes), ...entriesOf(stats?.questions)].map(([id]) => id))]
}
