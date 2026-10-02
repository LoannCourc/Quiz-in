import { TYPO_TOLERANCE_MIN_LETTERS } from './constants'

// Articles retirés en début de réponse (spec 6.3) : « L'Everest » vaut « everest ».
// « de », « d' » seuls ne sont pas des articles : « de Gaulle » reste intact.
const LEADING_ARTICLE = /^(?:(?:le|la|les|un|une|des|du|de la)\s+|(?:de l|l)'\s*)/

function removeDiacritics(text: string): string {
  // NFD sépare chaque lettre de son accent (é = e + ´), puis on retire les accents.
  // œ et æ ne sont pas des lettres accentuées : on les écrit en deux lettres.
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
}

// Minuscules, sans accents, sans article initial, ponctuation remplacée par des espaces.
export function normalizeAnswer(answer: string): string {
  const lowered = removeDiacritics(answer.toLocaleLowerCase('fr'))
    .replace(/[’‘`´]/g, "'")
    .trim()
  const withoutArticle = lowered.replace(LEADING_ARTICLE, '')
  // Si la réponse n'était qu'un article (« La »), on la garde telle quelle.
  const kept = withoutArticle.trim() === '' ? lowered : withoutArticle
  return kept
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Distance de Damerau-Levenshtein (variante « alignement optimal ») : nombre minimal
// d'insertions, suppressions, remplacements ou inversions de deux lettres voisines.
function editDistance(a: string, b: string): number {
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

function matchesAccepted(normalizedAnswer: string, acceptedAnswer: string): boolean {
  const accepted = normalizeAnswer(acceptedAnswer)
  if (accepted === '') return false
  if (normalizedAnswer === accepted) return true
  const allowsTypo = countLetters(accepted) >= TYPO_TOLERANCE_MIN_LETTERS
  return allowsTypo && editDistance(normalizedAnswer, accepted) <= 1
}

// Validation automatique d'une réponse libre (spec 6.3).
export function isAnswerCorrect(answer: string, acceptedAnswers: readonly string[]): boolean {
  const normalized = normalizeAnswer(answer)
  if (normalized === '') return false
  return acceptedAnswers.some((accepted) => matchesAccepted(normalized, accepted))
}
