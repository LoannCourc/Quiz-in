import type { QuizEntry } from './quizValidation'
import { MAX_POOL_THEMES, QUESTION_LEVELS, quizLevelCounts } from './themeCatalog'
import type { QuestionLevel } from './types'

// Partie tirée dans des thèmes du Quiz (maquette QN1-G, « Ta partie ») : questions disponibles par thème et
// par niveau, nombre effectif, avertissement quand il en manque, et tirage réparti entre les thèmes.
// Logique pure : la fiche, « Ta partie » et le salon (tirage de secours) l'appellent.

// Difficulté choisie : tous les niveaux, ou un ou deux niveaux (les trois reviennent à « tous »).
export type LevelChoice = 'all' | readonly QuestionLevel[]

// Choix ramené à sa forme unique : niveaux sans doublon, dans l'ordre Facile, Moyen, Difficile ; aucun ou
// les trois : « tous ».
export function normalizeLevels(levels: LevelChoice | undefined): LevelChoice {
  if (levels === undefined || levels === 'all') return 'all'
  const chosen = QUESTION_LEVELS.filter((level) => levels.includes(level))
  return chosen.length === 0 || chosen.length === QUESTION_LEVELS.length ? 'all' : chosen
}

export function includesLevel(levels: LevelChoice, level: QuestionLevel): boolean {
  return levels === 'all' || levels.includes(level)
}

// Questions disponibles pour chaque thème choisi (dans leur ordre, sans doublon), aux niveaux choisis, d'après
// les fiches du catalogue (levelCounts).
export function availableByTheme(entries: readonly QuizEntry[], themes: readonly string[], levels: LevelChoice): { theme: string; count: number }[] {
  return [...new Set(themes)].map((theme) => ({
    theme,
    count: entries
      .filter((entry) => entry.gameType === 'quiz' && entry.theme === theme)
      .reduce((total, entry) => {
        const counts = quizLevelCounts(entry)
        return total + QUESTION_LEVELS.filter((level) => includesLevel(levels, level)).reduce((sum, level) => sum + counts[level], 0)
      }, 0),
  }))
}

export function availableTotal(entries: readonly QuizEntry[], themes: readonly string[], levels: LevelChoice): number {
  return availableByTheme(entries, themes, levels).reduce((total, theme) => total + theme.count, 0)
}

// Nombre de questions de la partie : celui demandé, ou toutes celles disponibles s'il en manque.
export function effectiveQuestionCount(requested: number, available: number): number {
  return Math.max(0, Math.min(requested, available))
}

// Pas assez de questions pour le nombre demandé : de quoi écrire l'avertissement (« Seulement 18 questions
// difficiles en Sport : ajoute un thème pour en avoir plus. »). Conseil : ajouter un thème tant qu'il en reste
// à ajouter ; sinon élargir la difficulté (si elle est limitée) ; sinon demander moins de questions.
export interface PoolShortage {
  available: number
  themes: string[]
  levels: LevelChoice
  advice: 'addTheme' | 'widenLevels' | 'fewerQuestions'
}

export function poolShortage(entries: readonly QuizEntry[], themes: readonly string[], levels: LevelChoice, requested: number): PoolShortage | null {
  const unique = [...new Set(themes)]
  const available = availableTotal(entries, unique, levels)
  if (available >= requested) return null
  const advice = unique.length < MAX_POOL_THEMES ? 'addTheme' : levels === 'all' ? 'fewerQuestions' : 'widenLevels'
  return { available, themes: unique, levels, advice }
}

// Question candidate au tirage : « quizId/questionId », son thème et son niveau.
export interface PoolCandidate {
  ref: string
  theme: string
  level: QuestionLevel
}

// Parts égales entre les thèmes (le reste aux premiers thèmes), dans leur ordre : 20 sur 3 thèmes = 7, 7, 6.
export function themeQuotas(count: number, themeCount: number): number[] {
  if (themeCount === 0) return []
  const base = Math.floor(count / themeCount)
  return Array.from({ length: themeCount }, (_, index) => base + (index < count % themeCount ? 1 : 0))
}

// Tirage de la partie : seulement les niveaux choisis ; parts égales entre les thèmes, complétées par les
// autres thèmes quand l'un manque de questions ; partout, d'abord les questions jamais jouées sur ce téléphone
// (au hasard), puis les plus anciennement jouées. playedAt : heure du dernier lancement de chaque question
// jouée. Un thème en double ne compte qu'une fois. Renvoie les identifiants dans un ordre mélangé, au plus count.
export function drawThemeQuestions(
  candidates: readonly PoolCandidate[],
  themes: readonly string[],
  levels: LevelChoice,
  count: number,
  playedAt: Readonly<Record<string, number>>,
  random: () => number = Math.random,
): string[] {
  const uniqueThemes = [...new Set(themes)]
  const eligible = candidates.filter((candidate) => uniqueThemes.includes(candidate.theme) && includesLevel(levels, candidate.level))
  const ordered = (items: readonly PoolCandidate[]) => priorityOrder(items.map((item) => item.ref), playedAt, random)
  const byTheme = uniqueThemes.map((theme) => ordered(eligible.filter((candidate) => candidate.theme === theme)))
  const quotas = themeQuotas(count, uniqueThemes.length)
  const picked = byTheme.flatMap((refs, index) => refs.slice(0, quotas[index]))
  const pickedSet = new Set(picked)
  // Complément : les questions restantes des autres thèmes, dans le même ordre de priorité.
  const leftovers = priorityOrder(
    eligible.map((candidate) => candidate.ref).filter((ref) => !pickedSet.has(ref)),
    playedAt,
    random,
  )
  return shuffled([...picked, ...leftovers.slice(0, Math.max(0, count - picked.length))], random)
}

// Jamais jouées d'abord (au hasard), puis les plus anciennement jouées.
function priorityOrder(refs: readonly string[], playedAt: Readonly<Record<string, number>>, random: () => number): string[] {
  const unplayed = shuffled(refs.filter((ref) => playedAt[ref] === undefined), random)
  const played = refs.filter((ref) => playedAt[ref] !== undefined).sort((a, b) => playedAt[a] - playedAt[b])
  return [...unplayed, ...played]
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}
