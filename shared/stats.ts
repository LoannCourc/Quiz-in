// Statistiques d'usage anonymes (docs/statistiques.md) : uniquement des compteurs de /stats augmentés de 1
// (règles de la base : jamais plus d'1 par écriture). Rien sur les joueurs : ni uid, ni prénom, ni code de partie.
// Logique pure : chemins à augmenter pour chaque événement de la partie ; l'écriture est dans l'app
// (app/src/lib/stats.ts). Le blind test n'est jamais compté.
import { connectedPlayerIds } from './players'
import { poolOf } from './questionPool'
import type { SessionUpdate } from './hostEngine'
import type { GameQuestion, PlayerId, PlayerResult, Reveal, Session } from './types'

export type StatsMode = 'quiz' | 'bluff' | 'draw'

// Une écriture = une liste de chemins (sous /stats) augmentés de 1 ensemble. Plusieurs écritures quand un
// compteur doit avancer de plus de 1 (une par unité), ou quand un chemin peut être refusé seul (quiz absent
// de /quizzes) sans faire perdre les autres.
export type StatsWrite = string[]

// Événement de la partie, compté une seule fois (key : garde de l'app contre les doubles comptes).
export interface StatsEvent {
  key: string
  writes: StatsWrite[]
}

// Bornes des règles de la base (/stats).
export const STATS_MAX_QUESTION_INDEX = 29
export const STATS_MAX_PLAYERS = 20

const ID_PATTERN = /^[a-z0-9-]{1,60}$/

// Jeu compté : Quiz, Bluff, Dessine-moi ; null pour le blind test (questions avec un extrait), jamais compté.
export function statsModeOf(session: Session, questions: readonly GameQuestion[]): StatsMode | null {
  const { answerMode } = session.settings
  if (answerMode === 'bluff') return 'bluff'
  if (answerMode === 'draw') return 'draw'
  return questions.some((question) => 'music' in question && question.music !== undefined) ? null : 'quiz'
}

// Jour de l'heure du serveur, en UTC (AAAA-MM-JJ).
export function statsDay(nowServer: number): string {
  return new Date(nowServer).toISOString().slice(0, 10)
}

// Quiz ou ensemble de la partie : quiz fixe (compteurs par quiz), thèmes ou mélange (compteurs par ensemble),
// rien pour Dessine-moi (pas de quiz dans la base).
function gameScope(session: Session, mode: StatsMode): string | null {
  if (mode === 'draw') return null
  const pool = poolOf(session.settings)
  if (pool) return `pools/${pool.kind}`
  return ID_PATTERN.test(session.quizId) ? `quizzes/${session.quizId}` : null
}

// Lancement : partie démarrée (jeu, quiz ou ensemble, jour) et nombre de joueurs connectés (l'hôte compris
// s'il joue).
export function startStatsEvent(session: Session, questions: readonly GameQuestion[], nowServer: number): StatsEvent | null {
  const mode = statsModeOf(session, questions)
  if (!mode) return null
  const common = [`modes/${mode}/started`, `daily/${statsDay(nowServer)}/started`]
  const players = connectedPlayerIds(session.players).length
  if (players >= 1 && players <= STATS_MAX_PLAYERS) common.push(`playerCounts/${players}`)
  const scope = gameScope(session, mode)
  return { key: 'start', writes: scope ? [common, [`${scope}/started`]] : [common] }
}

// Question (ou manche) i affichée : la courbe des parties arrivées à chaque question donne les abandons.
function questionEvent(mode: StatsMode, index: number): StatsEvent | null {
  if (index < 0 || index > STATS_MAX_QUESTION_INDEX) return null
  return { key: `question:${index}`, writes: [[`modes/${mode}/reached/${index}`]] }
}

// Fin normale (après la dernière question) : partie terminée. « Terminer la partie » avant la fin ne passe
// pas par ici : elle compte comme abandonnée (arrivée à une question, jamais terminée).
function endEvent(session: Session, mode: StatsMode, nowServer: number): StatsEvent {
  const common = [`modes/${mode}/completed`, `daily/${statsDay(nowServer)}/completed`]
  const scope = gameScope(session, mode)
  return { key: 'end', writes: scope ? [common, [`${scope}/completed`]] : [common] }
}

// Quiz et identifiant de la question i : tirée dans un ensemble (« quizId/questionId ») ou du quiz de la partie.
function questionRef(session: Session, question: GameQuestion, index: number): { quizId: string; questionId: string } | null {
  const ref = session.questionRefs?.[index]
  const [quizId, questionId] = ref ? ref.split('/') : [session.quizId, question.id]
  return quizId && questionId && ID_PATTERN.test(quizId) && ID_PATTERN.test(questionId) ? { quizId, questionId } : null
}

// Réponses données et bonnes réponses d'une révélation. Bluff : votes, et votes pour la vraie réponse.
function answerCounts(reveal: Reveal): { answered: number; correct: number } {
  const choices = reveal.stats.bluffChoices
  if (choices) {
    const votes = (kind?: string) => choices.filter((choice) => !kind || choice.kind === kind).reduce((sum, choice) => sum + (choice.voters?.length ?? 0), 0)
    return { answered: votes(), correct: votes('truth') }
  }
  const results: PlayerResult[] = Object.values(reveal.results ?? ({} as Record<PlayerId, PlayerResult>))
  return { answered: results.length, correct: results.filter((result) => result.correct).length }
}

// Révélation d'une question de Quiz ou de Bluff : une écriture par réponse donnée (les règles n'acceptent que
// + 1), la bonne réponse comptée avec elle. Dessine-moi : pas de question du catalogue, rien.
function revealEvent(session: Session, mode: StatsMode, question: GameQuestion | undefined, index: number, reveal: Reveal): StatsEvent | null {
  if (mode === 'draw' || !question) return null
  const ref = questionRef(session, question, index)
  if (!ref) return null
  const base = `questions/${ref.quizId}/${ref.questionId}`
  const { answered, correct } = answerCounts(reveal)
  const writes = Array.from({ length: answered }, (_, n) => (n < correct ? [`${base}/answered`, `${base}/correct`] : [`${base}/answered`]))
  return writes.length > 0 ? { key: `reveal:${index}`, writes } : null
}

// Transition écrite par l'hôte (session : état relu juste avant, changes : l'update envoyé) : question
// affichée, révélation ou fin normale.
export function transitionStatsEvent(
  session: Session,
  changes: SessionUpdate,
  questions: readonly GameQuestion[],
  nowServer: number,
): StatsEvent | null {
  const mode = statsModeOf(session, questions)
  if (!mode) return null
  const index = typeof changes.currentIndex === 'number' ? changes.currentIndex : session.currentIndex
  switch (changes.status) {
    case 'question':
      return questionEvent(mode, index)
    case 'reveal': {
      const reveal = changes.reveal as Reveal | null | undefined
      return reveal ? revealEvent(session, mode, questions[index], index, reveal) : null
    }
    case 'ended':
      return endEvent(session, mode, nowServer)
    default:
      return null
  }
}

// Accès de l'app, remplaçables dans les tests.
export interface StatsDeps {
  // Lecture de config/statsEnabled : vrai sauf s'il vaut false ; un échec de lecture compte comme vrai.
  isEnabled: () => Promise<boolean>
  // Une écriture multi-chemins sous /stats (chaque chemin augmenté de 1) ; son échec est ignoré.
  write: (paths: StatsWrite) => Promise<void>
}

export interface StatsRecorder {
  gameStart: (code: string, session: Session, questions: readonly GameQuestion[], nowServer: number) => void
  transition: (code: string, session: Session, changes: SessionUpdate, questions: readonly GameQuestion[], nowServer: number) => void
}

// Envoi des statistiques, sans attente ni erreur visible. Chaque événement est compté une seule fois par
// partie (transition rejouée, reconnexion) ; un nouveau lancement sur le même code (Changer de jeu) ouvre une
// nouvelle partie ; après une relance de l'app, la partie reprise compte sous « resumed ». L'interrupteur est
// lu une fois par partie.
export function createStatsRecorder(deps: StatsDeps): StatsRecorder {
  const gameOfCode = new Map<string, string>()
  const recorded = new Set<string>()
  const enabledByGame = new Map<string, Promise<boolean>>()

  function isEnabled(game: string): Promise<boolean> {
    let enabled = enabledByGame.get(game)
    if (!enabled) {
      enabled = deps.isEnabled().catch(() => true)
      enabledByGame.set(game, enabled)
    }
    return enabled
  }

  function send(game: string, event: StatsEvent | null) {
    if (!event) return
    const key = `${game}|${event.key}`
    if (recorded.has(key)) return
    recorded.add(key)
    void isEnabled(game).then((enabled) => {
      if (!enabled) return
      for (const paths of event.writes) void Promise.resolve().then(() => deps.write(paths)).catch(() => undefined)
    })
  }

  return {
    gameStart(code, session, questions, nowServer) {
      const game = `${code}@${nowServer}`
      gameOfCode.set(code, game)
      send(game, startStatsEvent(session, questions, nowServer))
    },
    transition(code, session, changes, questions, nowServer) {
      send(gameOfCode.get(code) ?? `${code}@resumed`, transitionStatsEvent(session, changes, questions, nowServer))
    },
  }
}
