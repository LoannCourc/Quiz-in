import { removeDiacritics } from './answerMatching'
import { BLUFF_ANSWER_STYLE_LEVEL, BLUFF_MAX_LENGTH, BLUFF_STYLE_MIN_SAMPLES } from './constants'
import type { BluffChoice } from './types'

// Bluff, écran du vote : la vraie réponse et les leurres, parfaitement écrits, se repèrent parmi les propositions
// tapées vite par les joueurs. On adapte leur style à celui des propositions de la manche, à l'affichage du vote
// seulement : le score passe par l'index du choix, jamais par son texte, et la révélation montre le texte d'origine.

export type BluffAnswerStyleLevel = 'clean' | 'light'

export interface BluffWritingStyle {
  capitalized: boolean
  accented: boolean
  finalDot: boolean
}

// Premiers mots qu'on peut mettre en minuscule sans risque ; tout autre mot peut être un nom propre (« Shrek »).
const LOWERCASE_STARTERS: ReadonlySet<string> = new Set(
  "le la les l un une des du de d au aux à en par pour sur sous dans avec sans il elle ils elles on ce cet cette ces c son sa ses leur leurs parce car comme après avant grâce selon pendant".split(' '),
)

// Mots dont l'accent change le sens : toujours gardés.
const KEPT_ACCENTS: ReadonlySet<string> = new Set(
  'à où là dû due mûr mûre mûrs mûres sûr sûre sûrs sûres côté côtés côte côtes tâche tâches pêcheur pêcheurs pécheur pécheurs salé salée salés salées marié mariée mariés mariées jeûne dés lès près prés'.split(' '),
)

const hasAccent = (text: string) => /[À-ÖØ-öø-ÿŒœ]/.test(text)
const startsCapitalized = (text: string) => /^\p{Lu}/u.test(text)
const isMajority = (count: number, total: number) => count * 2 >= total

// Style des propositions de la manche ; null si elles sont trop peu nombreuses pour en juger. Sans accent seulement si
// aucune proposition n'en a : beaucoup de phrases bien écrites n'ont aucun mot accentué.
export function bluffWritingStyle(texts: readonly string[]): BluffWritingStyle | null {
  if (texts.length < BLUFF_STYLE_MIN_SAMPLES) return null
  return {
    capitalized: isMajority(texts.filter(startsCapitalized).length, texts.length),
    accented: texts.some(hasAccent),
    finalDot: isMajority(texts.filter((text) => text.endsWith('.')).length, texts.length),
  }
}

function withoutCapital(text: string): string {
  const first = /^\p{L}+/u.exec(text)?.[0] ?? ''
  if (!LOWERCASE_STARTERS.has(first.toLocaleLowerCase('fr'))) return text
  return text.charAt(0).toLocaleLowerCase('fr') + text.slice(1)
}

function withoutAccents(text: string): string {
  return text.replace(/\p{L}+/gu, (word) => (KEPT_ACCENTS.has(word.toLocaleLowerCase('fr')) ? word : removeDiacritics(word)))
}

// Jamais un texte vide, ni plus long que ce qu'acceptent les règles (œ s'écrit oe). Jamais de faute ajoutée d'un autre
// type (lettres changées, mots coupés) : la réponse reste lisible.
export function styledAnswerText(text: string, style: BluffWritingStyle): string {
  let result = text
  if (!style.finalDot && /[^.]\.$/.test(result)) result = result.slice(0, -1)
  if (!style.capitalized) result = withoutCapital(result)
  if (!style.accented) result = withoutAccents(result)
  return result !== '' && result.length <= BLUFF_MAX_LENGTH ? result : text
}

// Textes publiés pour le vote : les propositions des joueurs telles quelles, le reste au style de la manche.
export function voteChoiceTexts(choices: readonly BluffChoice[], level: BluffAnswerStyleLevel = BLUFF_ANSWER_STYLE_LEVEL): string[] {
  const style = level === 'light' ? bluffWritingStyle(choices.filter((choice) => choice.kind === 'bluff').map((choice) => choice.text)) : null
  return choices.map((choice) => (style && choice.kind !== 'bluff' ? styledAnswerText(choice.text, style) : choice.text))
}
