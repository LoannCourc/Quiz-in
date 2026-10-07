import { CLOSE_ANSWER_MIN_LETTERS, TYPO_TOLERANCE_MIN_LETTERS, TYPO_TOLERANCE_TWO_MIN_LETTERS } from './constants'

// Articles retirés en début de réponse (spec 6.3) : « L'Everest » vaut « everest », « The Beatles »
// vaut « beatles ». « de », « d' » seuls ne sont pas des articles : « de Gaulle » reste intact.
const LEADING_ARTICLE = /^(?:(?:le|la|les|un|une|des|du|de la|the)\s+|(?:de l|l)'\s*)/

function removeDiacritics(text: string): string {
  // NFD sépare chaque lettre de son accent (é = e + ´), puis on retire les accents.
  // œ et æ ne sont pas des lettres accentuées : on les écrit en deux lettres.
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
}

// Minuscules, sans accents, sans article initial, ponctuation remplacée par des espaces ;
// « & » et « and » s'écrivent « et » (« Simon & Garfunkel » = « Simon and Garfunkel »).
export function normalizeAnswer(answer: string): string {
  const lowered = removeDiacritics(answer.toLocaleLowerCase('fr'))
    .replace(/[’‘`´]/g, "'")
    .replace(/&/g, ' et ')
    .trim()
  const withoutArticle = lowered.replace(LEADING_ARTICLE, '')
  // Si la réponse n'était qu'un article (« La »), on la garde telle quelle.
  const kept = withoutArticle.trim() === '' ? lowered : withoutArticle
  return kept
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\band\b/g, 'et')
}

// Distance de Damerau-Levenshtein (variante « alignement optimal ») : nombre minimal
// d'insertions, suppressions, remplacements ou inversions de deux lettres voisines.
export function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
      }
    }
  }
  return rows[a.length][b.length]
}

function countLetters(text: string): number {
  return text.replace(/ /g, '').length
}

// Fautes de frappe tolérées selon la longueur de la réponse attendue : 0, 1 dès 5 lettres, 2 dès 10.
function allowedTypos(accepted: string): number {
  const letters = countLetters(accepted)
  if (letters >= TYPO_TOLERANCE_TWO_MIN_LETTERS) return 2
  return letters >= TYPO_TOLERANCE_MIN_LETTERS ? 1 : 0
}

// Correction automatique d'une réponse libre (spec 6.3) :
// - exact : identique après normalisation ;
// - typo : fautes de frappe tolérées (acceptée, mais signalée à l'hôte en Contrôle) ;
// - close : proche sans être acceptée (une faute de plus, ou l'une contient l'autre : « Hallyday » pour
//   « Johnny Hallyday ») : refusée, mais mise en évidence pour l'hôte en Contrôle ;
// - wrong : tout le reste.
export type MatchLevel = 'exact' | 'typo' | 'close' | 'wrong'

const LEVEL_ORDER: readonly MatchLevel[] = ['exact', 'typo', 'close', 'wrong']

function containsWords(text: string, part: string): boolean {
  return countLetters(part) >= CLOSE_ANSWER_MIN_LETTERS && ` ${text} `.includes(` ${part} `)
}

function matchOne(normalizedAnswer: string, acceptedAnswer: string): MatchLevel {
  const accepted = normalizeAnswer(acceptedAnswer)
  if (accepted === '') return 'wrong'
  if (normalizedAnswer === accepted) return 'exact'
  const typos = allowedTypos(accepted)
  const distance = editDistance(normalizedAnswer, accepted)
  if (distance <= typos) return 'typo'
  const isLongEnough = countLetters(accepted) >= CLOSE_ANSWER_MIN_LETTERS
  if (isLongEnough && distance <= typos + 1) return 'close'
  if (containsWords(accepted, normalizedAnswer) || containsWords(normalizedAnswer, accepted)) return 'close'
  return 'wrong'
}

// Meilleur niveau obtenu contre l'une des réponses acceptées.
export function matchAnswer(answer: string, acceptedAnswers: readonly string[]): MatchLevel {
  const normalized = normalizeAnswer(answer)
  if (normalized === '') return 'wrong'
  let best: MatchLevel = 'wrong'
  for (const accepted of acceptedAnswers) {
    const level = matchOne(normalized, accepted)
    if (LEVEL_ORDER.indexOf(level) < LEVEL_ORDER.indexOf(best)) best = level
    if (best === 'exact') break
  }
  return best
}

// Niveau qui vaut une bonne réponse sans intervention de l'hôte.
export function isAcceptedLevel(level: MatchLevel): boolean {
  return level === 'exact' || level === 'typo'
}

// Validation automatique d'une réponse libre (spec 6.3).
export function isAnswerCorrect(answer: string, acceptedAnswers: readonly string[]): boolean {
  return isAcceptedLevel(matchAnswer(answer, acceptedAnswers))
}
