import type { GameQuestion, Question } from './types'

// Question classique (choix multiples ou Réponse libre, blind test compris) : ni Bluff ni Dessine-moi.
export function isClassicQuestion(question: GameQuestion): question is Question {
  return !('decoys' in question) && !('word' in question)
}
