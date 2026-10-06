import { describe, expect, test } from 'vitest'

import {
  bluffAttemptsLeft,
  bluffChecksUpdate,
  bluffPlayerOutcome,
  bluffWriteStatus,
  bluffRevealData,
  buildVoteChoices,
  checkBluff,
  isBluffDone,
  voteDeadline,
  writingDeadline,
} from '../../shared/bluff'
import {
  BLUFF_TRAP_POINTS,
  BLUFF_TRUTH_POINTS,
  BLUFF_VOTE_DURATION_S,
  DEFAULT_SESSION_SETTINGS,
  QUESTION_DURATION_S,
  REVEAL_GRACE_MS,
} from '../../shared/constants'
import { nextPhase, revealDurationS } from '../../shared/gameFlow'
import {
  hostControls,
  launchUpdate,
  nextDeadline,
  pauseUpdate,
  replayUpdate,
  transitionUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import { settingsForGameType } from '../../shared/quizCatalog'
import type { BluffChoice, BluffEntry, Player, PlayerId, Session, SessionSettings } from '../../shared/types'
import { BLUFF_QUESTIONS, makeBluffQuestion, makeSession, player } from './engineFixtures'

const NOW = 5_000_000
const BLUFF: SessionSettings = { answerMode: 'bluff', speedBonus: true, control: false, teams: false }
const QUESTION = makeBluffQuestion(0)

// Générateur déterministe (suite fixe de valeurs dans [0, 1[).
function sequence(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

function apply(session: Session, update: SessionUpdate | null): Session {
  expect(update).not.toBeNull()
  const next = structuredClone(session) as unknown as Record<string, unknown>
  for (const [path, value] of Object.entries(update as SessionUpdate)) {
    const keys = path.split('/')
    let node = next
    for (const key of keys.slice(0, -1)) {
      if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
      node = node[key] as Record<string, unknown>
    }
    const last = keys[keys.length - 1]
    if (value === null) delete node[last]
    else node[last] = structuredClone(value)
  }
  return next as unknown as Session
}

function players(count: number): Record<PlayerId, Player> {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [`p${index}`, player(`Joueur ${index}`)]))
}

// Écriture en cours : propositions données (texte par joueur, dans l'ordre d'arrivée).
function writing(texts: Record<PlayerId, string>, playerCount = Object.keys(texts).length): Session {
  const bluffs: Record<PlayerId, BluffEntry> = {}
  Object.entries(texts).forEach(([id, text], order) => {
    bluffs[id] = { text, submittedAt: NOW + order }
  })
  return makeSession({
    status: 'question',
    settings: BLUFF,
    phaseStartedAt: NOW - 10_000,
    phaseEndsAt: NOW + 35_000,
    players: players(playerCount),
    bluffs: { 0: bluffs },
  })
}

// Écriture terminée : propositions acceptées par l'hôte.
function checked(texts: Record<PlayerId, string>, playerCount?: number): Session {
  const session = writing(texts, playerCount)
  return apply(session, bluffChecksUpdate(session, QUESTION))
}

function kinds(choices: BluffChoice[]): string[] {
  return choices.map((choice) => choice.kind).sort()
}

describe('Bluff : vérification des propositions', () => {
  test('vraie réponse exacte ou à une faute près (casse, accents, ponctuation ignorés) : refusée', () => {
    expect(checkBluff("THE LANDLORD'S GAME !", QUESTION)).toBe('truth')
    expect(checkBluff('Landlord Gaem', QUESTION)).toBe('truth')
    expect(checkBluff('landlords game', QUESTION)).toBe('truth')
    expect(checkBluff('Le Jeu du Propriétaire', QUESTION)).toBe('ok')
  })

  test('un seul mot de la vraie réponse, ou une réponse seulement proche : acceptée', () => {
    expect(checkBluff('Game', QUESTION)).toBe('ok')
    expect(checkBluff('Landlords', QUESTION)).toBe('ok')
    expect(checkBluff('The Landlady Game', QUESTION)).toBe('ok')
  })

  test('mot interdit refusé, proposition vide refusée', () => {
    expect(checkBluff('Merde alors', QUESTION)).toBe('forbidden')
    expect(checkBluff(' !! ', QUESTION)).toBe('empty')
  })

  test('acceptée : verdict et avatar allumé ; refusée : un essai de compté, réécriture vérifiée', () => {
    let session = writing({ p0: 'Monopolis', p1: "The Landlord's Game" })
    session = apply(session, bluffChecksUpdate(session, QUESTION))
    expect(session.bluffChecks?.[0].p0).toEqual({ verdict: 'ok', refusals: 0, submittedAt: NOW })
    expect(session.bluffedBy?.[0]).toEqual({ p0: true })
    expect(session.bluffChecks?.[0].p1).toMatchObject({ verdict: 'truth', refusals: 1 })
    // Rien de nouveau : pas d'écriture.
    expect(bluffChecksUpdate(session, QUESTION)).toBeNull()
    // Nouvel essai, quelques secondes plus tard (le temps de lire le refus).
    session = apply(session, { 'bluffs/0/p1': { text: 'Capitale Express', submittedAt: NOW + 5_000 } })
    session = apply(session, bluffChecksUpdate(session, QUESTION))
    expect(session.bluffChecks?.[0].p1).toEqual({ verdict: 'ok', refusals: 1, submittedAt: NOW + 5_000 })
  })

  test('trois refus : plus d’essai, la proposition est terminée sans être retenue', () => {
    let session = writing({ p0: 'Landlord Game' })
    for (let attempt = 1; attempt <= 3; attempt++) {
      session = apply(session, { 'bluffs/0/p0': { text: 'Landlords Game', submittedAt: NOW + attempt * 5_000 } })
      session = apply(session, bluffChecksUpdate(session, QUESTION))
    }
    expect(session.bluffChecks?.[0].p0.refusals).toBe(3)
    expect(isBluffDone(session.bluffChecks?.[0].p0)).toBe(true)
    // Plus d'essai : jamais rejugée (seule l'heure, si elle change, est recopiée).
    session = apply(session, { 'bluffs/0/p0': { text: 'Monopolis', submittedAt: NOW + 30_000 } })
    expect(bluffChecksUpdate(session, QUESTION)).toEqual({ 'bluffChecks/0/p0/submittedAt': NOW + 30_000 })
  })

  test('hors de l’écriture d’un Bluff : aucune vérification', () => {
    const session = writing({ p0: 'Monopolis' })
    expect(bluffChecksUpdate({ ...session, status: 'vote' }, QUESTION)).toBeNull()
    expect(bluffChecksUpdate({ ...session, settings: { ...BLUFF, answerMode: 'free' } }, QUESTION)).toBeNull()
  })

  test('fin anticipée de l’écriture quand tous les connectés ont terminé, sinon au chrono', () => {
    const done = checked({ p0: 'Monopolis', p1: 'Capitale Express' })
    expect(writingDeadline(done)).toBe(NOW + 1 + 2000)
    const waiting = checked({ p0: 'Monopolis' }, 2)
    expect(writingDeadline(waiting)).toBe(waiting.phaseEndsAt + REVEAL_GRACE_MS)
  })
})

describe('Bluff : choix du vote', () => {
  test('2 joueurs : vraie réponse, 2 propositions et les 3 leurres (6 choix)', () => {
    const { choices, own } = buildVoteChoices(QUESTION, checked({ p0: 'Monopolis', p1: 'Le Jeu du Propriétaire' }), sequence([0.4]))
    expect(kinds(choices)).toEqual(['bluff', 'bluff', 'decoy', 'decoy', 'decoy', 'truth'])
    expect(choices[own.p0].authors).toEqual(['p0'])
    expect(choices[own.p1].text).toBe('Le Jeu du Propriétaire')
  })

  test('on vise 6 choix : 4 propositions distinctes, 1 leurre ; beaucoup de joueurs, aucun leurre', () => {
    const four = checked({ p0: 'Alpha Jeu', p1: 'Beta Jeu', p2: 'Gamma Jeu', p3: 'Delta Jeu' })
    expect(kinds(buildVoteChoices(QUESTION, four).choices).filter((kind) => kind === 'decoy')).toHaveLength(1)
    const texts = Object.fromEntries(Array.from({ length: 30 }, (_, index) => [`p${index}`, `Proposition ${index}`]))
    const crowd = buildVoteChoices(QUESTION, checked(texts))
    expect(crowd.choices).toHaveLength(31)
    expect(crowd.choices.some((choice) => choice.kind === 'decoy')).toBe(false)
  })

  test('propositions identiques fusionnées (le texte de la première), tous auteurs', () => {
    const { choices, own } = buildVoteChoices(QUESTION, checked({ p0: 'Monopolis', p1: 'monopolis !', p2: 'Rue Royale' }))
    const merged = choices[own.p0]
    expect(own.p1).toBe(own.p0)
    expect(merged).toEqual({ text: 'Monopolis', kind: 'bluff', authors: ['p0', 'p1'] })
  })

  test('tous écrivent la même chose : chacun garde au moins 3 choix votables', () => {
    const texts = { p0: 'Monopolis', p1: 'Monopolis', p2: 'Monopolis' }
    const { choices } = buildVoteChoices(QUESTION, checked(texts))
    expect(kinds(choices)).toEqual(['bluff', 'decoy', 'decoy', 'decoy', 'truth'])
    const twoDecoys = makeBluffQuestion(0, { decoys: ['Magie Immobilière', 'Capital Express'] })
    expect(buildVoteChoices(twoDecoys, checked(texts)).choices.length - 1).toBeGreaterThanOrEqual(3)
  })

  test('une proposition identique à un leurre le remplace et reste celle du joueur', () => {
    const { choices, own } = buildVoteChoices(QUESTION, checked({ p0: 'capital express', p1: 'Monopolis' }))
    expect(choices.filter((choice) => choice.text.toLowerCase() === 'capital express')).toHaveLength(1)
    expect(choices[own.p0]).toMatchObject({ kind: 'bluff', authors: ['p0'] })
  })

  test('personne n’écrit : vraie réponse et les 3 leurres ; un joueur sans proposition n’a pas de choix à lui', () => {
    const session = writing({}, 3)
    const { choices, own } = buildVoteChoices(QUESTION, session)
    expect(kinds(choices)).toEqual(['decoy', 'decoy', 'decoy', 'truth'])
    expect(own).toEqual({})
  })

  test('les propositions refusées ou non vérifiées ne sont jamais retenues', () => {
    const session = apply(writing({ p0: 'Monopolis', p1: 'Landlords Game' }), { 'bluffs/0/p2': { text: 'Pas encore vue', submittedAt: NOW + 50 } })
    const withChecks = apply({ ...session, players: players(3) }, bluffChecksUpdate({ ...session, players: players(3) }, QUESTION))
    const unchecked = apply(withChecks, { 'bluffs/0/p3': { text: 'Arrivée trop tard', submittedAt: NOW + 60 } })
    const { choices } = buildVoteChoices(QUESTION, { ...unchecked, players: players(4) })
    expect(choices.filter((choice) => choice.kind === 'bluff').map((choice) => choice.text).sort()).toEqual(['Monopolis', 'Pas encore vue'])
  })
})

// Partie de Bluff à 3 joueurs jusqu'au vote ; votes donnés par joueur (index du choix).
function votingSession(): { session: Session; choices: BluffChoice[]; own: Record<PlayerId, number> } {
  const written = checked({ p0: 'Monopolis', p1: 'Rue Royale', p2: 'Monopolis' })
  const atVote = apply(written, transitionUpdate(written, [QUESTION], { status: 'question', currentIndex: 0 }, NOW, {}, {}, sequence([0.7])))
  return { session: atVote, choices: atVote.bluffChoices?.[0] ?? [], own: atVote.bluffOwn?.[0] ?? {} }
}

function vote(session: Session, votes: Record<PlayerId, number>): Session {
  const update: SessionUpdate = {}
  for (const [id, value] of Object.entries(votes)) update[`votes/0/${id}`] = { value, submittedAt: NOW + 100 }
  return apply(session, update)
}

describe('Bluff : votes et points', () => {
  test('vote : choix publiés sans auteur ni type, auteurs gardés par l’hôte', () => {
    const { session, choices } = votingSession()
    expect(session.status).toBe('vote')
    expect(session.phaseEndsAt - session.phaseStartedAt).toBe(BLUFF_VOTE_DURATION_S * 1000)
    expect(session.currentQuestion?.choices).toEqual(choices.map((choice) => choice.text))
    expect(JSON.stringify(session.currentQuestion)).not.toContain('truth')
    expect(session.bluffOwn?.[0].p0).toBe(session.bluffOwn?.[0].p2)
  })

  test('1000 pour la vraie réponse, 500 par joueur piégé pour chaque auteur, rien pour un leurre', () => {
    const { session, choices, own } = votingSession()
    const truth = choices.findIndex((choice) => choice.kind === 'truth')
    const decoy = choices.findIndex((choice) => choice.kind === 'decoy')
    // p1 tombe dans le piège de p0 et p2 ; p0 trouve la vraie réponse ; p2 vote pour un leurre.
    const { choices: revealed, results } = bluffRevealData(vote(session, { p0: truth, p1: own.p0, p2: decoy }))
    expect(results.p0).toEqual({ correct: true, points: BLUFF_TRUTH_POINTS + BLUFF_TRAP_POINTS })
    expect(results.p2).toEqual({ correct: false, points: BLUFF_TRAP_POINTS })
    expect(results.p1).toEqual({ correct: false, points: 0 })
    expect(revealed[own.p0]).toMatchObject({ authors: ['p0', 'p2'], voters: ['p1'] })
    expect(revealed[decoy]).toEqual({ text: choices[decoy].text, kind: 'decoy', voters: ['p2'] })
  })

  test('un vote pour sa propre proposition est ignoré ; un auteur qui ne vote pas garde ses points de piège', () => {
    const { session, own } = votingSession()
    const { results } = bluffRevealData(vote(session, { p0: own.p0, p1: own.p2 }))
    expect(results.p0).toEqual({ correct: false, points: BLUFF_TRAP_POINTS })
    expect(results.p2).toEqual({ correct: false, points: BLUFF_TRAP_POINTS })
  })

  test('fin anticipée du vote quand tous les connectés ont voté', () => {
    const { session, own } = votingSession()
    expect(voteDeadline(vote(session, { p0: own.p1, p1: own.p0, p2: own.p1 }))).toBe(NOW + 100 + 2000)
    expect(voteDeadline(vote(session, { p0: own.p1 }))).toBe(session.phaseEndsAt + REVEAL_GRACE_MS)
  })
})

describe('Bluff : déroulé et moteur', () => {
  test('question (écriture, 60 s) → vote (30 s) → révélation (4 s + 2 s par fausse proposition)', () => {
    const context = { answerMode: 'bluff' as const, currentIndex: 0, questionCount: 3 }
    expect(nextPhase('question', context)).toEqual({ status: 'vote', currentIndex: 0, durationS: BLUFF_VOTE_DURATION_S })
    expect(nextPhase('vote', { ...context, choiceCount: 6 })).toEqual({ status: 'reveal', currentIndex: 0, durationS: 14 })
    expect(revealDurationS('bluff', 31)).toBe(64)
    expect(revealDurationS('choice', 6)).toBe(6)
  })

  test('partie complète : énoncé seul publié, points dans bluffPoints, scores cumulés', () => {
    const lobby = makeSession({ settings: BLUFF, players: players(3) })
    const launch = launchUpdate(lobby, BLUFF_QUESTIONS, NOW)
    expect(launch.ok).toBe(true)
    let session = apply(lobby, launch.ok ? launch.update : null)
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'starting', currentIndex: 0 }, NOW))
    expect(session.currentQuestion).toEqual({ text: QUESTION.text, difficulty: 3, timeLimit: QUESTION_DURATION_S.bluff })
    expect(nextDeadline(session)).toBe(session.phaseEndsAt + REVEAL_GRACE_MS)
    expect(hostControls(session).skip).toBe('vote')

    session = apply(session, { 'bluffs/0/p0': { text: 'Monopolis', submittedAt: NOW + 1 } })
    session = apply(session, bluffChecksUpdate(session, QUESTION))
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'question', currentIndex: 0 }, NOW + 10))
    expect(pauseUpdate(session, NOW + 11)).toMatchObject({ pausedFrom: 'vote' })
    const own = session.bluffOwn?.[0] ?? {}
    session = vote(session, { p1: own.p0 })
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'vote', currentIndex: 0 }, NOW + 20))
    expect(session.status).toBe('reveal')
    expect(session.reveal?.correctAnswer).toBe(QUESTION.answer)
    expect(session.bluffPoints?.[0]).toEqual({ p0: BLUFF_TRAP_POINTS, p1: 0 })
    expect(session.answers).toBeUndefined()
    expect(session.players.p0.score).toBe(BLUFF_TRAP_POINTS)
    expect(session.phaseEndsAt - session.phaseStartedAt).toBe(revealDurationS('bluff', session.currentQuestion?.choices?.length) * 1000)

    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'reveal', currentIndex: 0 }, NOW + 40))
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'scores', currentIndex: 0 }, NOW + 50))
    expect(session.currentIndex).toBe(1)
    expect(session.currentQuestion?.choices).toBeUndefined()
    // Deuxième question : le score cumule les points de la première.
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'question', currentIndex: 1 }, NOW + 60))
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'vote', currentIndex: 1 }, NOW + 70))
    expect(session.players.p0.score).toBe(BLUFF_TRAP_POINTS)
  })

  test('Suspense : révélation puis question suivante ; Groupe : moyenne d’équipe des points du Bluff', () => {
    const teamPlayers = {
      p0: player('A', { team: 'pink' as const }),
      p1: player('B', { team: 'pink' as const }),
      p2: player('C', { team: 'cyan' as const }),
      p3: player('D', { team: 'cyan' as const }),
    }
    let session = makeSession({
      status: 'vote',
      settings: { ...BLUFF, suspense: true, teams: true, teamCount: 2 },
      players: teamPlayers,
      phaseEndsAt: NOW,
      questionCount: 3,
      currentQuestion: { text: QUESTION.text, difficulty: 3, timeLimit: 45, choices: ['Vraie', 'Leurre'] },
      bluffChoices: { 0: [{ text: QUESTION.answer, kind: 'truth' }, { text: 'Leurre', kind: 'decoy' }] },
    })
    session = vote(session, { p0: 0, p1: 0, p2: 1, p3: 0 })
    session = apply(session, transitionUpdate(session, BLUFF_QUESTIONS, { status: 'vote', currentIndex: 0 }, NOW))
    expect(session.teamPoints?.[0]).toEqual({ pink: BLUFF_TRUTH_POINTS, cyan: BLUFF_TRUTH_POINTS / 2 })
    expect(hostControls(session).skip).toBe('nextQuestion')
  })

  test('lancement et Rejouer effacent les données du Bluff', () => {
    const launch = launchUpdate(makeSession({ settings: BLUFF }), BLUFF_QUESTIONS, NOW)
    expect(launch.ok && launch.update).toMatchObject({ bluffs: null, votes: null, bluffPoints: null, bluffOwn: null })
    expect(replayUpdate(makeSession({ status: 'ended', settings: BLUFF }), NOW)).toMatchObject({ bluffChecks: null, votedBy: null })
  })
})

describe('Bluff : téléphone du joueur', () => {
  const entry = { text: 'Monopolis', submittedAt: 10 }
  test('état de l’écriture : rien, en vérification, refusée, acceptée, plus d’essai', () => {
    expect(bluffWriteStatus(null, null)).toBe('writing')
    expect(bluffWriteStatus(entry, null)).toBe('checking')
    expect(bluffWriteStatus(entry, { verdict: 'truth', refusals: 1, submittedAt: 10 })).toBe('refused')
    // Réécrite après un refus : de nouveau en vérification.
    expect(bluffWriteStatus({ ...entry, submittedAt: 20 }, { verdict: 'truth', refusals: 1, submittedAt: 10 })).toBe('checking')
    expect(bluffWriteStatus(entry, { verdict: 'ok', refusals: 1, submittedAt: 10 })).toBe('accepted')
    expect(bluffWriteStatus(entry, { verdict: 'forbidden', refusals: 3, submittedAt: 10 })).toBe('exhausted')
    expect(bluffAttemptsLeft({ verdict: 'truth', refusals: 1, submittedAt: 10 })).toBe(2)
    expect(bluffAttemptsLeft(null)).toBe(3)
  })

  test('résultat : choix voté, propre proposition et points', () => {
    const choices = [
      { text: 'Vraie', kind: 'truth' as const, voters: ['a'] },
      { text: 'Monopolis', kind: 'bluff' as const, authors: ['me'], voters: ['b', 'c'] },
      { text: 'Leurre', kind: 'decoy' as const, voters: ['me'] },
    ]
    const outcome = bluffPlayerOutcome(choices, { correct: false, points: 1000 }, 'me')
    expect(outcome.voted?.text).toBe('Leurre')
    expect(outcome.own?.voters).toEqual(['b', 'c'])
    expect(outcome.points).toBe(1000)
    expect(bluffPlayerOutcome(choices, undefined, 'x')).toEqual({ voted: null, own: null, points: 0 })
  })
})

describe('settingsForGameType', () => {
  const settings: SessionSettings = { ...DEFAULT_SESSION_SETTINGS, speedBonus: true, teams: true, suspense: true }

  test('Bluff : mode bluff, sans Contrôle ni Rapidité, Groupe et rythme gardés', () => {
    expect(settingsForGameType({ ...settings, answerMode: 'free', control: true }, 'bluff')).toEqual({
      ...settings,
      answerMode: 'bluff',
      speedBonus: false,
      control: false,
    })
  })

  test('autre quiz : le mode bluff revient au mode par défaut, le reste ne change pas', () => {
    expect(settingsForGameType({ ...settings, answerMode: 'bluff' }, 'quiz').answerMode).toBe(DEFAULT_SESSION_SETTINGS.answerMode)
    expect(settingsForGameType({ ...settings, answerMode: 'free' }, 'blindTest')).toEqual({ ...settings, answerMode: 'free' })
  })
})

// Hôte qui joue : sa propre proposition arrive d'abord avec une estimation locale de l'heure du serveur,
// puis avec la vraie valeur (quelques dizaines de millisecondes plus tard). Avant la correction, son
// verdict restait apparié à l'estimation et la proposition disparaissait des choix du vote.
describe('Bluff : proposition de l’hôte qui joue (heure corrigée par le serveur)', () => {
  const SERVER_DELAY_MS = 30

  // Propositions jugées sur l'estimation de p0 (l'hôte qui joue), puis heure de p0 corrigée par le serveur.
  function judgedThenCorrected(texts: Record<PlayerId, string>): Session {
    let session: Session = { ...writing(texts), hostUid: 'p0' }
    session = apply(session, bluffChecksUpdate(session, QUESTION))
    const estimate = session.bluffs?.[0].p0.submittedAt ?? NOW
    return apply(session, { 'bluffs/0/p0': { text: texts.p0, submittedAt: estimate + SERVER_DELAY_MS } })
  }

  function atVote(session: Session): Session {
    const judged = apply(session, bluffChecksUpdate(session, QUESTION))
    return apply(judged, transitionUpdate(judged, [QUESTION], { status: 'question', currentIndex: 0 }, NOW + 1_000, {}, {}, sequence([0.3])))
  }

  test('heure corrigée : verdict gardé, heure recopiée, aucun essai compté ni nouveau jugement', () => {
    const session = judgedThenCorrected({ p0: 'Monopolis', p1: 'Rue Royale' })
    expect(bluffChecksUpdate(session, QUESTION)).toEqual({ 'bluffChecks/0/p0/submittedAt': NOW + SERVER_DELAY_MS })
    const refused = judgedThenCorrected({ p0: "The Landlord's Game", p1: 'Rue Royale' })
    const restamped = apply(refused, bluffChecksUpdate(refused, QUESTION))
    expect(restamped.bluffChecks?.[0].p0).toEqual({ verdict: 'truth', refusals: 1, submittedAt: NOW + SERVER_DELAY_MS })
    // L'écran de l'hôte affiche bien le refus (et non « Vérification… » sans fin).
    expect(bluffWriteStatus(restamped.bluffs?.[0].p0 ?? null, restamped.bluffChecks?.[0].p0 ?? null)).toBe('refused')
  })

  test('2 joueurs (hôte qui joue + 1) : les deux propositions sont dans les choix, chacun ne peut pas voter pour la sienne', () => {
    const voting = atVote(judgedThenCorrected({ p0: 'Monopolis', p1: 'Rue Royale' }))
    const choices = voting.bluffChoices?.[0] ?? []
    const own = voting.bluffOwn?.[0] ?? {}
    expect(choices.filter((choice) => choice.kind === 'bluff').map((choice) => choice.text).sort()).toEqual(['Monopolis', 'Rue Royale'])
    expect(voting.currentQuestion?.choices).toEqual(choices.map((choice) => choice.text))
    expect(choices[own.p0]).toMatchObject({ text: 'Monopolis', authors: ['p0'] })
    expect(choices[own.p1]).toMatchObject({ text: 'Rue Royale', authors: ['p1'] })
    // Un vote pour sa propre proposition est ignoré ; celui de l'autre joueur compte.
    const revealed = bluffRevealData(vote(voting, { p0: own.p0, p1: own.p0 }))
    expect(revealed.choices[own.p0].voters).toEqual(['p1'])
    expect(revealed.results.p0).toMatchObject({ correct: false, points: BLUFF_TRAP_POINTS })
  })

  test('autre joueur : un nouvel essai, même très rapide, est jugé (la tolérance ne vaut que pour l’hôte)', () => {
    let session: Session = { ...writing({ p0: 'Monopolis', p1: "The Landlord's Game" }), hostUid: 'p0' }
    session = apply(session, bluffChecksUpdate(session, QUESTION))
    session = apply(session, { 'bluffs/0/p1': { text: 'Rue Royale', submittedAt: NOW + 20 } })
    session = apply(session, bluffChecksUpdate(session, QUESTION))
    expect(session.bluffChecks?.[0].p1).toEqual({ verdict: 'ok', refusals: 1, submittedAt: NOW + 20 })
  })

  test('3 joueurs : les trois propositions sont dans les choix', () => {
    const voting = atVote(judgedThenCorrected({ p0: 'Monopolis', p1: 'Rue Royale', p2: 'Capitale Express' }))
    const texts = (voting.bluffChoices?.[0] ?? []).filter((choice) => choice.kind === 'bluff').map((choice) => choice.text)
    expect(texts.sort()).toEqual(['Capitale Express', 'Monopolis', 'Rue Royale'])
    expect(new Set(Object.values(voting.bluffOwn?.[0] ?? {})).size).toBe(3)
  })
})
