import type { PublicSession } from '@shared/types'

// Pastille « QUESTION n/N » selon le jeu : Blind test, Bluff, Gribouille (« Manche »).
export type ProgressKind = 'question' | 'blindTest' | 'bluff' | 'round'

export function progressKindOf(session: Pick<PublicSession, 'settings' | 'reveal' | 'currentQuestion'>): ProgressKind {
  if (session.settings.answerMode === 'draw') return 'round'
  if (session.settings.answerMode === 'bluff') return 'bluff'
  return session.reveal?.music || session.currentQuestion?.audio ? 'blindTest' : 'question'
}

// Zone sous le titre de « La bonne réponse » : tout y tient au-dessus du bandeau, texte réduit au besoin.
export const ANSWER_FIT = { variables: ['--text-scale'], boxes: '.answer-body' }

// Au-delà de 3 lignes à la taille normale : taille réduite (lignes de 25 caractères environ, en Nunito 900).
const LONG_TEXT_MIN_LENGTH = 73

export function answerSizeClass(texts: readonly string[]): string {
  return Math.max(0, ...texts.map((text) => text.length)) >= LONG_TEXT_MIN_LENGTH ? 'is-long' : ''
}

// Lettre d'un choix du Bluff : A, B, C… (jusqu'à 21 choix : 20 joueurs et la vraie réponse).
export function bluffLetter(index: number): string {
  return String.fromCharCode(65 + index)
}
