import { describe, expect, test } from 'vitest'

import {
  ALL_ANSWERED_DELAY_S,
  QUESTIONS_PER_GAME,
  REVEAL_DURATION_S,
  REVEAL_GRACE_MS,
  SCORES_DURATION_S,
  TRANSITION_LOCK_MAX_MS,
} from '../../shared/constants'
import {
  buildReveal,
  endUpdate,
  gradeAnswer,
  hostControls,
  isResumableBy,
  isTransitionLocked,
  launchUpdate,
  nextDeadline,
  pauseUpdate,
  replayUpdate,
  resumeUpdate,
  selectGameQuestions,
  toPublicQuestion,
  transitionKey,
  transitionUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import type { Answer, Question, Session } from '../../shared/types'
import { HOST, makeQuestion, makeSession, OTHER, PLAYER, player, PLAYERS, QUESTIONS } from './engineFixtures'

const NOW = 2_000_000
const QUESTION_MS = 20_000
const CHOICE = { answerMode: 'choice' as const, speedBonus: true }

function answer(value: Answer['value'], submittedAt: number, extra: Partial<Answer> = {}): Answer {
  return { value, submittedAt, ...extra }
}

// Session en QUESTION (index donné), phase de 20 s se terminant à NOW.
function questionSession(overrides: Partial<Session> = {}): Session {
  return makeSession({
    status: 'question',
    currentIndex: 0,
    questionCount: QUESTIONS_PER_GAME,
    phaseStartedAt: NOW - QUESTION_MS,
    phaseEndsAt: NOW,
    ...overrides,
  })
}

// Clés et valeurs qui révéleraient la bonne réponse avant la révélation.
const SECRET_KEYS = ['correctIndex', 'acceptedAnswers', 'explanation', 'correctAnswer', 'reveal']

// Parcourt récursivement toutes les valeurs d'un update : aucune clé secrète (sauf reveal: null,
// qui efface), aucune réponse acceptée ni explication ; en Réponse libre, pas non plus le texte
// de la bonne proposition (en Choix multiples, il figure forcément parmi les propositions).
function findSecrets(value: unknown, question: Question, isFree: boolean, path = ''): string[] {
  const forbiddenValues = [...question.acceptedAnswers, question.explanation ?? '']
  if (isFree) forbiddenValues.push(question.options[question.correctIndex])
  if (typeof value === 'string') return forbiddenValues.includes(value) ? [path] : []
  if (value === null || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => {
    const childPath = `${path}/${key}`
    const lastSegment = key.split('/').at(-1) ?? key
    if (SECRET_KEYS.includes(lastSegment) && child !== null) return [childPath]
    return findSecrets(child, question, isFree, childPath)
  })
}

describe('selectGameQuestions', () => {
  test('au plus QUESTIONS_PER_GAME questions, dans l’ordre', () => {
    expect(selectGameQuestions(QUESTIONS).map((q) => q.id)).toEqual(QUESTIONS.slice(0, QUESTIONS_PER_GAME).map((q) => q.id))
  })

  test('moins de questions disponibles : toutes ; aucune : liste vide', () => {
    expect(selectGameQuestions(QUESTIONS.slice(0, 3))).toHaveLength(3)
    expect(selectGameQuestions([])).toEqual([])
  })

  test('limite (partie courte de développement) : les premières questions seulement', () => {
    expect(selectGameQuestions(QUESTIONS, 3).map((q) => q.id)).toEqual(['q-0', 'q-1', 'q-2'])
  })

  test('limite jamais au-delà de QUESTIONS_PER_GAME, ni négative', () => {
    expect(selectGameQuestions(QUESTIONS, 50)).toHaveLength(QUESTIONS_PER_GAME)
    expect(selectGameQuestions(QUESTIONS, -1)).toEqual([])
  })
})

describe('toPublicQuestion', () => {
  test('Choix multiples : énoncé, propositions, difficulté, durée, et rien d’autre', () => {
    const published = toPublicQuestion(QUESTIONS[0], 'choice')
    expect(Object.keys(published).sort()).toEqual(['difficulty', 'options', 'text', 'timeLimit'])
    expect(published.timeLimit).toBe(20)
  })

  test('Réponse libre : pas de propositions, durée du mode', () => {
    const published = toPublicQuestion(QUESTIONS[0], 'free')
    expect(published.options).toBeUndefined()
    expect(published.timeLimit).toBe(30)
  })

  test('durée propre à la question prioritaire', () => {
    expect(toPublicQuestion(makeQuestion(0, { timeLimit: 45 }), 'choice').timeLimit).toBe(45)
  })

  test('aucune information secrète, dans les deux modes', () => {
    for (const mode of ['choice', 'free'] as const) {
      expect(findSecrets(toPublicQuestion(QUESTIONS[0], mode), QUESTIONS[0], mode === 'free')).toEqual([])
    }
  })
})

describe('gradeAnswer', () => {
  const question = QUESTIONS[0]

  test('bonne réponse à mi-temps avec Rapidité : 150 points', () => {
    expect(gradeAnswer(question, answer(1, NOW - QUESTION_MS / 2), CHOICE, NOW)).toEqual({ correct: true, points: 150 })
  })

  test('bonne réponse à la dernière milliseconde : 100 points, bonus nul', () => {
    expect(gradeAnswer(question, answer(1, NOW), CHOICE, NOW)).toEqual({ correct: true, points: 100 })
  })

  test('bonne réponse reçue dans la tolérance après la fin : juste, bonus nul', () => {
    expect(gradeAnswer(question, answer(1, NOW + 800), CHOICE, NOW)).toEqual({ correct: true, points: 100 })
  })

  test('mauvaise proposition, ou valeur du mauvais type : 0 point', () => {
    expect(gradeAnswer(question, answer(2, NOW - 5_000), CHOICE, NOW)).toEqual({ correct: false, points: 0 })
    expect(gradeAnswer(question, answer('1', NOW - 5_000), CHOICE, NOW)).toEqual({ correct: false, points: 0 })
  })

  test('Rapidité désactivée : 100 points quelle que soit la vitesse', () => {
    expect(gradeAnswer(question, answer(1, NOW - QUESTION_MS), { ...CHOICE, speedBonus: false }, NOW).points).toBe(100)
  })

  test('Réponse libre : validation par answerMatching (faute de frappe tolérée)', () => {
    const capital = makeQuestion(0, { acceptedAnswers: ['canberra'] })
    const free = { answerMode: 'free' as const, speedBonus: false }
    expect(gradeAnswer(capital, answer('Canbera', NOW - 1_000), free, NOW).correct).toBe(true)
    expect(gradeAnswer(capital, answer('Sydney', NOW - 1_000), free, NOW).correct).toBe(false)
    expect(gradeAnswer(capital, answer(1, NOW - 1_000), free, NOW).correct).toBe(false)
  })
})

describe('buildReveal', () => {
  test('aucune réponse : répartition à zéro, aucun résultat, scores et égalités conservés', () => {
    const { reveal, results, scores, ranks } = buildReveal(QUESTIONS[0], questionSession())
    expect(reveal.stats.choiceCounts).toEqual([0, 0, 0, 0])
    expect(results).toEqual({})
    expect(scores).toEqual({ [HOST]: 0, [PLAYER]: 0, [OTHER]: 0 })
    expect(ranks).toEqual({ [HOST]: 1, [PLAYER]: 1, [OTHER]: 1 })
  })

  test('bonne réponse, explication, répartition et résultats des seuls joueurs ayant répondu', () => {
    const session = questionSession({
      answers: { 0: { [PLAYER]: answer(1, NOW - 10_000), [OTHER]: answer(3, NOW - 2_000) } },
    })
    const { reveal, results } = buildReveal(QUESTIONS[0], session)
    expect(reveal.correctAnswer).toBe('Juste 0')
    expect(reveal.explanation).toBe('Explication 0.')
    expect(reveal.stats.choiceCounts).toEqual([0, 1, 0, 1])
    expect(results).toEqual({ [PLAYER]: { correct: true, points: 150 }, [OTHER]: { correct: false, points: 0 } })
  })

  test('score = points des questions précédentes + question courante ; égalités 1, 1, 3', () => {
    const session = questionSession({
      currentIndex: 1,
      answers: {
        0: { [PLAYER]: answer(1, 0, { correct: true, points: 100 }), [HOST]: answer(1, 0, { correct: true, points: 200 }) },
        1: { [PLAYER]: answer(1, NOW) },
      },
    })
    const { scores, ranks } = buildReveal(QUESTIONS[1], session)
    expect(scores).toEqual({ [HOST]: 200, [PLAYER]: 200, [OTHER]: 0 })
    expect(ranks).toEqual({ [HOST]: 1, [PLAYER]: 1, [OTHER]: 3 })
  })

  test('révélation rejouée : mêmes scores, même si les points sont déjà écrits dans answers', () => {
    const first = questionSession({ answers: { 0: { [PLAYER]: answer(1, NOW - 10_000) } } })
    const replay = questionSession({
      answers: { 0: { [PLAYER]: answer(1, NOW - 10_000, { correct: true, points: 150 }) } },
    })
    expect(buildReveal(QUESTIONS[0], replay).scores).toEqual(buildReveal(QUESTIONS[0], first).scores)
  })

  test('joueur déconnecté : garde son score et son rang ; réponse d’un inconnu ignorée', () => {
    const session = questionSession({
      currentIndex: 1,
      players: { ...PLAYERS, [OTHER]: player('Tom', { connected: false }) },
      answers: {
        0: { [OTHER]: answer(1, 0, { correct: true, points: 180 }) },
        1: { 'intrus-uid': answer(1, NOW - 1_000) },
      },
    })
    const { scores, ranks, results, reveal } = buildReveal(QUESTIONS[1], session)
    expect(scores[OTHER]).toBe(180)
    expect(ranks[OTHER]).toBe(1)
    expect(results).toEqual({})
    expect(reveal.stats.choiceCounts).toEqual([0, 0, 0, 0])
  })
})

describe('nextDeadline', () => {
  const allConnectedAnswered = {
    0: { [HOST]: answer(1, NOW - 9_000), [PLAYER]: answer(0, NOW - 8_000), [OTHER]: answer(2, NOW - 7_000) },
  }

  test('STARTING, REVEAL, SCORES : fin de la phase', () => {
    for (const status of ['starting', 'reveal', 'scores'] as const) {
      expect(nextDeadline(makeSession({ status, phaseEndsAt: NOW }))).toBe(NOW)
    }
  })

  test('LOBBY, PAUSED, END : pas d’échéance automatique', () => {
    for (const status of ['lobby', 'paused', 'ended'] as const) {
      expect(nextDeadline(makeSession({ status, phaseEndsAt: NOW }))).toBeNull()
    }
  })

  test('QUESTION sans toutes les réponses : fin du chrono + marge', () => {
    expect(nextDeadline(questionSession())).toBe(NOW + REVEAL_GRACE_MS)
  })

  test('QUESTION : tous les connectés ont répondu → 2 s après la dernière réponse', () => {
    expect(nextDeadline(questionSession({ answers: allConnectedAnswered }))).toBe(NOW - 7_000 + ALL_ANSWERED_DELAY_S * 1000)
  })

  test('un joueur encore marqué connecté sans réponse empêche la fin anticipée', () => {
    const { [OTHER]: _late, ...twoAnswers } = allConnectedAnswered[0]
    expect(nextDeadline(questionSession({ answers: { 0: twoAnswers } }))).toBe(NOW + REVEAL_GRACE_MS)
  })

  test('un joueur déconnecté sans réponse ne retient pas la partie', () => {
    const { [OTHER]: _gone, ...twoAnswers } = allConnectedAnswered[0]
    const session = questionSession({
      players: { ...PLAYERS, [OTHER]: player('Tom', { connected: false }) },
      answers: { 0: twoAnswers },
    })
    expect(nextDeadline(session)).toBe(NOW - 8_000 + ALL_ANSWERED_DELAY_S * 1000)
  })

  test('fin anticipée jamais plus tard que le chrono + marge (dernière réponse à la dernière seconde)', () => {
    const lastSecond = { 0: { ...allConnectedAnswered[0], [OTHER]: answer(2, NOW) } }
    expect(nextDeadline(questionSession({ answers: lastSecond }))).toBe(NOW + REVEAL_GRACE_MS)
  })

  test('aucun joueur connecté : fin du chrono + marge', () => {
    const nobody = Object.fromEntries(Object.entries(PLAYERS).map(([id, p]) => [id, { ...p, connected: false }]))
    expect(nextDeadline(questionSession({ players: nobody }))).toBe(NOW + REVEAL_GRACE_MS)
  })
})

describe('launchUpdate', () => {
  test('lancement : STARTING, questionCount, scores à zéro, réponses effacées', () => {
    const result = launchUpdate(makeSession(), QUESTIONS, NOW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.update).toMatchObject({
      status: 'starting',
      questionCount: QUESTIONS_PER_GAME,
      currentIndex: 0,
      phaseStartedAt: NOW,
      phaseEndsAt: NOW + 3_000,
      answers: null,
      answeredBy: null,
      [`players/${PLAYER}/score`]: 0,
      [`players/${PLAYER}/rank`]: 1,
    })
  })

  test('partie courte : questionCount = limite ; sans limite, 10 questions', () => {
    const short = launchUpdate(makeSession(), QUESTIONS, NOW, 3)
    expect(short.ok && short.update.questionCount).toBe(3)
    const full = launchUpdate(makeSession(), QUESTIONS, NOW)
    expect(full.ok && full.update.questionCount).toBe(QUESTIONS_PER_GAME)
  })

  test('moins de 10 questions : questionCount = nombre disponible', () => {
    const result = launchUpdate(makeSession(), QUESTIONS.slice(0, 4), NOW)
    expect(result.ok && result.update.questionCount).toBe(4)
  })

  test('refus avec la raison', () => {
    const lonely = { [HOST]: player('Hôte') }
    const crowd = Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`p${i}`, player(`J${i}`)]))
    expect(launchUpdate(makeSession({ status: 'question' }), QUESTIONS, NOW)).toEqual({ ok: false, reason: 'notLobby' })
    const free = makeSession({ settings: { answerMode: 'free', speedBonus: true, control: false, teams: false } })
    expect(launchUpdate(free, QUESTIONS, NOW)).toEqual({ ok: false, reason: 'freeAnswerSoon' })
    expect(launchUpdate(makeSession({ players: lonely }), QUESTIONS, NOW)).toEqual({ ok: false, reason: 'notEnoughPlayers' })
    expect(launchUpdate(makeSession({ players: crowd }), QUESTIONS, NOW)).toEqual({ ok: false, reason: 'tooManyPlayers' })
    expect(launchUpdate(makeSession(), [], NOW)).toEqual({ ok: false, reason: 'noQuestions' })
  })
})

describe('transitionUpdate', () => {
  const game = selectGameQuestions(QUESTIONS)

  test('état attendu différent (transition rejouée) : ignorée', () => {
    const session = questionSession()
    expect(transitionUpdate(session, game, { status: 'starting', currentIndex: 0 }, NOW)).toBeNull()
    expect(transitionUpdate(session, game, { status: 'question', currentIndex: 1 }, NOW)).toBeNull()
  })

  test('LOBBY (lancement à part), PAUSED, END : pas de transition automatique', () => {
    for (const status of ['lobby', 'paused', 'ended'] as const) {
      expect(transitionUpdate(makeSession({ status }), game, { status, currentIndex: 0 }, NOW)).toBeNull()
    }
  })

  test('STARTING → QUESTION 0 : question publique, reveal effacé, 20 s', () => {
    const session = makeSession({ status: 'starting', questionCount: 10 })
    expect(transitionUpdate(session, game, { status: 'starting', currentIndex: 0 }, NOW)).toEqual({
      status: 'question',
      currentIndex: 0,
      phaseStartedAt: NOW,
      phaseEndsAt: NOW + 20_000,
      currentQuestion: toPublicQuestion(game[0], 'choice'),
      reveal: null,
    })
  })

  test('QUESTION → REVEAL : reveal, correct et points dans answers, score et rang des joueurs', () => {
    const session = questionSession({ answers: { 0: { [PLAYER]: answer(1, NOW - 10_000) } } })
    const update = transitionUpdate(session, game, { status: 'question', currentIndex: 0 }, NOW + 1_200)
    expect(update).toMatchObject({
      status: 'reveal',
      phaseEndsAt: NOW + 1_200 + REVEAL_DURATION_S.choice * 1000,
      [`answers/0/${PLAYER}/correct`]: true,
      [`answers/0/${PLAYER}/points`]: 150,
      [`players/${PLAYER}/score`]: 150,
      [`players/${PLAYER}/rank`]: 1,
      [`players/${HOST}/rank`]: 2,
    })
    expect((update?.reveal as { correctAnswer: string }).correctAnswer).toBe('Juste 0')
  })

  test('REVEAL → SCORES : durée du classement, reveal conservé', () => {
    const session = makeSession({ status: 'reveal', questionCount: 10 })
    expect(transitionUpdate(session, game, { status: 'reveal', currentIndex: 0 }, NOW)).toEqual({
      status: 'scores',
      currentIndex: 0,
      phaseStartedAt: NOW,
      phaseEndsAt: NOW + SCORES_DURATION_S * 1000,
    })
  })

  test('SCORES → QUESTION suivante, avec sa durée propre', () => {
    const custom = [...game.slice(0, 3), makeQuestion(3, { timeLimit: 45 }), ...game.slice(4)]
    const session = makeSession({ status: 'scores', currentIndex: 2, questionCount: 10 })
    const update = transitionUpdate(session, custom, { status: 'scores', currentIndex: 2 }, NOW)
    expect(update).toMatchObject({ status: 'question', currentIndex: 3, phaseEndsAt: NOW + 45_000, reveal: null })
  })

  test('SCORES après la dernière question → END : question et révélation effacées', () => {
    const session = makeSession({ status: 'scores', currentIndex: 9, questionCount: 10 })
    expect(transitionUpdate(session, game, { status: 'scores', currentIndex: 9 }, NOW)).toEqual({
      status: 'ended',
      currentIndex: 9,
      phaseStartedAt: NOW,
      phaseEndsAt: 0,
      currentQuestion: null,
      reveal: null,
    })
  })
})

describe('pauseUpdate et resumeUpdate', () => {
  test('pause en QUESTION : état et temps restant mémorisés', () => {
    expect(pauseUpdate(questionSession(), NOW - 12_000)).toEqual({ status: 'paused', pausedFrom: 'question', remainingMs: 12_000 })
  })

  test('pause après la fin du chrono : temps restant à 0, jamais négatif', () => {
    expect(pauseUpdate(questionSession(), NOW + 500)?.remainingMs).toBe(0)
  })

  test('pause impossible en LOBBY, END ou déjà en PAUSED', () => {
    for (const status of ['lobby', 'ended', 'paused'] as const) {
      expect(pauseUpdate(makeSession({ status }), NOW)).toBeNull()
    }
  })

  test('reprise : état mémorisé, fin recalculée, durée de phase conservée', () => {
    const paused = questionSession({ status: 'paused', pausedFrom: 'question', remainingMs: 12_000 })
    const resumeAt = NOW + 60_000
    const update = resumeUpdate(paused, resumeAt)
    expect(update).toEqual({
      status: 'question',
      phaseStartedAt: resumeAt + 12_000 - QUESTION_MS,
      phaseEndsAt: resumeAt + 12_000,
      pausedFrom: null,
      remainingMs: null,
    })
  })

  test('reprise hors pause (double reprise) : ignorée', () => {
    expect(resumeUpdate(questionSession(), NOW)).toBeNull()
  })
})

describe('Bonne réponse jamais publiée avant la révélation', () => {
  // Tous les updates produits avant REVEAL, dans les deux modes de réponse.
  function updatesBeforeReveal(isFree: boolean): SessionUpdate[] {
    const settings = { answerMode: isFree ? ('free' as const) : ('choice' as const), speedBonus: true, control: false, teams: false }
    const game = selectGameQuestions(QUESTIONS)
    const launch = launchUpdate(makeSession(), QUESTIONS, NOW)
    const starting = makeSession({ status: 'starting', questionCount: 10, settings })
    const scores = makeSession({ status: 'scores', currentIndex: 0, questionCount: 10, settings })
    const question = questionSession({ settings })
    const paused = questionSession({ settings, status: 'paused', pausedFrom: 'question', remainingMs: 5_000 })
    return [
      launch.ok ? launch.update : {},
      transitionUpdate(starting, game, { status: 'starting', currentIndex: 0 }, NOW) ?? {},
      transitionUpdate(scores, game, { status: 'scores', currentIndex: 0 }, NOW) ?? {},
      pauseUpdate(question, NOW - 5_000) ?? {},
      resumeUpdate(paused, NOW) ?? {},
    ]
  }

  test('Choix multiples : ni index, ni réponses acceptées, ni explication, ni reveal', () => {
    const updates = updatesBeforeReveal(false)
    updates.forEach((update, index) => expect(findSecrets(update, QUESTIONS[index === 2 ? 1 : 0], false)).toEqual([]))
  })

  test('Réponse libre : pas même le texte de la bonne proposition', () => {
    const updates = updatesBeforeReveal(true)
    updates.forEach((update, index) => expect(findSecrets(update, QUESTIONS[index === 2 ? 1 : 0], true)).toEqual([]))
  })

  test('le détecteur repère bien une fuite (contrôle du test)', () => {
    const leaked = { currentQuestion: { ...toPublicQuestion(QUESTIONS[0], 'choice'), correctIndex: 1 } }
    expect(findSecrets(leaked, QUESTIONS[0], false)).not.toEqual([])
  })
})

describe('verrou de transition', () => {
  const key = transitionKey({ status: 'question', currentIndex: 2 })

  test('aucun verrou : transition possible', () => {
    expect(isTransitionLocked(null, key, NOW)).toBe(false)
  })

  test('même transition en cours depuis moins de 10 s : verrouillée', () => {
    expect(isTransitionLocked({ key, since: NOW - 9_999 }, key, NOW)).toBe(true)
  })

  test('écriture en attente depuis 10 s ou plus : verrou relâché', () => {
    expect(isTransitionLocked({ key, since: NOW - TRANSITION_LOCK_MAX_MS }, key, NOW)).toBe(false)
  })

  test('autre transition : jamais bloquée par un ancien verrou', () => {
    expect(isTransitionLocked({ key: 'starting/0', since: NOW }, key, NOW)).toBe(false)
  })
})

describe('isResumableBy', () => {
  test('partie en cours dont je suis l’hôte : reprise possible', () => {
    expect(isResumableBy({ hostUid: HOST, status: 'question' }, HOST)).toBe(true)
    expect(isResumableBy({ hostUid: HOST, status: 'lobby' }, HOST)).toBe(true)
  })

  test('partie inexistante, terminée, ou d’un autre hôte : pas de reprise', () => {
    expect(isResumableBy(null, HOST)).toBe(false)
    expect(isResumableBy({}, HOST)).toBe(false)
    expect(isResumableBy({ hostUid: HOST, status: 'ended' }, HOST)).toBe(false)
    expect(isResumableBy({ hostUid: OTHER, status: 'question' }, HOST)).toBe(false)
  })
})

describe('Passer (contrôle de l’hôte)', () => {
  const game = selectGameQuestions(QUESTIONS)

  test('pendant la question, avant la fin : réponses données notées avec le bonus d’origine', () => {
    // Passer à mi-chrono : la réponse donnée 15 s avant la fin prévue garde 175 points.
    const session = questionSession({ answers: { 0: { [PLAYER]: answer(1, NOW - 15_000) } } })
    const update = transitionUpdate(session, game, { status: 'question', currentIndex: 0 }, NOW - 10_000)
    expect(update).toMatchObject({ status: 'reveal', [`answers/0/${PLAYER}/points`]: 175 })
  })

  test('double Passer : la seconde transition est ignorée', () => {
    const session = questionSession()
    const expected = { status: 'question' as const, currentIndex: 0 }
    const first = transitionUpdate(session, game, expected, NOW - 10_000)
    expect(first).not.toBeNull()
    // Session telle que relue après la première écriture : déjà en REVEAL.
    const after = { ...session, status: 'reveal' as const }
    expect(transitionUpdate(after, game, expected, NOW - 9_900)).toBeNull()
  })
})

describe('endUpdate (Terminer)', () => {
  test('depuis chaque état en cours : END, question et révélation effacées, scores conservés', () => {
    for (const status of ['starting', 'question', 'reveal', 'scores'] as const) {
      const update = endUpdate(questionSession({ status }), NOW)
      expect(update).toEqual({
        status: 'ended',
        phaseStartedAt: NOW,
        phaseEndsAt: 0,
        currentQuestion: null,
        reveal: null,
        pausedFrom: null,
        remainingMs: null,
      })
      expect(Object.keys(update ?? {}).some((key) => key.startsWith('players/') || key.startsWith('answers'))).toBe(false)
    }
  })

  test('pendant la pause : accepté, état de pause effacé', () => {
    const paused = questionSession({ status: 'paused', pausedFrom: 'question', remainingMs: 5_000 })
    expect(endUpdate(paused, NOW)).toMatchObject({ status: 'ended', pausedFrom: null, remainingMs: null })
  })

  test('en LOBBY ou déjà terminée : rien à faire', () => {
    expect(endUpdate(makeSession({ status: 'lobby' }), NOW)).toBeNull()
    expect(endUpdate(makeSession({ status: 'ended' }), NOW)).toBeNull()
  })
})

describe('replayUpdate (Rejouer)', () => {
  test('depuis END : retour au LOBBY, mêmes joueurs, scores et réponses effacés', () => {
    const ended = makeSession({ status: 'ended', currentIndex: 9, questionCount: 10, answers: {}, answeredBy: {} })
    const update = replayUpdate(ended, NOW)
    expect(update).toMatchObject({
      status: 'lobby',
      currentIndex: 0,
      phaseStartedAt: NOW,
      phaseEndsAt: 0,
      questionCount: null,
      currentQuestion: null,
      reveal: null,
      answers: null,
      answeredBy: null,
      [`players/${PLAYER}/score`]: null,
      [`players/${PLAYER}/rank`]: null,
    })
    // Les joueurs eux-mêmes ne sont jamais supprimés.
    expect(Object.keys(update ?? {})).not.toContain(`players/${PLAYER}`)
  })

  test('hors de END : refusé', () => {
    for (const status of ['lobby', 'question', 'paused'] as const) {
      expect(replayUpdate(makeSession({ status }), NOW)).toBeNull()
    }
  })
})

describe('hostControls', () => {
  test('libellé de Passer selon la phase', () => {
    expect(hostControls(makeSession({ status: 'starting' })).skip).toBe('firstQuestion')
    expect(hostControls(questionSession()).skip).toBe('reveal')
    expect(hostControls(makeSession({ status: 'reveal' })).skip).toBe('scores')
    expect(hostControls(makeSession({ status: 'scores', currentIndex: 3, questionCount: 10 })).skip).toBe('nextQuestion')
    expect(hostControls(makeSession({ status: 'scores', currentIndex: 9, questionCount: 10 })).skip).toBe('finalRanking')
  })

  test('pause : Reprendre et Terminer seulement, ni Passer ni Pause', () => {
    expect(hostControls(makeSession({ status: 'paused', pausedFrom: 'question' }))).toEqual({
      skip: null,
      canPause: false,
      canResume: true,
      canEnd: true,
      canReplay: false,
    })
  })

  test('LOBBY : aucun contrôle ; END : seulement Rejouer et Quitter', () => {
    const none = { skip: null, canPause: false, canResume: false, canEnd: false }
    expect(hostControls(makeSession({ status: 'lobby' }))).toEqual({ ...none, canReplay: false })
    expect(hostControls(makeSession({ status: 'ended' }))).toEqual({ ...none, canReplay: true })
  })
})
