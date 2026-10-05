// Contrôles du contenu d'un quiz Bluff (spec 8 et 16), utilisés par buildImport.ts.
import { containsForbiddenWord } from '../../shared/answerFilter'
import { isAcceptedLevel, matchAnswer, normalizeAnswer } from '../../shared/answerMatching'
import {
  BLUFF_MAX_DECOYS,
  BLUFF_MAX_LENGTH,
  BLUFF_MIN_DECOYS,
  EXPLANATION_MAX_LENGTH,
  QUESTION_TEXT_MAX_LENGTH,
  QUESTION_TIME_LIMIT_MAX_S,
} from '../../shared/constants'
import type { BluffQuestion } from '../../shared/types'

// Champs des questions classiques, interdits dans une question de Bluff (elle n'a pas de propositions).
const CLASSIC_FIELDS = ['options', 'correctIndex', 'music', 'ask'] as const

function isShortText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && value.length <= BLUFF_MAX_LENGTH
}

// Ce que les joueurs verront parmi les choix du vote : vraie réponse et leurres courts, sans mot interdit.
export function bluffQuestionErrors(question: BluffQuestion): string[] {
  const errors: string[] = []
  const { id, text, answer, acceptedAnswers, decoys, difficulty, explanation, timeLimit } = question
  if (!id) errors.push('id manquant')
  if (!text || text.length > QUESTION_TEXT_MAX_LENGTH) errors.push(`énoncé vide ou > ${QUESTION_TEXT_MAX_LENGTH} caractères`)
  if (!isShortText(answer)) errors.push(`answer vide ou > ${BLUFF_MAX_LENGTH} caractères`)
  if (!Array.isArray(acceptedAnswers) || !acceptedAnswers.every((accepted) => typeof accepted === 'string' && accepted.trim() !== '')) {
    errors.push('acceptedAnswers : liste de textes (autres écritures de la vraie réponse, éventuellement vide)')
  }
  if (!Array.isArray(decoys) || decoys.length < BLUFF_MIN_DECOYS || decoys.length > BLUFF_MAX_DECOYS) {
    errors.push(`decoys : de ${BLUFF_MIN_DECOYS} à ${BLUFF_MAX_DECOYS} leurres`)
  } else if (!decoys.every(isShortText)) {
    errors.push(`leurre vide ou > ${BLUFF_MAX_LENGTH} caractères`)
  }
  if (![1, 2, 3].includes(difficulty)) errors.push('difficulty doit valoir 1, 2 ou 3')
  if (explanation !== undefined && explanation.length > EXPLANATION_MAX_LENGTH) errors.push(`explication > ${EXPLANATION_MAX_LENGTH} caractères`)
  if (timeLimit !== undefined && !(timeLimit > 0 && timeLimit <= QUESTION_TIME_LIMIT_MAX_S)) {
    errors.push(`timeLimit hors de 1 à ${QUESTION_TIME_LIMIT_MAX_S} s`)
  }
  for (const field of CLASSIC_FIELDS) {
    if (field in question) errors.push(`${field} : champ des questions classiques, absent d'un Bluff`)
  }
  if (errors.length > 0) return errors

  const truths = [answer, ...acceptedAnswers]
  if (containsForbiddenWord(answer)) errors.push(`la vraie réponse « ${answer} » contient un mot interdit`)
  const seen = new Set<string>()
  for (const decoy of decoys) {
    const key = normalizeAnswer(decoy)
    if (seen.has(key)) errors.push(`leurre en double : « ${decoy} »`)
    seen.add(key)
    // Un leurre refusé comme proposition (vraie réponse, à une faute près) serait une seconde vraie réponse.
    if (isAcceptedLevel(matchAnswer(decoy, truths))) errors.push(`le leurre « ${decoy} » vaut la vraie réponse`)
    if (containsForbiddenWord(decoy)) errors.push(`le leurre « ${decoy} » contient un mot interdit`)
  }
  return errors
}

// Avertissements (n'empêchent pas l'import) : leurre très ressemblant à la vraie réponse.
export function bluffQuestionWarnings(question: BluffQuestion): string[] {
  const truths = [question.answer, ...question.acceptedAnswers]
  return question.decoys
    .filter((decoy) => matchAnswer(decoy, truths) === 'close')
    .map((decoy) => `${question.id} : le leurre « ${decoy} » ressemble beaucoup à la vraie réponse`)
}

// Question telle qu'importée : seulement les champs connus.
export function toBluffQuestion(question: BluffQuestion): BluffQuestion {
  const { id, text, answer, acceptedAnswers, decoys, difficulty, explanation, timeLimit } = question
  return {
    id,
    text,
    answer,
    acceptedAnswers,
    decoys,
    difficulty,
    ...(explanation !== undefined && { explanation }),
    ...(timeLimit !== undefined && { timeLimit }),
  }
}
