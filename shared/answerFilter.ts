import { normalizeAnswer } from './answerMatching'
import { HIDDEN_ANSWER_TEXT } from './constants'

// Filtre de base des réponses libres affichées sur la TV (spec 9) : un joueur peut taper n'importe quoi.
// Mots entiers, comparés après normalisation (minuscules, sans accents) ; un pluriel en -s ou -x compte.
// Liste volontairement courte : l'hôte peut en plus masquer un groupe de réponses (Contrôle).
const FORBIDDEN_WORDS = new Set([
  // Français
  'batard', 'bite', 'bordel', 'bougnoule', 'branler', 'branleur', 'chatte', 'chier', 'chiotte', 'con',
  'conard', 'connard', 'connasse', 'conne', 'couille', 'cul', 'encule', 'enculer', 'fdp', 'foutre',
  'gouine', 'gueule', 'merde', 'negre', 'nichon', 'nique', 'niquer', 'ntm', 'pd', 'pede', 'pute',
  'putain', 'salaud', 'salope', 'suce', 'sucer', 'tapette', 'teub', 'youpin',
  // Anglais
  'asshole', 'bastard', 'bitch', 'cock', 'cunt', 'dick', 'fag', 'faggot', 'fuck', 'fucking', 'nigga',
  'nigger', 'porn', 'pussy', 'retard', 'shit', 'slut', 'whore',
  // Haine
  'hitler', 'nazi',
])

function isForbidden(word: string): boolean {
  return FORBIDDEN_WORDS.has(word) || (/[sx]$/.test(word) && FORBIDDEN_WORDS.has(word.slice(0, -1)))
}

export function containsForbiddenWord(text: string): boolean {
  return normalizeAnswer(text).split(' ').some(isForbidden)
}

// Texte publiable sur la TV : la réponse telle quelle, ou « ••• » si elle contient un mot interdit.
export function displayableAnswer(text: string): string {
  return containsForbiddenWord(text) ? HIDDEN_ANSWER_TEXT : text
}
