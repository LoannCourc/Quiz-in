// Génère les fichiers à importer dans la console Firebase à partir de content/quizzes/*.json :
//   import/quizzes.json   → à importer sur le nœud quizzes
//   import/questions.json → à importer sur le nœud questions
// Usage (depuis content/) : npm run build
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { isAnswerCorrect } from '../../shared/answerMatching'
import {
  CHOICE_COUNT,
  EXPLANATION_MAX_LENGTH,
  OPTION_TEXT_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  QUESTION_TIME_LIMIT_MAX_S,
  QUESTIONS_PER_GAME,
} from '../../shared/constants'
import { averageDifficulty, difficultyLevel, estimateQuizMinutes, isValidQuizId } from '../../shared/quizCatalog'
import type { DifficultyLevel, Question, QuizSummary } from '../../shared/types'

// Fichier source d'un quiz (spec 8). reviewStatus n'est pas importé dans la base.
interface QuizFile {
  id: string
  title: string
  theme: string
  reviewStatus?: string
  questions: Question[]
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const quizzesDir = join(contentDir, 'quizzes')
const outputDir = join(contentDir, 'import')

function questionErrors(question: Question): string[] {
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
  if (quiz.questions.length < QUESTIONS_PER_GAME) errors.push(`au moins ${QUESTIONS_PER_GAME} questions`)
  const ids = quiz.questions.map((question) => question.id)
  if (new Set(ids).size !== ids.length) errors.push('ids de questions en double')
  quiz.questions.forEach((question, index) => {
    questionErrors(question).forEach((error) => errors.push(`question ${index + 1} (${question.id}) : ${error}`))
  })
  return errors
}

function toSummary(quiz: QuizFile): QuizSummary {
  const difficulty = averageDifficulty(quiz.questions.map((question) => question.difficulty))
  return {
    title: quiz.title,
    theme: quiz.theme,
    gameType: 'quiz',
    language: 'fr',
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficultyLevel(difficulty)],
    questionCount: quiz.questions.length,
    estimatedMinutes: estimateQuizMinutes(Math.min(quiz.questions.length, QUESTIONS_PER_GAME)),
  }
}

const fileNames = readdirSync(quizzesDir).filter((name) => name.endsWith('.json'))
const quizzes = fileNames.map((fileName) => ({
  fileName,
  quiz: JSON.parse(readFileSync(join(quizzesDir, fileName), 'utf8')) as QuizFile,
}))

const allErrors = quizzes.flatMap(({ fileName, quiz }) => quizErrors(quiz, fileName).map((error) => `${fileName} : ${error}`))
if (allErrors.length > 0) {
  console.error(`Contenu invalide, aucun fichier généré :\n- ${allErrors.join('\n- ')}`)
  process.exit(1)
}

const summaries = Object.fromEntries(quizzes.map(({ quiz }) => [quiz.id, toSummary(quiz)]))
const questions = Object.fromEntries(quizzes.map(({ quiz }) => [quiz.id, quiz.questions]))

mkdirSync(outputDir, { recursive: true })
writeFileSync(join(outputDir, 'quizzes.json'), `${JSON.stringify(summaries, null, 2)}\n`)
writeFileSync(join(outputDir, 'questions.json'), `${JSON.stringify(questions, null, 2)}\n`)

for (const { quiz } of quizzes) {
  const note = quiz.reviewStatus ? ` [${quiz.reviewStatus}]` : ''
  console.log(`✓ ${quiz.id} : ${quiz.questions.length} questions, ${summaries[quiz.id].difficultyLabel}${note}`)
}
console.log(`Fichiers écrits dans ${outputDir} :`)
console.log('  quizzes.json   → importer sur le nœud /quizzes')
console.log('  questions.json → importer sur le nœud /questions')
console.log('Ne jamais importer à la racine de la base : cela effacerait les parties en cours.')
