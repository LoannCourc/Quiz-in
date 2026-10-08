import { drawWordsIn } from './drawWords'
import type { Difficulty, DrawQuestion, GameQuestion, Player, PlayerId, PublicSession, QuizSummary } from './types'

// Dessine-moi (spec 19, plan docs/plan-dessine-moi.md) : manches, mots et ordre des dessinateurs.

// Nombre de manches (décision D3 : 4, 6 ou 8 au choix, 8 par défaut ; le réglage arrive au lot 7).
export const DRAW_ROUNDS_DEFAULT = 8
// Identifiant du quiz « Dessine-moi » (pas de quiz dans la base : les mots sont dans le code).
export const DRAW_QUIZ_ID = 'dessine-moi'

// Fiche du jeu dans le catalogue de l'hôte (pas de quiz dans la base).
export const DRAW_QUIZ_SUMMARY: QuizSummary = {
  title: 'Dessine-moi',
  theme: 'Culture générale',
  gameType: 'draw',
  language: 'fr',
  difficulty: 1,
  difficultyLabel: 'Facile',
  questionCount: DRAW_ROUNDS_DEFAULT,
  estimatedMinutes: 15,
  description:
    'Chacun son tour, un joueur dessine un mot secret, les autres le devinent en regardant la TV. Plus on trouve vite, plus on marque.',
  audience: 'all',
  poster: 'pink',
  icon: 'pencil',
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

// Manches d'une partie : mots tirés au hasard (reproductible : même code de salle et mêmes catégories,
// mêmes mots, même après une relance de l'app de l'hôte), dans les catégories choisies (toutes si aucune),
// niveaux mélangés, la première manche toujours facile. Une catégorie sans assez de mots d'un niveau est
// complétée par ses mots des autres niveaux : jamais moins de manches que prévu.
export function drawGameQuestions(roomCode: string, count = DRAW_ROUNDS_DEFAULT, categories: readonly string[] = []): DrawQuestion[] {
  const random = seededRandom(roomCode)
  const quotas = levelQuotas(count)
  const pool = drawWordsIn(categories)
  const byLevel = ([1, 2, 3] as const).map((level) => shuffled(pool.filter((entry) => entry.difficulty === level), random))
  const picked = byLevel.flatMap((words, index) => words.slice(0, quotas[(index + 1) as Difficulty]))
  const rest = shuffled(
    byLevel.flatMap((words, index) => words.slice(quotas[(index + 1) as Difficulty])),
    random,
  )
  picked.push(...rest.slice(0, Math.max(0, count - picked.length)))
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

// Ordre des dessinateurs pour `rounds` manches, tiré au lancement : rotation cyclique, chacun son tour,
// plusieurs fois si besoin (écart d'une manche au plus entre deux joueurs). Groupe : les équipes dessinent
// à tour de rôle (autant de fois chacune, à une manche près), et dans chaque équipe ses joueurs à tour de
// rôle.
export function drawOrderFor(
  players: Record<PlayerId, Player>,
  hostUid: PlayerId,
  rounds: number,
  random: () => number,
  byTeam = false,
): PlayerId[] {
  const eligible = drawEligiblePlayers(players, hostUid)
  if (eligible.length === 0) return []
  const groups = byTeam ? teamGroups(players, eligible) : [eligible]
  const order = shuffled(groups, random).map((group) => shuffled(group, random))
  return Array.from({ length: rounds }, (_, round) => {
    const group = order[round % order.length]
    return group[Math.floor(round / order.length) % group.length]
  })
}

// Dessinateurs possibles regroupés par équipe (équipes sans dessinateur possible ignorées).
function teamGroups(players: Record<PlayerId, Player>, eligible: readonly PlayerId[]): PlayerId[][] {
  const byTeam = new Map<string, PlayerId[]>()
  for (const id of eligible) {
    const team = players[id].team ?? ''
    byTeam.set(team, [...(byTeam.get(team) ?? []), id])
  }
  return [...byTeam.keys()].sort().map((team) => byTeam.get(team) as PlayerId[])
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
