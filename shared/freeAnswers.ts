import { displayableAnswer } from './answerFilter'
import { betterMatchLevel, isAcceptedLevel, matchAnswer, normalizeAnswer, type MatchLevel } from './answerMatching'
import { FREE_ANSWER_GROUPS_MAX, FREE_ANSWER_MAX_LENGTH, HIDDEN_ANSWER_TEXT } from './constants'
import type { Answer, AnswerVerdict, FreeAnswerGroup, PlayerId, PlayerResult, Question } from './types'

// Réponse libre (spec 6.3 et 15) : ce qu'attend une question, correction automatique par partie,
// décisions de l'hôte (Contrôle) et regroupement des réponses identiques. Logique pure, testée.

// Réponses acceptées pour chaque partie demandée : une seule partie, sauf blind test « both »
// (titre dans main, artiste dans artist).
export interface AnswerTargets {
  main: readonly string[]
  artist?: readonly string[]
}

// « (I Can't Get No) Satisfaction » s'accepte aussi sans sa parenthèse.
export function withoutParentheses(title: string): string {
  return title.replace(/\s*[([].*?[)\]]/g, '').trim()
}

function titleTargets(question: Question): string[] {
  const music = question.music
  if (!music) return []
  return [music.title, withoutParentheses(music.title), ...(music.titleAliases ?? [])].filter(Boolean)
}

function artistTargets(question: Question): string[] {
  const music = question.music
  if (!music) return []
  return [music.artist, ...(music.artistAliases ?? [])]
}

export function answerTargets(question: Question): AnswerTargets {
  switch (question.music ? question.ask : undefined) {
    case 'title':
      return { main: [...question.acceptedAnswers, ...titleTargets(question)] }
    case 'artist':
      return { main: [...question.acceptedAnswers, ...artistTargets(question)] }
    case 'both':
      return { main: titleTargets(question), artist: artistTargets(question) }
    default:
      return { main: question.acceptedAnswers }
  }
}

// Correction automatique de chaque partie d'une réponse.
export interface AnswerMatch {
  main: MatchLevel
  artist?: MatchLevel
}

// Mentions de version qu'un joueur peut recopier d'un titre de blind test : artiste invité (« feat. Jay-Z »,
// « ft. », « featuring »), tout ce qui est entre parenthèses ou crochets (« (Radio Edit) », « [Remastered] »), et
// en fin de titre, après un tiret ou non (« - Remastered 2011 », « Radio Edit », « Version originale »).
const FEATURING = /\s+(feat\.?|ft\.?|featuring)\s.*$/i
const BRACKETED = /\s*[([][^)\]]*[)\]]/g
const TRAILING_VERSION =
  /(\s+-)?\s+((\d{4}\s+)?remaster(ed|isé|isée)?(\s+(en\s+)?\d{4})?(\s+version)?|radio\s+(edit|version|mix)|single\s+(version|edit)|album\s+version|original\s+(mix|version)|extended\s+(mix|version)|version\s+(originale|radio|longue|courte|album|single)|edit|mono|stereo|stéréo)\s*$/i

export function withoutTrackNotes(answer: string): string {
  let rest = answer.replace(FEATURING, '').replace(BRACKETED, ' ').trim()
  let previous
  do {
    previous = rest
    rest = rest.replace(TRAILING_VERSION, '').trim()
  } while (rest !== previous && rest !== '')
  return rest === '' ? answer : rest
}

// Blind test : la réponse telle quelle, ou sans ses mentions de version ; le meilleur des deux.
function matchTrackAnswer(answer: string, targets: readonly string[]): MatchLevel {
  const asTyped = matchAnswer(answer, targets)
  const cleaned = withoutTrackNotes(answer)
  return cleaned === answer ? asTyped : betterMatchLevel(asTyped, matchAnswer(cleaned, targets))
}

export function matchFreeAnswer(question: Question, answer: Pick<Answer, 'value' | 'artist'>): AnswerMatch {
  const targets = answerTargets(question)
  const match = question.music ? matchTrackAnswer : matchAnswer
  const main = match(String(answer.value), targets.main)
  if (!targets.artist) return { main }
  return { main, artist: match(answer.artist ?? '', targets.artist) }
}

// Décisions de l'hôte pendant la validation (Contrôle), par réponse normalisée (normalizeAnswer) :
// true = acceptée, false = refusée ; absente = correction automatique. Gardées dans l'app de
// l'hôte jusqu'à « Valider », jamais écrites dans la base.
export interface ValidationDecisions {
  main?: Readonly<Record<string, boolean>>
  // Blind test « both » : partie artiste.
  artist?: Readonly<Record<string, boolean>>
  // Groupes masqués sur la TV (clé de groupe, FreeAnswerGroupDetail.key).
  hidden?: Readonly<Record<string, boolean>>
}

// Parties de la réponse jugées justes : main (la réponse, ou le titre en « both ») et artist (« both »).
export interface AcceptedParts {
  main: boolean
  artist?: boolean
}

export function acceptedParts(
  match: AnswerMatch,
  answer: Pick<Answer, 'value' | 'artist'>,
  decisions: ValidationDecisions = {},
): AcceptedParts {
  const main = decisions.main?.[normalizeAnswer(String(answer.value))] ?? isAcceptedLevel(match.main)
  if (match.artist === undefined) return { main }
  const artist = decisions.artist?.[normalizeAnswer(answer.artist ?? '')] ?? isAcceptedLevel(match.artist)
  return { main, artist }
}

// Part de la réponse jugée juste : 1, 0,5 (une partie sur deux) ou 0.
export function acceptedFraction(parts: AcceptedParts): number {
  if (parts.artist === undefined) return parts.main ? 1 : 0
  return ((parts.main ? 1 : 0) + (parts.artist ? 1 : 0)) / 2
}

export function verdictOf(fraction: number): AnswerVerdict {
  if (fraction >= 1) return 'correct'
  return fraction > 0 ? 'partial' : 'wrong'
}

// Résultat public à partir des points d'une réponse entièrement juste (Rapidité comprise) ; en
// « both », le détail par partie, pour l'écran du joueur.
export function resultOf(parts: AcceptedParts, fullPoints: number): PlayerResult {
  const fraction = acceptedFraction(parts)
  const result: PlayerResult = { correct: fraction >= 1, points: Math.round(fullPoints * fraction) }
  if (verdictOf(fraction) === 'partial') result.partial = true
  if (parts.artist !== undefined) result.parts = { title: parts.main, artist: parts.artist }
  return result
}

// Réponses identiques après normalisation, regroupées (écran de validation de l'hôte, révélation TV).
export interface FreeAnswerGroupDetail {
  // Clé du groupe : réponse normalisée (« titre|artiste » pour un blind test « both »).
  key: string
  mainKey: string
  artistKey?: string
  // Texte tel que tapé par le premier joueur du groupe (« titre – artiste » pour « both »).
  text: string
  playerIds: PlayerId[]
  match: AnswerMatch
}

function displayText(answer: Answer, isBoth: boolean): string {
  const parts = isBoth ? [String(answer.value), answer.artist ?? ''] : [String(answer.value)]
  return parts
    .map((part) => part.trim().slice(0, FREE_ANSWER_MAX_LENGTH))
    .filter((part) => part !== '')
    .join(' – ')
}

// Groupes des réponses des joueurs encore dans la partie, les plus nombreux d'abord.
export function groupFreeAnswers(
  question: Question,
  answers: Readonly<Record<PlayerId, Answer>>,
  playerIds: readonly PlayerId[],
): FreeAnswerGroupDetail[] {
  const isBoth = answerTargets(question).artist !== undefined
  const groups = new Map<string, FreeAnswerGroupDetail>()
  for (const playerId of playerIds) {
    const answer = answers[playerId]
    if (!answer) continue
    const mainKey = normalizeAnswer(String(answer.value))
    const artistKey = isBoth ? normalizeAnswer(answer.artist ?? '') : undefined
    const key = artistKey === undefined ? mainKey : `${mainKey}|${artistKey}`
    const existing = groups.get(key)
    if (existing) {
      existing.playerIds.push(playerId)
      continue
    }
    const group: FreeAnswerGroupDetail = {
      key,
      mainKey,
      text: displayText(answer, isBoth),
      playerIds: [playerId],
      match: matchFreeAnswer(question, answer),
    }
    if (artistKey !== undefined) group.artistKey = artistKey
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => b.playerIds.length - a.playerIds.length || a.key.localeCompare(b.key))
}

const VERDICT_ORDER: readonly AnswerVerdict[] = ['correct', 'partial', 'wrong']

// Groupes publiés à la révélation : texte filtré (ou masqué par l'hôte), verdict d'après les
// résultats, les plus nombreux d'abord (bonnes réponses d'abord à égalité), FREE_ANSWER_GROUPS_MAX au plus.
export function publicFreeAnswerGroups(
  groups: readonly FreeAnswerGroupDetail[],
  results: Readonly<Record<PlayerId, PlayerResult>>,
  hidden: Readonly<Record<string, boolean>> = {},
): FreeAnswerGroup[] {
  const published = groups.map((group) => {
    const result = results[group.playerIds[0]]
    const verdict: AnswerVerdict = result?.correct ? 'correct' : result?.partial ? 'partial' : 'wrong'
    return {
      // Réponse faite d'espaces seulement : rien de lisible à montrer.
      value: hidden[group.key] || group.text === '' ? HIDDEN_ANSWER_TEXT : displayableAnswer(group.text),
      playerIds: [...group.playerIds],
      verdict,
    }
  })
  return published
    .sort(
      (a, b) =>
        b.playerIds.length - a.playerIds.length || VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict),
    )
    .slice(0, FREE_ANSWER_GROUPS_MAX)
}
