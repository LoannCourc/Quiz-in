import {
  AUDIO_PREVIEW_S,
  AUDIO_SOURCES,
  CHOICE_COUNT,
  FEATURED_QUIZ_COUNT,
  POSTER_PALETTES,
  QUIZ_AUDIENCES,
  QUIZ_DESCRIPTION_MAX_LENGTH,
} from './constants'
import { isValidQuizId } from './quizCatalog'
import { extractOf } from './audioPlayback'
import { questionDurationS } from './gameFlow'
import type {
  AudioSourceId,
  BlindTestAsk,
  ChoiceOptions,
  Difficulty,
  MusicTrack,
  PosterPalette,
  Question,
  QuizAudience,
  QuizGameType,
  QuizSummary,
} from './types'

// Validation des lectures de quizzes/ et questions/ : la base peut contenir des données mal formées
// (import manuel, ancien format). Les entrées invalides sont ignorées au lieu de faire planter l'écran.

export interface ParsedList<T> {
  valid: T[]
  ignoredCount: number
}

export type QuizEntry = QuizSummary & { id: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString)
}

const BLIND_TEST_ASKS: readonly BlindTestAsk[] = ['title', 'artist', 'both']

export function isBlindTestAsk(value: unknown): value is BlindTestAsk {
  return BLIND_TEST_ASKS.includes(value as BlindTestAsk)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 1 || value === 2 || value === 3
}

function isQuizGameType(value: unknown): value is QuizGameType {
  return value === 'quiz' || value === 'blindTest'
}

function isAudioSource(value: unknown): value is AudioSourceId {
  return AUDIO_SOURCES.includes(value as AudioSourceId)
}

// Morceau d'une question de blind test, ou null s'il est mal formé. Le début de l'extrait doit être
// dans la preview ; la durée (celle du timer) est vérifiée avec la question (fitsBlindTestTimer).
export function parseMusicTrack(value: unknown): MusicTrack | null {
  if (!isRecord(value)) return null
  const { source, id, title, artist, startS, titleAliases, artistAliases } = value
  if (!isAudioSource(source) || !isNonEmptyString(id) || !isNonEmptyString(title) || !isNonEmptyString(artist)) return null
  if (startS !== undefined && !(isFiniteNumber(startS) && startS >= 0 && startS < AUDIO_PREVIEW_S)) return null
  if (titleAliases !== undefined && !isStringList(titleAliases)) return null
  if (artistAliases !== undefined && !isStringList(artistAliases)) return null

  const track: MusicTrack = { source, id, title, artist }
  if (startS !== undefined) track.startS = startS as number
  if (titleAliases !== undefined) track.titleAliases = titleAliases
  if (artistAliases !== undefined) track.artistAliases = artistAliases
  return track
}

// L'extrait doit couvrir tout le timer de la question (Choix multiples, seul mode des blind tests) :
// début + timer ≤ 30 s.
export function fitsBlindTestTimer(track: Pick<MusicTrack, 'startS'>, timeLimit?: number): boolean {
  const timerS = questionDurationS('choice', timeLimit)
  return extractOf(track, timerS).durationS === timerS
}

function isChoiceOptions(value: unknown): value is ChoiceOptions {
  return Array.isArray(value) && value.length === CHOICE_COUNT && value.every(isNonEmptyString)
}

// Entrées d'un nœud lu dans la base. Un nœud vide (null) n'a aucune entrée ; une valeur qui n'est
// pas un objet (texte, nombre) compte pour une entrée invalide.
function nodeEntries(value: unknown): { entries: [string, unknown][]; invalidRoot: boolean } {
  if (value === null || value === undefined) return { entries: [], invalidRoot: false }
  if (!isRecord(value)) return { entries: [], invalidRoot: true }
  return { entries: Object.entries(value), invalidRoot: false }
}

function isQuizAudience(value: unknown): value is QuizAudience {
  return QUIZ_AUDIENCES.includes(value as QuizAudience)
}

function isPosterPalette(value: unknown): value is PosterPalette {
  return POSTER_PALETTES.includes(value as PosterPalette)
}

export function isQuizDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isFeaturedRank(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= FEATURED_QUIZ_COUNT
}

// Champs d'affichage du catalogue : facultatifs à la lecture (fiches importées avant leur ajout).
// Une valeur absente ou mal formée prend la valeur par défaut au lieu d'écarter la fiche.
function catalogDisplayFields(value: Record<string, unknown>): Pick<
  QuizSummary,
  'description' | 'audience' | 'poster' | 'addedAt' | 'featuredRank'
> {
  const { description, audience, poster, addedAt, featuredRank } = value
  return {
    description:
      typeof description === 'string' && description.length <= QUIZ_DESCRIPTION_MAX_LENGTH ? description : '',
    audience: isQuizAudience(audience) ? audience : 'all',
    poster: isPosterPalette(poster) ? poster : 'violet',
    addedAt: isQuizDate(addedAt) ? addedAt : '',
    ...(isFeaturedRank(featuredRank) && { featuredRank }),
  }
}

// Fiche d'un quiz (quizzes/{quizId}), ou null si elle est absente ou mal formée.
export function parseQuizSummary(value: unknown): QuizSummary | null {
  if (!isRecord(value)) return null
  const { title, theme, gameType, language, difficulty, difficultyLabel, questionCount, estimatedMinutes } = value
  if (!isNonEmptyString(title) || !isNonEmptyString(theme) || !isNonEmptyString(difficultyLabel)) return null
  if (!isQuizGameType(gameType) || language !== 'fr') return null
  if (!isFiniteNumber(difficulty) || !isFiniteNumber(questionCount) || !isFiniteNumber(estimatedMinutes)) return null
  return {
    title,
    theme,
    gameType,
    language,
    difficulty,
    difficultyLabel,
    questionCount,
    estimatedMinutes,
    ...catalogDisplayFields(value),
  }
}

// Catalogue complet (nœud quizzes) : fiches valides et nombre d'entrées ignorées.
export function parseQuizCatalog(value: unknown): ParsedList<QuizEntry> {
  const { entries, invalidRoot } = nodeEntries(value)
  const valid: QuizEntry[] = []
  for (const [id, raw] of entries) {
    const summary = isValidQuizId(id) ? parseQuizSummary(raw) : null
    if (summary) valid.push({ id, ...summary })
  }
  const ignoredCount = (invalidRoot ? 1 : 0) + entries.length - valid.length
  return { valid, ignoredCount }
}

// Question complète (spec 8), ou null si elle est mal formée.
export function parseQuestion(value: unknown): Question | null {
  if (!isRecord(value)) return null
  const { id, text, options, correctIndex, acceptedAnswers, difficulty, explanation, timeLimit, music, ask } = value
  if (!isNonEmptyString(id) || !isNonEmptyString(text) || !isChoiceOptions(options) || !isDifficulty(difficulty)) {
    return null
  }
  if (!Number.isInteger(correctIndex) || (correctIndex as number) < 0 || (correctIndex as number) >= CHOICE_COUNT) {
    return null
  }
  if (!Array.isArray(acceptedAnswers) || acceptedAnswers.length === 0 || !acceptedAnswers.every(isNonEmptyString)) {
    return null
  }
  if (explanation !== undefined && typeof explanation !== 'string') return null
  if (timeLimit !== undefined && !(isFiniteNumber(timeLimit) && timeLimit > 0)) return null
  const track = music === undefined ? undefined : parseMusicTrack(music)
  if (track === null) return null
  if (track && !fitsBlindTestTimer(track, timeLimit as number | undefined)) return null
  // ask n'a de sens que pour un blind test ; une valeur inconnue écarte la question.
  if (ask !== undefined && !(track && isBlindTestAsk(ask))) return null

  const question: Question = { id, text, options, correctIndex: correctIndex as number, acceptedAnswers, difficulty }
  if (explanation !== undefined) question.explanation = explanation
  if (timeLimit !== undefined) question.timeLimit = timeLimit
  if (track) question.music = track
  if (ask !== undefined) question.ask = ask
  return question
}

// Questions d'un quiz (questions/{quizId}). La base renvoie un tableau, ou un objet à clés
// numériques s'il a des trous : les questions sont remises dans l'ordre des index.
export function parseQuestions(value: unknown): ParsedList<Question> {
  const { entries, invalidRoot } = nodeEntries(value)
  const ordered = entries
    .filter(([key]) => /^\d+$/.test(key))
    .sort(([a], [b]) => Number(a) - Number(b))
  const valid = ordered.map(([, raw]) => parseQuestion(raw)).filter((question) => question !== null)
  const ignoredCount = (invalidRoot ? 1 : 0) + entries.length - valid.length
  return { valid, ignoredCount }
}
