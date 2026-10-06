import { containsForbiddenWord } from './answerFilter'
import { isAcceptedLevel, matchAnswer, normalizeAnswer } from './answerMatching'
import {
  ALL_ANSWERED_DELAY_S,
  BLUFF_MAX_ATTEMPTS,
  BLUFF_MIN_VOTABLE,
  BLUFF_REVEAL_PER_CHOICE_S,
  BLUFF_TARGET_CHOICES,
  BLUFF_TRAP_POINTS,
  BLUFF_TRUTH_POINTS,
  REVEAL_GRACE_MS,
} from './constants'
import { connectedPlayerIds } from './players'
import type {
  BluffCheck,
  BluffChoice,
  BluffEntry,
  BluffQuestion,
  BluffVerdict,
  GameQuestion,
  PlayerId,
  PlayerResult,
  PublicSession,
  RevealedBluffChoice,
  Session,
} from './types'

// Bluff (spec 16) : chaque joueur invente une fausse réponse, puis vote pour celle qu'il croit vraie.
// Logique pure, testée : vérification des propositions par l'hôte, construction des choix du vote,
// résultats. Le moteur (hostEngine) écrit ce que ces fonctions calculent.

// Chemin relatif à sessions/{code} → valeur (null efface le chemin), comme dans hostEngine.
type Update = Record<string, unknown>

export function isBluffQuestion(question: GameQuestion): question is BluffQuestion {
  return 'decoys' in question
}

// Texte d'une proposition tel qu'affiché : espaces superflus retirés.
export function cleanBluffText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

// Verdict de l'hôte sur une proposition. truth : la vraie réponse (ou une autre écriture acceptée),
// exacte ou à une faute de frappe près (majuscules, accents et ponctuation ignorés) ; le joueur apprend
// alors qu'il l'a trouvée. Le niveau « proche » de la Réponse libre ne compte pas : un mot de la vraie
// réponse seul (« Game » pour « The Landlord's Game ») reste une proposition valable.
export function checkBluff(text: string, question: BluffQuestion): BluffVerdict {
  if (normalizeAnswer(text) === '') return 'empty'
  if (isAcceptedLevel(matchAnswer(text, [question.answer, ...question.acceptedAnswers]))) return 'truth'
  return containsForbiddenWord(text) ? 'forbidden' : 'ok'
}

// Proposition terminée : acceptée, ou plus aucun essai.
export function isBluffDone(check: BluffCheck | undefined): boolean {
  return check !== undefined && (check.verdict === 'ok' || check.refusals >= BLUFF_MAX_ATTEMPTS)
}

// Heure d'une proposition corrigée par le serveur : l'hôte qui joue voit sa propre proposition d'abord
// avec une estimation locale de l'heure du serveur, puis avec la vraie valeur, quelques dizaines de
// millisecondes plus tard (il ne voit celles des autres qu'avec leur valeur définitive). En deçà de cet
// écart, c'est la même proposition : impossible d'attendre le verdict d'un refus et de renvoyer aussi vite.
export const BLUFF_TIMESTAMP_TOLERANCE_MS = 1_500

// La proposition vue a-t-elle déjà été jugée ? Même heure ; proposition acceptée ou sans essai restant
// (les règles de la base interdisent de la réécrire : seule son heure a pu être corrigée) ; ou, pour
// l'hôte qui joue, heure corrigée par le serveur (écart de moins de BLUFF_TIMESTAMP_TOLERANCE_MS).
function isSameSubmission(check: BluffCheck, submittedAt: number, isHostOwn: boolean): boolean {
  if (check.submittedAt === submittedAt || isBluffDone(check)) return true
  return isHostOwn && Math.abs(submittedAt - check.submittedAt) < BLUFF_TIMESTAMP_TOLERANCE_MS
}

// Vérification des propositions arrivées depuis le dernier passage (l'hôte l'appelle à chaque
// changement de la session pendant l'écriture). Une proposition acceptée allume l'avatar du joueur
// (bluffedBy) ; un refus compte un essai. Une proposition déjà jugée dont seule l'heure a été corrigée
// par le serveur garde son verdict : son heure est seulement recopiée, pour que la proposition et son
// verdict restent appariés (choix du vote, écran du joueur). null : rien de nouveau.
export function bluffChecksUpdate(session: Session, question: BluffQuestion): Update | null {
  if (session.status !== 'question' || session.settings.answerMode !== 'bluff') return null
  const index = session.currentIndex
  const update: Update = {}
  for (const [playerId, bluff] of Object.entries(session.bluffs?.[index] ?? {})) {
    const check = session.bluffChecks?.[index]?.[playerId]
    if (!session.players[playerId] || check?.submittedAt === bluff.submittedAt) continue
    if (check && isSameSubmission(check, bluff.submittedAt, playerId === session.hostUid)) {
      update[`bluffChecks/${index}/${playerId}/submittedAt`] = bluff.submittedAt
      continue
    }
    const verdict = checkBluff(bluff.text, question)
    const refusals = (check?.refusals ?? 0) + (verdict === 'ok' ? 0 : 1)
    update[`bluffChecks/${index}/${playerId}`] = { verdict, refusals, submittedAt: bluff.submittedAt }
    if (verdict === 'ok') update[`bluffedBy/${index}/${playerId}`] = true
  }
  return Object.keys(update).length > 0 ? update : null
}

// Fin de l'écriture : chrono plus une marge, ou plus tôt si tous les joueurs connectés ont terminé
// (2 s après la dernière proposition). Même principe que la fin anticipée d'une question.
export function writingDeadline(session: Session): number {
  const index = session.currentIndex
  const timeUp = session.phaseEndsAt + REVEAL_GRACE_MS
  const connected = connectedPlayerIds(session.players)
  const checks = session.bluffChecks?.[index] ?? {}
  if (connected.length === 0 || !connected.every((id) => isBluffDone(checks[id]))) return timeUp
  const lastAt = Math.max(...connected.map((id) => checks[id].submittedAt))
  return Math.min(timeUp, lastAt + ALL_ANSWERED_DELAY_S * 1000)
}

// Vote sans minuteur : où en sont les joueurs. Attendus : les joueurs connectés, plus ceux qui ont déjà
// voté (un joueur parti après son vote reste compté). Un joueur déconnecté qui n'a pas voté n'est pas
// attendu : il ne bloque jamais la partie ; s'il revient avant la fin du vote, il est de nouveau attendu.
export interface VoteProgress {
  voted: number
  expected: number
  // Joueurs connectés qui n'ont pas encore voté (l'hôte voit leurs noms).
  missing: PlayerId[]
}

export function voteProgress(session: Pick<PublicSession, 'players' | 'votedBy' | 'currentIndex'>): VoteProgress {
  const votedBy = session.votedBy?.[session.currentIndex] ?? {}
  const voted = Object.keys(session.players).filter((id) => votedBy[id] === true).length
  const missing = connectedPlayerIds(session.players).filter((id) => votedBy[id] !== true)
  return { voted, expected: voted + missing.length, missing }
}

// Fin automatique du vote : ALL_ANSWERED_DELAY_S après le dernier vote, quand plus aucun joueur connecté
// n'est attendu (aussitôt si le dernier qui n'avait pas voté se déconnecte). null tant qu'un joueur
// connecté n'a pas voté, ou si personne n'a voté : seul « Clore le vote » de l'hôte fait alors avancer.
export function voteDeadline(session: Session): number | null {
  const votes = session.votes?.[session.currentIndex] ?? {}
  const voters = Object.keys(session.players).filter((id) => votes[id] !== undefined)
  const waiting = connectedPlayerIds(session.players).filter((id) => votes[id] === undefined)
  if (waiting.length > 0 || voters.length === 0) return null
  const lastAt = Math.max(...voters.map((id) => votes[id].submittedAt))
  return lastAt + ALL_ANSWERED_DELAY_S * 1000
}

// Mélange de Fisher-Yates ; random : générateur dans [0, 1[ (remplaçable pour les tests).
function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

// Propositions acceptées de la question courante, dans l'ordre d'arrivée, regroupées quand elles
// sont identiques après normalisation (le texte affiché est celui de la première).
function acceptedBluffs(session: Session): BluffChoice[] {
  const index = session.currentIndex
  const checks = session.bluffChecks?.[index] ?? {}
  const entries = Object.entries(session.bluffs?.[index] ?? {})
    .filter(([id, bluff]) => session.players[id] && checks[id]?.verdict === 'ok' && checks[id].submittedAt === bluff.submittedAt)
    .sort(([, a], [, b]) => a.submittedAt - b.submittedAt)
  const groups = new Map<string, BluffChoice>()
  for (const [id, bluff] of entries) {
    const key = normalizeAnswer(bluff.text)
    const group = groups.get(key)
    if (group) group.authors?.push(id)
    else groups.set(key, { text: cleanBluffText(bluff.text), kind: 'bluff', authors: [id] })
  }
  return [...groups.values()]
}

// Leurres à ajouter : de quoi viser BLUFF_TARGET_CHOICES choix, et au moins BLUFF_MIN_VOTABLE choix
// votables pour chaque joueur (hors sa propre proposition), dans la limite des leurres disponibles.
function decoyCount(bluffCount: number, available: number): number {
  const target = Math.max(0, BLUFF_TARGET_CHOICES - (1 + bluffCount))
  const minimum = Math.max(0, (bluffCount > 0 ? 1 : 0) + BLUFF_MIN_VOTABLE - (1 + bluffCount))
  return Math.min(available, Math.max(target, minimum))
}

export interface VoteChoices {
  // Choix mélangés, avec leur type et leurs auteurs (gardés par l'hôte jusqu'à la révélation).
  choices: BluffChoice[]
  // Index du choix de chaque auteur : il ne peut pas voter pour lui.
  own: Record<PlayerId, number>
}

// Choix du vote : vraie réponse, propositions acceptées (identiques fusionnées) et leurres tirés au
// hasard. Une proposition identique à un leurre le remplace (elle reste celle du joueur).
export function buildVoteChoices(question: BluffQuestion, session: Session, random: () => number = Math.random): VoteChoices {
  const bluffs = acceptedBluffs(session)
  const taken = new Set([normalizeAnswer(question.answer), ...bluffs.map((bluff) => normalizeAnswer(bluff.text))])
  const decoyPool = shuffled(
    question.decoys.filter((decoy) => !taken.has(normalizeAnswer(decoy))),
    random,
  )
  const decoys = decoyPool.slice(0, decoyCount(bluffs.length, decoyPool.length))
  const choices = shuffled<BluffChoice>(
    [
      { text: question.answer, kind: 'truth' },
      ...bluffs,
      ...decoys.map((text): BluffChoice => ({ text, kind: 'decoy' })),
    ],
    random,
  )
  const own: Record<PlayerId, number> = {}
  choices.forEach((choice, choiceIndex) => {
    for (const author of choice.authors ?? []) own[author] = choiceIndex
  })
  return { choices, own }
}

export interface BluffRevealData {
  choices: RevealedBluffChoice[]
  // Résultat des joueurs qui ont voté ou dont une proposition a été retenue.
  results: Record<PlayerId, PlayerResult>
}

// Votes, puis points : BLUFF_TRUTH_POINTS pour un vote sur la vraie réponse, BLUFF_TRAP_POINTS par
// joueur piégé pour chaque auteur de la proposition (sans partage). Un leurre ne rapporte rien. Un vote
// invalide (choix inconnu, sa propre proposition) est ignoré.
export function bluffRevealData(session: Session): BluffRevealData {
  const index = session.currentIndex
  const stored = session.bluffChoices?.[index] ?? []
  const votes = session.votes?.[index] ?? {}
  const own = session.bluffOwn?.[index] ?? {}
  const voters: PlayerId[][] = stored.map(() => [])
  for (const [playerId, vote] of Object.entries(votes)) {
    if (!session.players[playerId] || !stored[vote.value] || own[playerId] === vote.value) continue
    voters[vote.value].push(playerId)
  }
  const choices = stored.map((choice, choiceIndex): RevealedBluffChoice => {
    const revealed: RevealedBluffChoice = { text: choice.text, kind: choice.kind }
    if (choice.authors?.length) revealed.authors = choice.authors
    if (voters[choiceIndex].length > 0) revealed.voters = voters[choiceIndex]
    return revealed
  })

  const results: Record<PlayerId, PlayerResult> = {}
  for (const playerId of Object.keys(session.players)) {
    const vote = votes[playerId]
    const votedChoice = vote && voters[vote.value]?.includes(playerId) ? stored[vote.value] : undefined
    const authored = stored.map((choice, choiceIndex) => (choice.authors?.includes(playerId) ? voters[choiceIndex].length : -1))
    const trapped = authored.filter((count) => count > 0).reduce((sum, count) => sum + count, 0)
    if (!votedChoice && !authored.some((count) => count >= 0)) continue
    const correct = votedChoice?.kind === 'truth'
    results[playerId] = { correct, points: (correct ? BLUFF_TRUTH_POINTS : 0) + trapped * BLUFF_TRAP_POINTS }
  }
  return { choices, results }
}

// Téléphone du joueur, pendant l'écriture : sa dernière proposition et le verdict de l'hôte.
// writing : rien d'envoyé ; checking : envoyée, pas encore vérifiée ; refused : refusée, il reste des
// essais ; accepted : acceptée (définitive) ; exhausted : refusée et plus aucun essai.
export type BluffWriteStatus = 'writing' | 'checking' | 'refused' | 'accepted' | 'exhausted'

export function bluffWriteStatus(entry: BluffEntry | null, check: BluffCheck | null): BluffWriteStatus {
  if (check?.verdict === 'ok') return 'accepted'
  if (check && check.refusals >= BLUFF_MAX_ATTEMPTS) return 'exhausted'
  if (entry && (!check || check.submittedAt !== entry.submittedAt)) return 'checking'
  return check ? 'refused' : 'writing'
}

export function bluffAttemptsLeft(check: BluffCheck | null): number {
  return Math.max(0, BLUFF_MAX_ATTEMPTS - (check?.refusals ?? 0))
}

// Résultat du joueur à la révélation, d'après les choix publiés : le choix pour lequel il a voté,
// sa propre proposition (avec ceux qu'elle a piégés), et ses points.
export interface BluffPlayerOutcome {
  voted: RevealedBluffChoice | null
  own: RevealedBluffChoice | null
  points: number
}

export function bluffPlayerOutcome(choices: readonly RevealedBluffChoice[], result: PlayerResult | undefined, uid: PlayerId): BluffPlayerOutcome {
  return {
    voted: choices.find((choice) => choice.voters?.includes(uid)) ?? null,
    own: choices.find((choice) => choice.authors?.includes(uid)) ?? null,
    points: result?.points ?? 0,
  }
}

// Calendrier de la révélation (TV, spec 16) : les fausses propositions se retournent l'une après l'autre,
// dans l'ordre des choix, la première dès le début de la phase, puis toutes les BLUFF_REVEAL_PER_CHOICE_S ;
// la vraie réponse arrive quand toutes sont retournées. Instants en ms depuis le début de la phase.
// L'écran et les sons de la TV lisent ce même calendrier.
export interface BluffRevealTimeline {
  flips: { index: number; atMs: number; choice: RevealedBluffChoice }[]
  truthAtMs: number
}

export function bluffRevealTimeline(choices: readonly RevealedBluffChoice[]): BluffRevealTimeline {
  const stepMs = BLUFF_REVEAL_PER_CHOICE_S * 1000
  const flips = choices
    .map((choice, index) => ({ index, choice }))
    .filter(({ choice }) => choice.kind !== 'truth')
    .map(({ index, choice }, order) => ({ index, choice, atMs: order * stepMs }))
  return { flips, truthAtMs: flips.length * stepMs }
}
