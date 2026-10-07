import { DRAW_WORDS } from './drawWords'
import type { Difficulty, DrawQuestion, GameQuestion, Player, PlayerId, PublicSession, QuizSummary } from './types'

// Dessine-moi (plan docs/plan-dessine-moi.md) : manches, mots et ordre des dessinateurs. Lot 2 : des
// manches sans réponses ni points (le jugement et les points arrivent au lot 3).

// Nombre de manches (décision D3 : 4, 6 ou 8 au choix, 8 par défaut ; le réglage arrive au lot 7).
export const DRAW_ROUNDS_DEFAULT = 8
// Identifiant du quiz « Dessine-moi » (pas de quiz dans la base : les mots sont dans le code).
export const DRAW_QUIZ_ID = 'dessine-moi'

// Fiche du jeu dans le catalogue de l'hôte (pas de quiz dans la base). Lot 2 : visible en développement
// seulement (onglet « Dessine-moi »).
export const DRAW_QUIZ_SUMMARY: QuizSummary = {
  title: 'Dessine-moi',
  theme: 'Culture générale',
  gameType: 'draw',
  language: 'fr',
  difficulty: 1,
  difficultyLabel: 'Facile',
  questionCount: DRAW_ROUNDS_DEFAULT,
  estimatedMinutes: 15,
  description: 'Un joueur dessine un mot secret, les autres devinent en regardant la TV. Essai : manches sans points.',
  audience: 'all',
  poster: 'pink',
  addedAt: '',
}

export function isDrawQuestion(question: GameQuestion): question is DrawQuestion {
  return 'word' in question
}

// Nombre pseudo-aléatoire reproductible (mulberry32) : mêmes mots pour un même code de partie, même
// après une relance de l'app de l'hôte.
export function seededRandom(seedText: string): () => number {
  let seed = 0
  for (const character of seedText) seed = (Math.imul(seed, 31) + character.charCodeAt(0)) | 0
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

// Niveaux des mots d'une partie : un difficile toutes les 8 manches, environ 3 moyens sur 8, le reste
// facile (8 manches : 4 faciles, 3 moyens, 1 difficile ; 4 manches : 2 faciles, 2 moyens).
function levelQuotas(count: number): Record<Difficulty, number> {
  const hard = Math.floor(count / 8)
  const medium = Math.round(count * 0.375)
  return { 1: count - medium - hard, 2: medium, 3: hard }
}

// Manches d'une partie : mots tirés au hasard (reproductible : même code de salle, mêmes mots, même après
// une relance de l'app de l'hôte), niveaux mélangés, la première manche toujours facile.
export function drawGameQuestions(roomCode: string, count = DRAW_ROUNDS_DEFAULT): DrawQuestion[] {
  const random = seededRandom(roomCode)
  const quotas = levelQuotas(count)
  const picked = ([1, 2, 3] as const).flatMap((level) =>
    shuffled(DRAW_WORDS.filter((entry) => entry.difficulty === level), random).slice(0, quotas[level]),
  )
  const order = shuffled(picked, random)
  const firstEasy = order.findIndex((entry) => entry.difficulty === 1)
  if (firstEasy > 0) [order[0], order[firstEasy]] = [order[firstEasy], order[0]]
  return order.map((entry, index) => ({ id: `draw-${index}`, word: entry.word, category: entry.category, difficulty: entry.difficulty }))
}

// Dessinateurs possibles : tous les joueurs sauf l'hôte (décision D1 : l'hôte qui joue devine mais ne
// dessine pas, son app n'a pas de surface de dessin).
export function drawEligiblePlayers(players: Record<PlayerId, Player>, hostUid: PlayerId): PlayerId[] {
  return Object.keys(players)
    .filter((id) => id !== hostUid)
    .sort()
}

// Ordre des dessinateurs, tiré au lancement : chacun dessine au plus une fois.
export function drawOrderFor(players: Record<PlayerId, Player>, hostUid: PlayerId, random: () => number): PlayerId[] {
  return shuffled(drawEligiblePlayers(players, hostUid), random)
}

// Paquets du dessin de la manche, dans l'ordre des clés (la base les rend en objet, ou en tableau quand
// les clés se suivent depuis 0).
export function drawingChunkList(drawing: PublicSession['drawing']): string[] {
  if (!drawing) return []
  return Object.entries(drawing)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, data]) => data)
}

// Nombre de lettres affiché sur la TV (décision D5) : lettres seulement (espaces et tirets à part).
export function wordLetterCount(word: string): number {
  return word.replace(/[^\p{L}]/gu, '').length
}
