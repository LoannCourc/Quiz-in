// Génère les fichiers à importer dans la console Firebase à partir de content/quizzes/*.json :
//   import/quizzes.json   → à importer sur le nœud quizzes
//   import/questions.json → à importer sur le nœud questions
// Usage (depuis content/) : npm run build
// Blind test : les identifiants des morceaux viennent de music-check/<quizId>.json, seulement s'ils sont vérifiés.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { isAnswerCorrect, normalizeAnswer } from '../../shared/answerMatching'
import {
  CHOICE_COUNT,
  EXPLANATION_MAX_LENGTH,
  OPTION_TEXT_MAX_LENGTH,
  POSTER_PALETTES,
  QUESTION_TEXT_MAX_LENGTH,
  QUESTION_TIME_LIMIT_MAX_S,
  QUESTIONS_PER_GAME,
  QUIZ_AUDIENCES,
  QUIZ_DESCRIPTION_MAX_LENGTH,
} from '../../shared/constants'
import { averageDifficulty, difficultyLevel, estimateQuizMinutes, isValidQuizId } from '../../shared/quizCatalog'
import { isFeaturedRank, isQuizDate, parseMusicTrack } from '../../shared/quizValidation'
import type {
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
  })
  if (quiz.gameType === 'blindTest') errors.push(...musicErrors(quiz))
  return errors
}

// Morceau d'une question de blind test, pris dans le fichier de contrôle : vérifié, même artiste et même
// titre que dans la source, avec un extrait disponible.
// pending : vérification à faire (le quiz est exclu de l'import, les autres quiz restent importables).
// error : contenu invalide (bloque la génération, comme toute autre erreur de format).
type TrackCheck = { kind: 'track'; track: MusicTrack } | { kind: 'pending' | 'error'; reason: string }

function checkTrack(quizId: string, question: SourceQuestion): TrackCheck {
  if (!question.music) return { kind: 'error', reason: 'champ music (artist, title) manquant' }
  const { title, artist, startS, durationS } = question.music
  // La bonne proposition doit citer le titre du morceau : évite d'associer le mauvais extrait.
  const correct = normalizeAnswer(question.options[question.correctIndex] ?? '')
  if (!correct.includes(normalizeAnswer(title))) {
    return { kind: 'error', reason: `la bonne proposition ne cite pas « ${title} »` }
  }
  const entry = readMusicCheck(quizId)?.tracks.find((track) => track.questionId === question.id)
  if (!entry) return { kind: 'pending', reason: `jamais recherché : npm run music:lookup -- ${quizId}` }
  if (!sameQuery(entry, question.music)) return { kind: 'pending', reason: 'artiste ou titre modifié : relancer music:lookup' }
  if (!entry.found?.previewAvailable) return { kind: 'pending', reason: 'aucun morceau avec extrait trouvé' }
  if (!entry.verified) return { kind: 'pending', reason: 'non vérifié (verified: false)' }
  const track = parseMusicTrack({ source: 'deezer', id: entry.found.id, title, artist, startS, durationS })
  return track ? { kind: 'track', track } : { kind: 'error', reason: 'extrait invalide (startS + durationS ≤ 30, durationS de 10 à 15)' }
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
