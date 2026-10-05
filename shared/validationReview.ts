import { containsForbiddenWord } from './answerFilter'
import { isAcceptedLevel, normalizeAnswer, type MatchLevel } from './answerMatching'
import {
  answerTargets,
  groupFreeAnswers,
  withoutParentheses,
  type FreeAnswerGroupDetail,
  type ValidationDecisions,
} from './freeAnswers'
import type { Answer, PlayerId, Question } from './types'

// Écran de validation de l'hôte (Contrôle, maquette V1) : ce qu'il voit de chaque groupe de réponses
// et ce que sa décision changera. Logique pure, testée ; l'écran ne fait qu'afficher.

// Badge d'un groupe : correction automatique (exact, alias, faute de frappe, à vérifier, faux),
// « tout dans le titre » (blind test « both » : titre et artiste tapés dans le premier champ), masqué.
export type ReviewBadge = 'exact' | 'alias' | 'typo' | 'close' | 'allInTitle' | 'wrong' | 'hidden'

export interface ReviewPart {
  // Réponse normalisée : clé de la décision de l'hôte (ValidationDecisions.main ou .artist).
  key: string
  level: MatchLevel
  accepted: boolean
}

export interface ReviewGroup {
  key: string
  text: string
  playerIds: PlayerId[]
  // La réponse (ou le titre en « both »), et l'artiste en « both ».
  main: ReviewPart
  artist?: ReviewPart
  badge: ReviewBadge
  // Masqué sur la TV : par l'hôte, ou toujours s'il contient un mot interdit (isFiltered).
  hidden: boolean
  isFiltered: boolean
}

// Écritures « principales » d'une question : une réponse exacte qui n'en fait pas partie vient d'un
// alias de blind test (badge ALIAS).
function primaryAnswers(question: Question): Set<string> {
  const music = question.music
  const primary = music ? [music.title, withoutParentheses(music.title), music.artist] : []
  return new Set([...primary, ...question.acceptedAnswers].map(normalizeAnswer))
}

function reviewPart(key: string, level: MatchLevel, decision: boolean | undefined): ReviewPart {
  return { key, level, accepted: decision ?? isAcceptedLevel(level) }
}

// Blind test « both » : rien dans le champ de l'artiste, mais l'artiste écrit dans celui du titre.
function isAllInTitle(question: Question, group: FreeAnswerGroupDetail): boolean {
  if (group.artistKey !== '' || !question.music) return false
  const artists = [question.music.artist, ...(question.music.artistAliases ?? [])].map(normalizeAnswer)
  return artists.some((artist) => artist !== '' && ` ${group.mainKey} `.includes(` ${artist} `))
}

function badgeOf(question: Question, group: FreeAnswerGroupDetail, parts: ReviewPart[], primary: Set<string>): ReviewBadge {
  if (isAllInTitle(question, group)) return 'allInTitle'
  const levels = parts.map((part) => part.level)
  if (levels.every((level) => level === 'exact')) {
    return parts.every((part) => primary.has(part.key)) ? 'exact' : 'alias'
  }
  if (levels.every((level) => level === 'wrong')) return 'wrong'
  // Parties partagées (une juste, une fausse) ou réponse proche : l'hôte doit regarder.
  if (levels.includes('close') || !levels.every(isAcceptedLevel)) return 'close'
  return 'typo'
}

// Ordre d'affichage à nombre de joueurs égal : du plus sûr au plus douteux, puis masqués (maquette V1).
const BADGE_ORDER: readonly ReviewBadge[] = ['exact', 'alias', 'typo', 'close', 'allInTitle', 'wrong', 'hidden']

// Groupes de réponses (les plus nombreux d'abord), avec la décision actuelle de chaque partie :
// celle de l'hôte, sinon la correction automatique.
export function reviewGroups(
  question: Question,
  answers: Readonly<Record<PlayerId, Answer>>,
  playerIds: readonly PlayerId[],
  decisions: ValidationDecisions = {},
): ReviewGroup[] {
  const primary = primaryAnswers(question)
  const groups = groupFreeAnswers(question, answers, playerIds).map((group) => {
    const main = reviewPart(group.mainKey, group.match.main, decisions.main?.[group.mainKey])
    const artist =
      group.artistKey !== undefined && group.match.artist !== undefined
        ? reviewPart(group.artistKey, group.match.artist, decisions.artist?.[group.artistKey])
        : undefined
    const parts = artist ? [main, artist] : [main]
    const isFiltered = containsForbiddenWord(group.text)
    const hidden = isFiltered || decisions.hidden?.[group.key] === true
    const review: ReviewGroup = {
      key: group.key,
      text: group.text,
      playerIds: group.playerIds,
      main,
      badge: hidden ? 'hidden' : badgeOf(question, group, parts, primary),
      hidden,
      isFiltered,
    }
    if (artist) review.artist = artist
    return review
  })
  return groups.sort(
    (a, b) => b.playerIds.length - a.playerIds.length || BADGE_ORDER.indexOf(a.badge) - BADGE_ORDER.indexOf(b.badge),
  )
}

// Bilan avant « Valider » : joueurs dont la réponse est acceptée, à moitié (« both ») ou refusée.
export function reviewCounts(groups: readonly ReviewGroup[]): { accepted: number; partial: number; refused: number } {
  const counts = { accepted: 0, partial: 0, refused: 0 }
  for (const group of groups) {
    const parts = group.artist ? [group.main, group.artist] : [group.main]
    const acceptedParts = parts.filter((part) => part.accepted).length
    const bucket = acceptedParts === parts.length ? 'accepted' : acceptedParts > 0 ? 'partial' : 'refused'
    counts[bucket] += group.playerIds.length
  }
  return counts
}

// Réponse attendue affichée en tête de l'écran : la bonne réponse (titre et artiste en « both »)
// et les autres écritures acceptées automatiquement, sans doublon.
export interface ExpectedAnswer {
  title: string
  artist?: string
  variants: string[]
}

export function expectedAnswer(question: Question): ExpectedAnswer {
  const targets = answerTargets(question)
  const isBoth = targets.artist !== undefined && question.music !== undefined
  const shown = isBoth && question.music ? [question.music.title, question.music.artist] : [question.options[question.correctIndex]]
  const seen = new Set(shown.map(normalizeAnswer))
  const variants: string[] = []
  for (const candidate of [...targets.main, ...(targets.artist ?? [])]) {
    const key = normalizeAnswer(candidate)
    if (key === '' || seen.has(key)) continue
    seen.add(key)
    variants.push(candidate)
  }
  return isBoth && question.music
    ? { title: question.music.title, artist: question.music.artist, variants }
    : { title: shown[0], variants }
}
