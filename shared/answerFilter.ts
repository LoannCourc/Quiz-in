import { removeDiacritics } from './answerMatching'
import { HIDDEN_ANSWER_TEXT } from './constants'

// Filtre de base des textes saisis par les joueurs (spec 9) : réponses libres affichées sur la TV,
// propositions du Bluff, pseudos. Mots entiers seulement, jamais un morceau de mot (« Scunthorpe »,
// « Conrad » passent). Liste volontairement courte : l'hôte peut en plus masquer une réponse.
const FORBIDDEN_WORDS = new Set([
  // Français
  'batard', 'bite', 'bordel', 'bougnoule', 'branler', 'branleur', 'chier', 'chiotte', 'con',
  'conard', 'connard', 'connasse', 'conne', 'couille', 'cul', 'encule', 'enculer', 'fdp', 'foutre',
  'gouine', 'gueule', 'merde', 'negre', 'nichon', 'nique', 'niquer', 'ntm', 'pd', 'pede', 'pute',
  'putain', 'salaud', 'salope', 'tapette', 'teub', 'youpin',
  // Anglais
  'asshole', 'bastard', 'bitch', 'cock', 'cunt', 'fag', 'faggot', 'fuck', 'fucking', 'nigga',
  'nigger', 'porn', 'pussy', 'shit', 'slut', 'whore',
])

// Interdits dans un pseudo seulement : ce sont des réponses normales d'un quiz d'histoire.
const NAME_ONLY_FORBIDDEN_WORDS = new Set(['hitler', 'nazi'])

// Expressions courantes qui contiennent un mot de la liste : retirées du texte avant la recherche, le reste
// du texte est vérifié (« pique-nique de pute » est refusé). Chaque mot accepte un pluriel en -s ou -x ;
// « * » en fin de mot : toutes les terminaisons (pique-niquer, pique-niqueurs…).
const ALLOWED_EXPRESSIONS = [
  'pique niqu*', 'casse gueule', 'amuse gueule', 'gueule de bois', 'cul de sac', 'cul de poule', 'cul sec',
  'con carne', 'cafe con leche', 'diner de con', 'chien batard', 'pain batard', 'tapette a mouche', 'supreme ntm',
].map(expressionPattern)

function expressionPattern(expression: string): RegExp {
  const words = expression.split(' ').map((word) => (word.endsWith('*') ? `${word.slice(0, -1)}[a-z]*` : `${word}[sx]?`))
  return new RegExp(`(^| )${words.join(' ')}(?= |$)`, 'g')
}

// Chiffres et symboles mis pour des lettres (« m3rde », « s@lope »), seulement dans un mot qui contient
// déjà une lettre : « 1789 » ou « 100 € » ne changent pas.
const LOOKALIKES: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '€': 'e' }

function replaceLookalikes(chunk: string): string {
  return /[a-z]/.test(chunk) ? chunk.replace(/[013457@$€]/g, (char) => LOOKALIKES[char]) : chunk
}

// Lettres isolées recollées dès trois à la suite : « p.u.t.e » et « p u t e » deviennent « pute ».
const SPELLED_OUT_MIN_LETTERS = 3

function joinSpelledOutLetters(words: readonly string[]): string[] {
  const joined: string[] = []
  let letters: string[] = []
  const flush = () => {
    if (letters.length >= SPELLED_OUT_MIN_LETTERS) joined.push(letters.join(''))
    else joined.push(...letters)
    letters = []
  }
  for (const word of words) {
    if (/^[a-z]$/.test(word)) letters.push(word)
    else {
      flush()
      joined.push(word)
    }
  }
  flush()
  return joined
}

// Mots du texte : minuscules, sans accents ; ponctuation, tirets et apostrophes séparent les mots.
function filterWords(text: string): string[] {
  const lowered = removeDiacritics(text.toLocaleLowerCase('fr'))
  const words = lowered.split(/\s+/).map(replaceLookalikes).join(' ').replace(/[^a-z0-9]+/g, ' ').trim()
  let sentence = joinSpelledOutLetters(words.split(' ')).join(' ')
  for (const pattern of ALLOWED_EXPRESSIONS) sentence = sentence.replace(pattern, '$1')
  return sentence.split(' ').filter((word) => word !== '')
}

// Lettres répétées trois fois ou plus (« puuuute ») : essayées réduites à une, puis à deux lettres. Les
// lettres doubles ne sont jamais réduites (« cône » ne devient pas « conne », ni « bitte » « bite »).
function wordVariants(word: string): string[] {
  if (!/(.)\1\1/.test(word)) return [word]
  return [word, word.replace(/(.)\1{2,}/g, '$1'), word.replace(/(.)\1{2,}/g, '$1$1')]
}

function isInList(word: string, list: ReadonlySet<string>): boolean {
  return wordVariants(word).some((variant) => list.has(variant) || (/[sx]$/.test(variant) && list.has(variant.slice(0, -1))))
}

export function containsForbiddenWord(text: string): boolean {
  return filterWords(text).some((word) => isInList(word, FORBIDDEN_WORDS))
}

// Pseudo : la liste des réponses, plus les mots interdits dans un pseudo seulement.
export function containsForbiddenNameWord(name: string): boolean {
  return filterWords(name).some((word) => isInList(word, FORBIDDEN_WORDS) || isInList(word, NAME_ONLY_FORBIDDEN_WORDS))
}

// Texte publiable sur la TV : la réponse telle quelle, ou « ••• » si elle contient un mot interdit.
export function displayableAnswer(text: string): string {
  return containsForbiddenWord(text) ? HIDDEN_ANSWER_TEXT : text
}
