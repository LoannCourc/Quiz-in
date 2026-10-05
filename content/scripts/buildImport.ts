// Génère les fichiers à importer dans la console Firebase à partir de content/quizzes/*.json :
//   import/quizzes.json   → à importer sur le nœud quizzes
//   import/questions.json → à importer sur le nœud questions
// Usage (depuis content/) : npm run build
// Blind test : les identifiants des morceaux viennent de music-check/<quizId>.json, seulement s'ils sont vérifiés.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { isAnswerCorrect, normalizeAnswer } from '../../shared/answerMatching'
import { extractOf } from '../../shared/audioPlayback'
import {
  CHOICE_COUNT,
  EXPLANATION_MAX_LENGTH,
  FREE_ANSWER_MAX_LENGTH,
  OPTION_TEXT_MAX_LENGTH,
  POSTER_PALETTES,
  QUESTION_DURATION_S,
  QUESTION_TEXT_MAX_LENGTH,
  QUESTION_TIME_LIMIT_MAX_S,
  QUESTIONS_PER_GAME,
  QUIZ_AUDIENCES,
  QUIZ_DESCRIPTION_MAX_LENGTH,
} from '../../shared/constants'
import { answerTargets } from '../../shared/freeAnswers'
import { averageDifficulty, difficultyLevel, estimateQuizMinutes, isValidQuizId } from '../../shared/quizCatalog'
import { fitsBlindTestTimer, isBlindTestAsk, isFeaturedRank, isQuizDate, parseMusicTrack } from '../../shared/quizValidation'
import type {
  BlindTestAsk,
  DifficultyLevel,
  MusicTrack,
  PosterPalette,
  Question,
  QuizAudience,
  QuizGameType,
  QuizSummary,
} from '../../shared/types'
import { contentDir, quizzesDir, readMusicCheck, sameQuery, type SourceMusic } from './musicCheck'

// Question du fichier source : un blind test donne l'artiste et le titre, pas l'identifiant du morceau.
type SourceQuestion = Omit<Question, 'music'> & { music?: SourceMusic }

// Fichier source d'un quiz (spec 8). reviewStatus n'est pas importé dans la base.
interface QuizFile {
  id: string
  // Absent : quiz classique.
  gameType?: QuizGameType
  title: string
  theme: string
  description: string
  audience: QuizAudience
  poster: PosterPalette
  addedAt: string
  featuredRank?: number
  reviewStatus?: string
  questions: SourceQuestion[]
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

const outputDir = join(contentDir, 'import')

function questionErrors(question: SourceQuestion): string[] {
  const errors: string[] = []
  const { text, options, correctIndex, acceptedAnswers, difficulty, explanation, timeLimit } = question
  if (!question.id) errors.push('id manquant')
  if (!text || text.length > QUESTION_TEXT_MAX_LENGTH) errors.push(`énoncé vide ou > ${QUESTION_TEXT_MAX_LENGTH} caractères`)
  if (options?.length !== CHOICE_COUNT) errors.push(`il faut exactement ${CHOICE_COUNT} propositions`)
  if (options?.some((option) => !option || option.length > OPTION_TEXT_MAX_LENGTH)) {
    errors.push(`proposition vide ou > ${OPTION_TEXT_MAX_LENGTH} caractères`)
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= CHOICE_COUNT) {
    errors.push('correctIndex hors de 0 à 3')
  }
  if (!acceptedAnswers?.length) errors.push('acceptedAnswers vide')
  if (![1, 2, 3].includes(difficulty)) errors.push('difficulty doit valoir 1, 2 ou 3')
  if (explanation !== undefined && explanation.length > EXPLANATION_MAX_LENGTH) {
    errors.push(`explication > ${EXPLANATION_MAX_LENGTH} caractères`)
  }
  if (timeLimit !== undefined && !(timeLimit > 0 && timeLimit <= QUESTION_TIME_LIMIT_MAX_S)) {
    errors.push(`timeLimit hors de 1 à ${QUESTION_TIME_LIMIT_MAX_S} s`)
  }
  if (errors.length > 0) return errors

  // La question doit fonctionner dans les deux modes (spec 8).
  options.forEach((option, index) => {
    const accepted = isAnswerCorrect(option, acceptedAnswers)
    if (index === correctIndex && !accepted) errors.push(`la bonne proposition « ${option} » n'est pas acceptée en réponse libre`)
    if (index !== correctIndex && accepted) errors.push(`la mauvaise proposition « ${option} » serait acceptée en réponse libre`)
  })
  return errors
}

function quizErrors(quiz: QuizFile, fileName: string): string[] {
  const errors: string[] = []
  if (`${quiz.id}.json` !== fileName) errors.push(`l'id « ${quiz.id} » doit correspondre au nom du fichier`)
  if (!isValidQuizId(quiz.id)) errors.push('id : minuscules, chiffres et tirets uniquement')
  if (!quiz.title || !quiz.theme) errors.push('title et theme obligatoires')
  if (!quiz.description || quiz.description.length > QUIZ_DESCRIPTION_MAX_LENGTH) {
    errors.push(`description vide ou > ${QUIZ_DESCRIPTION_MAX_LENGTH} caractères`)
  }
  if (!QUIZ_AUDIENCES.includes(quiz.audience)) errors.push(`audience : ${QUIZ_AUDIENCES.join(', ')}`)
  if (!POSTER_PALETTES.includes(quiz.poster)) errors.push(`poster : ${POSTER_PALETTES.join(', ')}`)
  if (!isQuizDate(quiz.addedAt)) errors.push('addedAt : date AAAA-MM-JJ')
  if (quiz.featuredRank !== undefined && !isFeaturedRank(quiz.featuredRank)) errors.push('featuredRank : entier de 1 à 10')
  if (quiz.questions.length < QUESTIONS_PER_GAME) errors.push(`au moins ${QUESTIONS_PER_GAME} questions`)
  const ids = quiz.questions.map((question) => question.id)
  if (new Set(ids).size !== ids.length) errors.push('ids de questions en double')
  quiz.questions.forEach((question, index) => {
    const prefix = `question ${index + 1} (${question.id}) : `
    questionErrors(question).forEach((error) => errors.push(prefix + error))
    if (quiz.gameType !== 'blindTest' && question.music) errors.push(`${prefix}music réservé aux blind tests`)
    if (quiz.gameType !== 'blindTest' && question.ask !== undefined) errors.push(`${prefix}ask réservé aux blind tests`)
    if (quiz.gameType === 'blindTest') {
      askErrors(question).forEach((error) => errors.push(prefix + error))
      freeAnswerTargetErrors(question).forEach((error) => errors.push(prefix + error))
    }
  })
  if (quiz.gameType === 'blindTest') errors.push(...musicErrors(quiz))
  return errors
}

// Morceau d'une question de blind test, pris dans le fichier de contrôle : vérifié, même artiste et même
// titre que dans la source, avec un extrait disponible.
// pending : vérification à faire (le quiz est exclu de l'import, les autres quiz restent importables).
// error : contenu invalide (bloque la génération, comme toute autre erreur de format).
type TrackCheck = { kind: 'track'; track: MusicTrack } | { kind: 'pending' | 'error'; reason: string }

// Énoncé de chaque type de question de blind test (spec 15) : « Quel est ce titre ? » (propositions :
// titres), « Quel artiste ? » (propositions : artistes), « Quel est ce morceau ? » (propositions
// « Titre – Artiste » ; en Réponse libre, deux champs).
const ASK_PROMPTS: Record<BlindTestAsk, string> = {
  title: 'Quel est ce titre ?',
  artist: 'Quel artiste ?',
  both: 'Quel est ce morceau ?',
}

function aliasErrors(aliases: unknown, field: string): string[] {
  if (aliases === undefined) return []
  const isValid =
    Array.isArray(aliases) &&
    aliases.every((alias) => typeof alias === 'string' && alias.trim() !== '' && alias.length <= FREE_ANSWER_MAX_LENGTH)
  return isValid ? [] : [`${field} : liste de textes de 1 à ${FREE_ANSWER_MAX_LENGTH} caractères`]
}

// Énoncé, ask et alias d'une question de blind test.
function askErrors(question: SourceQuestion): string[] {
  if (!isBlindTestAsk(question.ask)) return [`ask obligatoire pour un blind test : ${Object.keys(ASK_PROMPTS).join(', ')}`]
  const errors: string[] = []
  const prompt = ASK_PROMPTS[question.ask]
  if (question.text !== prompt) errors.push(`ask « ${question.ask} » : l'énoncé doit être « ${prompt} »`)
  errors.push(...aliasErrors(question.music?.titleAliases, 'music.titleAliases'))
  errors.push(...aliasErrors(question.music?.artistAliases, 'music.artistAliases'))
  return errors
}

// Question telle qu'elle sera corrigée en Réponse libre (identifiant du morceau inutile ici).
function asQuestion(question: SourceQuestion): Question {
  const { music, ...rest } = question
  return music ? { ...rest, music: { source: 'deezer', id: '', ...music } } : rest
}

// Blind test « titre » ou « artiste » : en Réponse libre, la question accepte aussi le titre, l'artiste
// et leurs alias ; ils ne doivent jamais faire accepter une mauvaise proposition.
function freeAnswerTargetErrors(question: SourceQuestion): string[] {
  if (question.ask !== 'title' && question.ask !== 'artist') return []
  const { main } = answerTargets(asQuestion(question))
  return question.options.flatMap((option, index) => {
    const accepted = isAnswerCorrect(option, main)
    if (index === question.correctIndex && !accepted) return [`réponse libre : « ${option} » ne serait pas acceptée`]
    if (index !== question.correctIndex && accepted) return [`réponse libre : la mauvaise proposition « ${option} » serait acceptée`]
    return []
  })
}

// Formulations qui supposent des propositions sous les yeux : à reformuler pour la Réponse libre.
const CHOICE_ONLY_WORDING = /\b(parmi|ci-dessous|lequel de ces|laquelle de ces|lesquels de ces|lesquelles de ces)\b/i

function freeAnswerWarnings(quiz: QuizFile): string[] {
  return quiz.questions.flatMap((question) => {
    const warnings: string[] = []
    if (CHOICE_ONLY_WORDING.test(question.text)) warnings.push(`${question.id} : énoncé à reformuler pour la Réponse libre`)
    const music = question.music ? { source: 'deezer' as const, id: '', ...question.music } : undefined
    if (music && extractOf(music, QUESTION_DURATION_S.free).durationS < QUESTION_DURATION_S.free) {
      warnings.push(`${question.id} : en Réponse libre, l'extrait (startS ${music.startS}) s'arrête avant la fin du chrono`)
    }
    return warnings
  })
}

function checkTrack(quizId: string, question: SourceQuestion): TrackCheck {
  if (!question.music) return { kind: 'error', reason: 'champ music (artist, title) manquant' }
  const { title, artist, startS, titleAliases, artistAliases } = question.music
  // La bonne proposition doit citer le titre (ou l'artiste) du morceau : évite d'associer le mauvais extrait.
  const cited = question.ask === 'artist' ? artist : title
  const correct = normalizeAnswer(question.options[question.correctIndex] ?? '')
  if (!correct.includes(normalizeAnswer(cited))) {
    return { kind: 'error', reason: `la bonne proposition ne cite pas « ${cited} »` }
  }
  const entry = readMusicCheck(quizId)?.tracks.find((track) => track.questionId === question.id)
  if (!entry) return { kind: 'pending', reason: `jamais recherché : npm run music:lookup -- ${quizId}` }
  if (!sameQuery(entry, question.music)) return { kind: 'pending', reason: 'artiste ou titre modifié : relancer music:lookup' }
  if (!entry.found?.previewAvailable) return { kind: 'pending', reason: 'aucun morceau avec extrait trouvé' }
  // Public familial : jamais de version marquée explicite par Deezer.
  if (entry.found.explicit) return { kind: 'pending', reason: 'version marquée explicite : choisir une autre version ou un autre morceau' }
  if (!entry.verified) return { kind: 'pending', reason: 'non vérifié (verified: false)' }
  const track = parseMusicTrack({ source: 'deezer', id: entry.found.id, title, artist, startS, titleAliases, artistAliases })
  if (!track || !fitsBlindTestTimer(track, question.timeLimit)) {
    return { kind: 'error', reason: 'extrait invalide : startS + timer de la question ≤ 30 s (startS de 0 à 10 avec le timer de 20 s)' }
  }
  return { kind: 'track', track }
}

function musicIssues(quiz: QuizFile, kind: 'pending' | 'error'): string[] {
  if (quiz.gameType !== 'blindTest') return []
  return quiz.questions.flatMap((question, index) => {
    const check = checkTrack(quiz.id, question)
    return check.kind === kind ? [`question ${index + 1} (${question.id}) : ${check.reason}`] : []
  })
}

function musicErrors(quiz: QuizFile): string[] {
  return musicIssues(quiz, 'error')
}

// Questions telles qu'importées : pour un blind test, le morceau vérifié (avec son identifiant).
function toQuestions(quiz: QuizFile): Question[] {
  return quiz.questions.map(({ music, ...question }) => {
    if (quiz.gameType !== 'blindTest') return question
    const check = checkTrack(quiz.id, { ...question, music })
    if (check.kind !== 'track') throw new Error(`${quiz.id} : morceau non vérifié importé`)
    return { ...question, music: check.track }
  })
}

function toSummary(quiz: QuizFile): QuizSummary {
  const difficulty = averageDifficulty(quiz.questions.map((question) => question.difficulty))
  return {
    title: quiz.title,
    theme: quiz.theme,
    gameType: quiz.gameType ?? 'quiz',
    language: 'fr',
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficultyLevel(difficulty)],
    questionCount: quiz.questions.length,
    estimatedMinutes: estimateQuizMinutes(Math.min(quiz.questions.length, QUESTIONS_PER_GAME)),
    description: quiz.description,
    audience: quiz.audience,
    poster: quiz.poster,
    addedAt: quiz.addedAt,
    ...(quiz.featuredRank !== undefined && { featuredRank: quiz.featuredRank }),
  }
}

const fileNames = readdirSync(quizzesDir).filter((name) => name.endsWith('.json'))
const quizzes = fileNames.map((fileName) => ({
  fileName,
  quiz: JSON.parse(readFileSync(join(quizzesDir, fileName), 'utf8')) as QuizFile,
}))

// Une place du Top 10 ne peut être donnée qu'à un seul quiz du même onglet (quiz ou blind test).
function featuredRankErrors(): string[] {
  const gameTypes: QuizGameType[] = ['quiz', 'blindTest']
  return gameTypes.flatMap((gameType) => {
    const ranks = quizzes
      .filter(({ quiz }) => (quiz.gameType ?? 'quiz') === gameType)
      .map(({ quiz }) => quiz.featuredRank)
      .filter((rank) => rank !== undefined)
    const duplicates = [...new Set(ranks.filter((rank, index) => ranks.indexOf(rank) !== index))]
    return duplicates.map((rank) => `featuredRank ${rank} donné à plusieurs quiz de type ${gameType}`)
  })
}

const allErrors = [
  ...quizzes.flatMap(({ fileName, quiz }) => quizErrors(quiz, fileName).map((error) => `${fileName} : ${error}`)),
  ...featuredRankErrors(),
]
if (allErrors.length > 0) {
  console.error(`Contenu invalide, aucun fichier généré :\n- ${allErrors.join('\n- ')}`)
  process.exit(1)
}

// Avertissements (n'empêchent pas l'import) : questions à revoir pour la Réponse libre.
for (const { quiz } of quizzes) {
  const warnings = freeAnswerWarnings(quiz)
  if (warnings.length > 0) console.warn(`⚠ ${quiz.id}, Réponse libre :\n  - ${warnings.join('\n  - ')}`)
}

// Blind test dont un morceau n'est pas encore vérifié : exclu de l'import, avec la liste de ce qui manque.
const pending = quizzes.map(({ quiz }) => ({ quiz, issues: musicIssues(quiz, 'pending') }))
const imported = pending.filter(({ issues }) => issues.length === 0).map(({ quiz }) => ({ quiz }))
for (const { quiz, issues } of pending.filter(({ issues }) => issues.length > 0)) {
  console.warn(`⚠ ${quiz.id} non importé, morceaux à vérifier :\n  - ${issues.join('\n  - ')}`)
}

const summaries = Object.fromEntries(imported.map(({ quiz }) => [quiz.id, toSummary(quiz)]))
const questions = Object.fromEntries(imported.map(({ quiz }) => [quiz.id, toQuestions(quiz)]))

mkdirSync(outputDir, { recursive: true })
writeFileSync(join(outputDir, 'quizzes.json'), `${JSON.stringify(summaries, null, 2)}\n`)
writeFileSync(join(outputDir, 'questions.json'), `${JSON.stringify(questions, null, 2)}\n`)

for (const { quiz } of imported) {
  const note = quiz.reviewStatus ? ` [${quiz.reviewStatus}]` : ''
  console.log(`✓ ${quiz.id} : ${quiz.questions.length} questions, ${summaries[quiz.id].difficultyLabel}${note}`)
}
console.log(`Fichiers écrits dans ${outputDir} :`)
console.log('  quizzes.json   → importer sur le nœud /quizzes')
console.log('  questions.json → importer sur le nœud /questions')
console.log('Ne jamais importer à la racine de la base : cela effacerait les parties en cours.')
