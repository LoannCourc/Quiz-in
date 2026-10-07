import { editDistance, normalizeAnswer } from './answerMatching'
import { ALL_ANSWERED_DELAY_S, DRAW_DRAWER_MAX_POINTS, DRAW_GUESS_MAX_POINTS, DRAW_GUESS_MIN_POINTS } from './constants'
import { wordLetterCount } from './drawGame'
import { DRAW_WORDS } from './drawWords'
import type { SessionUpdate } from './hostEngine'
import { connectedPlayerIds } from './players'
import type { DrawQuestion, DrawVerdict, PlayerId, PlayerResult, PublicSession, Session } from './types'

// Dessine-moi, essais des devineurs (spec 19) : jugement d'un mot, devineurs de la manche, verdicts de
// l'hôte, points, fin anticipée et changement de mot. Logique pure : l'hôte applique les updates.

// Un mot de cette longueur (lettres) tolère une faute ; « proche » (deux fautes) à partir de CLOSE_MIN_LETTERS.
const TYPO_MIN_LETTERS = 5
const CLOSE_MIN_LETTERS = 4
// « Proche » : début du mot d'au moins cette longueur (« gir » pour « girafe »).
const PREFIX_MIN_LETTERS = 3

// Sans casse, sans accents, sans article initial (normalizeAnswer), sans pluriel : s ou x final de chaque
// mot de plus de 3 lettres (« girafes » = « girafe », « gâteaux » = « gateau »).
function comparable(text: string): string {
  return normalizeAnswer(text)
    .split(' ')
    .map((word) => (word.length > 3 && /[sx]$/.test(word) ? word.slice(0, -1) : word))
    .join(' ')
}

const letters = (text: string) => text.replace(/ /g, '').length

export function judgeDrawGuess(guess: string, word: string): DrawVerdict {
  const given = comparable(guess)
  const expected = comparable(word)
  if (given === '' || expected === '') return 'wrong'
  if (given === expected) return 'found'
  const distance = editDistance(given, expected)
  if (letters(expected) >= TYPO_MIN_LETTERS && distance <= 1) return 'found'
  if (letters(expected) >= CLOSE_MIN_LETTERS && distance <= 2) return 'close'
  if (letters(given) >= PREFIX_MIN_LETTERS && expected.startsWith(given)) return 'close'
  return 'wrong'
}

// Devineurs de la manche : joueurs connectés sauf le dessinateur ; en Groupe, seulement l'équipe du
// dessinateur (les autres regardent).
export function drawGuessers(session: Pick<PublicSession, 'players' | 'settings' | 'drawTurn'>): PlayerId[] {
  const drawer = session.drawTurn?.drawer
  if (!drawer) return []
  const team = session.players[drawer]?.team
  return connectedPlayerIds(session.players).filter(
    (id) => id !== drawer && (!session.settings.teams || session.players[id].team === team),
  )
}

export function isDrawGuesser(session: Pick<PublicSession, 'players' | 'settings' | 'drawTurn'>, uid: PlayerId): boolean {
  const drawer = session.drawTurn?.drawer
  if (!drawer || uid === drawer || !session.players[uid]) return false
  return !session.settings.teams || session.players[uid].team === session.players[drawer]?.team
}

// Pour la TV et ses sons : qui devine, qui a trouvé (dans l'ordre), et le dernier à avoir trouvé.
// Un joueur déconnecté qui avait trouvé reste compté parmi ceux qui ont trouvé.
export interface DrawFoundProgress {
  guessers: PlayerId[]
  found: PlayerId[]
  latest: PlayerId | null
}

export function drawFoundProgress(session: Pick<PublicSession, 'players' | 'settings' | 'drawTurn' | 'drawFound'>): DrawFoundProgress {
  const foundAt = session.drawFound ?? {}
  const found = Object.keys(foundAt)
    .filter((id) => session.players[id] !== undefined)
    .sort((a, b) => foundAt[a] - foundAt[b])
  const guessers = drawGuessers(session)
  for (const id of found) if (!guessers.includes(id)) guessers.push(id)
  return { guessers, found, latest: found.length > 0 ? found[found.length - 1] : null }
}

// Verdicts des essais pas encore jugés (l'hôte, à chaque nouvel essai) : drawHint/{uid} pour le joueur,
// drawFound/{uid} (heure de l'essai) s'il a trouvé. null s'il n'y a rien de neuf.
export function drawHintsUpdate(session: Session): SessionUpdate | null {
  const word = session.drawSecret?.word
  if (session.status !== 'question' || session.settings.answerMode !== 'draw' || !word) return null
  const update: SessionUpdate = {}
  for (const [uid, guess] of Object.entries(session.drawGuess ?? {})) {
    if (session.drawFound?.[uid] !== undefined || !isDrawGuesser(session, uid)) continue
    if ((session.drawHint?.[uid]?.count ?? 0) >= guess.count) continue
    const verdict = judgeDrawGuess(guess.text, word)
    update[`drawHint/${uid}`] = { count: guess.count, verdict }
    if (verdict === 'found') update[`drawFound/${uid}`] = guess.at
  }
  return Object.keys(update).length > 0 ? update : null
}

// Points de la manche. Devineur qui a trouvé : de 1 000 à 400 selon le moment ; dessinateur : 1 000 ×
// part des devineurs qui ont trouvé (un devineur parti après avoir trouvé compte encore).
export function drawResults(session: Session): Record<PlayerId, PlayerResult> {
  const drawer = session.drawTurn?.drawer
  if (!drawer) return {}
  const found = Object.entries(session.drawFound ?? {}).filter(([uid]) => session.players[uid] && uid !== drawer)
  const durationMs = Math.max(1, session.phaseEndsAt - session.phaseStartedAt)
  const results: Record<PlayerId, PlayerResult> = {}
  for (const [uid, at] of found) {
    const share = Math.min(1, Math.max(0, (at - session.phaseStartedAt) / durationMs))
    results[uid] = { correct: true, points: Math.round(DRAW_GUESS_MAX_POINTS - (DRAW_GUESS_MAX_POINTS - DRAW_GUESS_MIN_POINTS) * share) }
  }
  const guessers = new Set([...drawGuessers(session), ...found.map(([uid]) => uid)])
  if (session.players[drawer]) {
    const points = guessers.size === 0 ? 0 : Math.round((DRAW_DRAWER_MAX_POINTS * found.length) / guessers.size)
    results[drawer] = { correct: found.length > 0, points }
  }
  return results
}

// Fin anticipée (décision D11) : 2 s après que tous les devineurs connectés ont trouvé ; null sinon.
export function drawAllFoundAt(session: Session): number | null {
  const guessers = drawGuessers(session)
  if (guessers.length === 0) return null
  const times = guessers.map((uid) => session.drawFound?.[uid])
  if (times.some((at) => at === undefined)) return null
  return Math.max(...(times as number[])) + ALL_ANSWERED_DELAY_S * 1000
}

// Manche annulée : dessinateur déconnecté à la fin de la manche (aucun point, spec 19).
export function isDrawRoundAbandoned(session: Pick<PublicSession, 'players' | 'drawTurn'>): boolean {
  const drawer = session.drawTurn?.drawer
  return drawer !== undefined && session.players[drawer]?.connected !== true
}

// Changement de mot (décision D7) : une fois, avant le premier trait. Mot de remplacement : le premier de
// la liste qui n'est pas déjà prévu dans la partie, ni le mot actuel. null si rien à faire.
export function drawWordChangeUpdate(session: Session, questions: readonly DrawQuestion[]): SessionUpdate | null {
  const turn = session.drawTurn
  if (!session.drawWordChange || !turn || turn.changedWord || session.status !== 'question') return null
  const planned = new Set([...questions.map((question) => question.word), session.drawSecret?.word])
  const offset = turn.round % DRAW_WORDS.length
  const pool = [...DRAW_WORDS.slice(offset), ...DRAW_WORDS.slice(0, offset)]
  const replacement = pool.find((entry) => !planned.has(entry.word))
  if (!replacement) return { drawWordChange: null }
  return {
    drawWordChange: null,
    drawSecret: { word: replacement.word, category: replacement.category },
    'drawTurn/category': replacement.category,
    'drawTurn/wordLength': wordLetterCount(replacement.word),
    'drawTurn/changedWord': true,
    'currentQuestion/text': replacement.category,
  }
}
