import { describe, expect, test } from 'vitest'

import { containsForbiddenWord, displayableAnswer } from '../../shared/answerFilter'
import { isAnswerCorrect, matchAnswer, normalizeAnswer } from '../../shared/answerMatching'
import { FREE_ANSWER_GROUPS_MAX, HIDDEN_ANSWER_TEXT, QUESTION_DURATION_S, REVEAL_DURATION_S } from '../../shared/constants'
import {
  acceptedFraction,
  answerTargets,
  groupFreeAnswers,
  matchFreeAnswer,
  publicFreeAnswerGroups,
} from '../../shared/freeAnswers'
import { hasValidationPhase, isUntimedPhase, nextPhase, nextQuestionCountdown } from '../../shared/gameFlow'
import { hostReturnUpdate, isPhaseStale } from '../../shared/hostAbsence'
import {
  buildReveal,
  gradeAnswer,
  hostControls,
  nextDeadline,
  pauseUpdate,
  resumeUpdate,
  toPublicQuestion,
  transitionUpdate,
  validateUpdate,
  type SessionUpdate,
} from '../../shared/hostEngine'
import { estimateGameMinutes } from '../../shared/quizCatalog'
import { parseQuestion } from '../../shared/quizValidation'
import type { Answer, Question, Session, SessionSettings } from '../../shared/types'
import { HOST, makeQuestion, makeSession, OTHER, PLAYER } from './engineFixtures'

const NOW = 2_000_000
const FREE_MS = QUESTION_DURATION_S.free * 1000
const FREE: SessionSettings = { answerMode: 'free', speedBonus: true, control: false, teams: false }
const CONTROL: SessionSettings = { ...FREE, control: true }

const CAPITAL = makeQuestion(0, { text: 'Capitale de l’Australie ?', acceptedAnswers: ['Canberra'] })

const MUSIC = { source: 'deezer' as const, id: '7677778', title: "(I Can't Get No) Satisfaction", artist: 'The Rolling Stones' }

function blindTest(ask: Question['ask'], musicExtra: Partial<Question['music']> = {}): Question {
  return makeQuestion(0, {
    text: 'Quel est ce morceau ?',
    acceptedAnswers: ["(I Can't Get No) Satisfaction"],
    music: { ...MUSIC, ...musicExtra },
    ask,
  })
}

function answer(value: string, submittedAt = NOW - FREE_MS / 2, extra: Partial<Answer> = {}): Answer {
  return { value, submittedAt, ...extra }
}

// Applique un update multi-chemins (chemins imbriqués compris), comme Firebase.
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

// Question en cours (index 0 sur 2), chrono de 30 s se terminant à NOW, réponses données.
function questionSession(settings: SessionSettings, answers: Record<string, Answer>, overrides: Partial<Session> = {}): Session {
  return makeSession({
    status: 'question',
    settings,
    currentIndex: 0,
    questionCount: 2,
    phaseStartedAt: NOW - FREE_MS,
    phaseEndsAt: NOW,
    answers: { 0: answers },
    ...overrides,
  })
}

function advance(session: Session, questions: Question[], nowServer = NOW + 2_000): Session {
  const expected = { status: session.status, currentIndex: session.currentIndex }
  return apply(session, transitionUpdate(session, questions, expected, nowServer))
}

describe('Correction automatique : niveaux', () => {
  test('identique après normalisation : exact', () => {
    expect(matchAnswer('  canberra ! ', ['Canberra'])).toBe('exact')
    expect(matchAnswer('Beatles', ['The Beatles'])).toBe('exact')
    expect(matchAnswer('Simon and Garfunkel', ['Simon & Garfunkel'])).toBe('exact')
    expect(matchAnswer('Simon et Garfunkel', ['Simon & Garfunkel'])).toBe('exact')
  })

  test('« The » seul est gardé ; un mot qui commence par « the » n’est pas coupé', () => {
    expect(normalizeAnswer('The')).toBe('the')
    expect(normalizeAnswer('Theodore')).toBe('theodore')
  })

  test('une faute dès 5 lettres, deux dès 10 lettres : typo (acceptée)', () => {
    expect(matchAnswer('Canbera', ['Canberra'])).toBe('typo')
    expect(matchAnswer('Mitterand', ['Mitterrand'])).toBe('typo')
    expect(matchAnswer('Shakespere', ['Shakespeare'])).toBe('typo')
    expect(matchAnswer('Shakspere', ['Shakespeare'])).toBe('typo')
    expect(isAnswerCorrect('Shakspere', ['Shakespeare'])).toBe(true)
  })

  test('moins de 5 lettres : aucune faute tolérée', () => {
    expect(matchAnswer('Lion', ['Lyon'])).toBe('close')
    expect(isAnswerCorrect('Lion', ['Lyon'])).toBe(false)
  })

  test('une faute de plus que permis, ou une réponse contenue dans l’autre : close (refusée)', () => {
    expect(matchAnswer('Canbeira', ['Canberra'])).toBe('typo')
    expect(matchAnswer('Canbeiro', ['Canberra'])).toBe('close')
    expect(matchAnswer('Hallyday', ['Johnny Hallyday'])).toBe('close')
    expect(matchAnswer('La vie en rose de Piaf', ['La Vie en rose'])).toBe('close')
    expect(isAnswerCorrect('Hallyday', ['Johnny Hallyday'])).toBe(false)
  })

  test('sans rapport, vide, ou contenu trop court : wrong', () => {
    expect(matchAnswer('Sydney', ['Canberra'])).toBe('wrong')
    expect(matchAnswer('   ', ['Canberra'])).toBe('wrong')
    expect(matchAnswer('la', ['La Vie en rose'])).toBe('wrong')
  })

  test('le meilleur niveau parmi les réponses acceptées', () => {
    expect(matchAnswer('Napoleon', ['Napoléon Ier', 'Napoléon'])).toBe('exact')
  })
})

describe('Blind test en Réponse libre : ask et alias', () => {
  test('titre : le titre, sans sa parenthèse, et les alias', () => {
    const question = blindTest('title', { titleAliases: ['Satisfaction des Stones'] })
    expect(matchFreeAnswer(question, answer('Satisfaction')).main).toBe('exact')
    expect(matchFreeAnswer(question, answer("I can't get no satisfaction")).main).toBe('exact')
    expect(matchFreeAnswer(question, answer('satisfaction des stones')).main).toBe('exact')
  })

  test('artiste : l’artiste (sans « The ») et les alias', () => {
    const question = blindTest('artist', { artistAliases: ['Stones'] })
    expect(matchFreeAnswer(question, answer('Rolling Stones')).main).toBe('exact')
    expect(matchFreeAnswer(question, answer('stones')).main).toBe('exact')
  })

  test('both : deux parties, titre dans value et artiste dans artist', () => {
    const question = blindTest('both')
    expect(answerTargets(question).artist).toBeDefined()
    const match = matchFreeAnswer(question, answer('Satisfaction', NOW, { artist: 'Rolling Stones' }))
    expect(match).toEqual({ main: 'exact', artist: 'exact' })
  })

  test('both : 1, 0,5 ou 0 selon les parties justes', () => {
    const question = blindTest('both')
    const fraction = (value: string, artist?: string) => {
      const given = answer(value, NOW, artist === undefined ? {} : { artist })
      return acceptedFraction(matchFreeAnswer(question, given), given)
    }
    expect(fraction('Satisfaction', 'The Rolling Stones')).toBe(1)
    expect(fraction('Satisfaction', 'Beatles')).toBe(0.5)
    expect(fraction('', 'Rolling Stones')).toBe(0.5)
    expect(fraction('Paint it black')).toBe(0)
  })

  test('sans blind test, ask est ignoré : acceptedAnswers seulement', () => {
    expect(answerTargets(CAPITAL)).toEqual({ main: ['Canberra'] })
  })
})

describe('Points en Réponse libre (gradeAnswer)', () => {
  const free = { answerMode: 'free' as const, speedBonus: true }

  test('bonne réponse à mi-temps avec Rapidité : 150 points sur un chrono de 30 s', () => {
    expect(gradeAnswer(CAPITAL, answer('canberra'), free, NOW)).toEqual({ correct: true, points: 150, fullPoints: 150 })
  })

  test('faute de frappe acceptée ; réponse proche refusée, avec ses points possibles', () => {
    expect(gradeAnswer(CAPITAL, answer('Canbera'), free, NOW)).toMatchObject({ correct: true, points: 150 })
    expect(gradeAnswer(CAPITAL, answer('Canbeiro'), free, NOW)).toEqual({ correct: false, points: 0, fullPoints: 150 })
  })

  test('both à moitié juste : la moitié des points, Rapidité comprise, et partial', () => {
    const graded = gradeAnswer(blindTest('both'), answer('Satisfaction', NOW - FREE_MS / 2, { artist: 'Queen' }), free, NOW)
    expect(graded).toEqual({ correct: false, partial: true, points: 75, fullPoints: 150 })
  })
})

describe('Groupes de réponses et affichage sur la TV', () => {
  test('réponses identiques après normalisation regroupées, les plus nombreuses d’abord', () => {
    const answers = { [HOST]: answer('Sydney'), [PLAYER]: answer('canberra'), [OTHER]: answer('  Canberra !') }
    const groups = groupFreeAnswers(CAPITAL, answers, [HOST, PLAYER, OTHER])
    expect(groups.map((group) => [group.key, group.playerIds.length])).toEqual([
      ['canberra', 2],
      ['sydney', 1],
    ])
    expect(groups[0].text).toBe('canberra')
    expect(groups[0].match.main).toBe('exact')
  })

  test('both : groupe par titre et artiste, texte « titre – artiste »', () => {
    const answers = { [PLAYER]: answer('Satisfaction', NOW, { artist: 'Stones' }), [OTHER]: answer('Satisfaction') }
    const groups = groupFreeAnswers(blindTest('both'), answers, [PLAYER, OTHER])
    expect(groups.map((group) => group.text).sort()).toEqual(['Satisfaction', 'Satisfaction – Stones'])
  })

  test('un joueur qui n’est plus dans la partie est ignoré', () => {
    expect(groupFreeAnswers(CAPITAL, { gone: answer('Canberra') }, [PLAYER])).toEqual([])
  })

  test('publication : mot interdit filtré, groupe masqué par l’hôte, verdict des résultats', () => {
    const answers = { [HOST]: answer('Merde alors'), [PLAYER]: answer('Canberra'), [OTHER]: answer('Perth') }
    const groups = groupFreeAnswers(CAPITAL, answers, [HOST, PLAYER, OTHER])
    const results = { [PLAYER]: { correct: true, points: 150 }, [OTHER]: { correct: false, points: 0 }, [HOST]: { correct: false, points: 0 } }
    const published = publicFreeAnswerGroups(groups, results, { perth: true })
    expect(published).toEqual([
      { value: 'Canberra', playerIds: [PLAYER], verdict: 'correct' },
      { value: HIDDEN_ANSWER_TEXT, playerIds: [HOST], verdict: 'wrong' },
      { value: HIDDEN_ANSWER_TEXT, playerIds: [OTHER], verdict: 'wrong' },
    ])
  })

  test(`au plus ${FREE_ANSWER_GROUPS_MAX} groupes`, () => {
    const ids = Array.from({ length: 12 }, (_, index) => `p${index}`)
    const answers = Object.fromEntries(ids.map((id, index) => [id, answer(`Ville ${index}`)]))
    expect(publicFreeAnswerGroups(groupFreeAnswers(CAPITAL, answers, ids), {})).toHaveLength(FREE_ANSWER_GROUPS_MAX)
  })

  test('filtre : mots entiers, accents et pluriels ; les mots qui en contiennent un passent', () => {
    expect(containsForbiddenWord('Enculé')).toBe(true)
    expect(containsForbiddenWord('des PUTES')).toBe(true)
    expect(containsForbiddenWord('Constitution')).toBe(false)
    expect(containsForbiddenWord('Scunthorpe')).toBe(false)
    expect(displayableAnswer('Canberra')).toBe('Canberra')
  })
})

describe('Phase VALIDATION (Contrôle)', () => {
  const questions = [CAPITAL, makeQuestion(1, { acceptedAnswers: ['Paris'] })]

  test('seulement en Réponse libre avec Contrôle', () => {
    expect(hasValidationPhase(CONTROL)).toBe(true)
    expect(hasValidationPhase(FREE)).toBe(false)
    expect(hasValidationPhase({ answerMode: 'choice', control: true })).toBe(false)
  })

  test('déroulé : QUESTION → VALIDATION sans durée → REVEAL de 6 s', () => {
    const context = { answerMode: 'free' as const, currentIndex: 0, questionCount: 2, validation: true }
    expect(nextPhase('question', context)).toEqual({ status: 'validation', currentIndex: 0, durationS: null })
    expect(nextPhase('validation', context)).toEqual({ status: 'reveal', currentIndex: 0, durationS: REVEAL_DURATION_S.free })
    expect(nextPhase('question', { ...context, validation: false })?.status).toBe('reveal')
  })

  test('fin de la question : correction automatique et fullPoints écrits, sans révélation', () => {
    const session = questionSession(CONTROL, { [PLAYER]: answer('Canbeiro'), [OTHER]: answer('canberra') })
    const update = transitionUpdate(session, questions, { status: 'question', currentIndex: 0 }, NOW + 2_000)
    expect(update).toMatchObject({
      status: 'validation',
      phaseEndsAt: 0,
      [`answers/0/${PLAYER}/correct`]: false,
      [`answers/0/${PLAYER}/points`]: 0,
      [`answers/0/${PLAYER}/fullPoints`]: 150,
      [`answers/0/${OTHER}/correct`]: true,
    })
    expect(update).not.toHaveProperty('reveal')
  })

  test('aucune échéance pendant la validation ; joueurs et TV ne la voient jamais comme bloquée', () => {
    const validation = advance(questionSession(CONTROL, {}), questions)
    expect(validation.status).toBe('validation')
    expect(nextDeadline(validation)).toBeNull()
    expect(isUntimedPhase(validation)).toBe(true)
    expect(isPhaseStale(validation, NOW + 3_600_000)).toBe(false)
    expect(nextQuestionCountdown(validation)).toBeNull()
  })

  test('« Valider » : l’hôte accepte une réponse proche ; Rapidité calculée sur la fin de la question', () => {
    const validation = advance(questionSession(CONTROL, { [PLAYER]: answer('Canbeiro') }), questions)
    // Validation très longue : le bonus ne dépend que de la fin de la question.
    const reveal = apply(validation, validateUpdate(validation, questions, { main: { canbeiro: true } }, NOW + 600_000))
    expect(reveal.status).toBe('reveal')
    expect(reveal.reveal?.results?.[PLAYER]).toEqual({ correct: true, points: 150 })
    expect(reveal.players[PLAYER].score).toBe(150)
    expect(reveal.answers?.[0]?.[PLAYER]).toMatchObject({ correct: true, points: 150 })
  })

  test('« Valider » : l’hôte refuse une faute de frappe et masque un groupe', () => {
    const validation = advance(questionSession(CONTROL, { [PLAYER]: answer('Canbera'), [OTHER]: answer('Kangourou') }), questions)
    const decisions = { main: { canbera: false }, hidden: { kangourou: true } }
    const reveal = apply(validation, validateUpdate(validation, questions, decisions, NOW + 30_000))
    expect(reveal.reveal?.results?.[PLAYER]).toEqual({ correct: false, points: 0 })
    expect(reveal.reveal?.stats.freeAnswers?.map((group) => group.value)).toEqual(['Canbera', HIDDEN_ANSWER_TEXT])
  })

  test('« Passer » pendant la validation : décisions automatiques', () => {
    const validation = advance(questionSession(CONTROL, { [PLAYER]: answer('Canbera') }), questions)
    expect(hostControls(validation)).toMatchObject({ skip: 'reveal', canValidate: true, canPause: true })
    const reveal = advance(validation, questions)
    expect(reveal.reveal?.results?.[PLAYER]).toMatchObject({ correct: true })
  })

  test('validateUpdate refusé hors de la validation', () => {
    expect(validateUpdate(questionSession(CONTROL, {}), questions, {}, NOW)).toBeNull()
  })

  test('« Passer » pendant la question mène à la validation (Contrôle) ou à la révélation', () => {
    expect(hostControls(questionSession(CONTROL, {})).skip).toBe('validation')
    expect(hostControls(questionSession(FREE, {})).skip).toBe('reveal')
  })

  test('tout le monde a répondu : fin anticipée de la question, puis validation', () => {
    const answers = { [HOST]: answer('a', NOW - 9_000), [PLAYER]: answer('b', NOW - 8_000), [OTHER]: answer('c', NOW - 7_000) }
    const session = questionSession(CONTROL, answers)
    expect(nextDeadline(session)).toBe(NOW - 7_000 + 2_000)
    expect(advance(session, questions, NOW - 5_000).status).toBe('validation')
  })

  test('pause puis reprise : retour en validation, toujours sans échéance', () => {
    const validation = advance(questionSession(CONTROL, {}), questions)
    const paused = apply(validation, pauseUpdate(validation, NOW + 10_000))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'validation' })
    const resumed = apply(paused, resumeUpdate(paused, NOW + 60_000))
    expect(resumed).toMatchObject({ status: 'validation', phaseEndsAt: 0 })
  })

  test('retour de l’hôte absent pendant la validation : pause, reprise sans échéance', () => {
    const validation = advance(questionSession(CONTROL, {}), questions)
    const away = { ...validation, hostLeftAt: NOW + 5_000 }
    const paused = apply(away, hostReturnUpdate(away))
    expect(paused).toMatchObject({ status: 'paused', pausedFrom: 'validation', remainingMs: 0 })
    expect(apply(paused, resumeUpdate(paused, NOW + 90_000))).toMatchObject({ status: 'validation', phaseEndsAt: 0 })
  })

  test('Pas à pas : la révélation qui suit la validation attend l’hôte', () => {
    const validation = advance(questionSession({ ...CONTROL, stepByStep: true }, {}), questions)
    const reveal = apply(validation, validateUpdate(validation, questions, {}, NOW + 20_000))
    expect(reveal).toMatchObject({ status: 'reveal', phaseEndsAt: 0 })
    expect(hostControls(reveal).awaitingNext).toBe('ranking')
  })

  test('Suspense : validation, révélation, puis question suivante directement', () => {
    const validation = advance(questionSession({ ...CONTROL, suspense: true }, {}), questions)
    const reveal = apply(validation, validateUpdate(validation, questions, {}, NOW + 20_000))
    expect(advance(reveal, questions, reveal.phaseEndsAt + 100)).toMatchObject({ status: 'question', currentIndex: 1 })
  })

  test('sans Contrôle : la correction automatique décide seule, révélation directe', () => {
    const reveal = advance(questionSession(FREE, { [PLAYER]: answer('Canbera'), [OTHER]: answer('Hallyday') }), questions)
    expect(reveal.status).toBe('reveal')
    expect(reveal.reveal?.results).toEqual({
      [PLAYER]: { correct: true, points: 150 },
      [OTHER]: { correct: false, points: 0 },
    })
  })

  test('révélation en Réponse libre : groupes de réponses, jamais de choiceCounts', () => {
    const session = questionSession(FREE, { [PLAYER]: answer('Canberra'), [OTHER]: answer('canberra') })
    const { reveal } = buildReveal(CAPITAL, session)
    expect(reveal.stats).toEqual({ freeAnswers: [{ value: 'Canberra', playerIds: [PLAYER, OTHER], verdict: 'correct' }] })
  })

  test('blind test both : résultat partiel publié dans results', () => {
    const question = blindTest('both')
    const session = questionSession(FREE, { [PLAYER]: answer('Satisfaction', NOW - FREE_MS / 2, { artist: 'Queen' }) })
    expect(buildReveal(question, session).results[PLAYER]).toEqual({ correct: false, partial: true, points: 75 })
  })
})

describe('Question publiée, durée et lecture des données', () => {
  test('Réponse libre : ni propositions ni bonne réponse ; ask publié pour un blind test', () => {
    const published = toPublicQuestion(blindTest('both'), 'free', 'https://cdn.example/extrait.mp3')
    expect(published).toMatchObject({ ask: 'both', timeLimit: 30, audio: { startS: 0, durationS: 30 } })
    expect(published).not.toHaveProperty('options')
    expect(JSON.stringify(published)).not.toContain('Satisfaction')
    expect(toPublicQuestion(CAPITAL, 'free')).not.toHaveProperty('ask')
  })

  test('Choix multiples : ask n’est pas publié', () => {
    expect(toPublicQuestion(blindTest('title'), 'choice')).not.toHaveProperty('ask')
  })

  test('durée estimée : validation comptée avec Contrôle', () => {
    expect(estimateGameMinutes(10, { ...FREE })).toBe(7)
    expect(estimateGameMinutes(10, { ...CONTROL })).toBe(10)
  })

  test('lecture de questions/ : ask et alias d’un blind test, ask refusé ailleurs', () => {
    const raw = { ...blindTest('both', { titleAliases: ['Satisfaction'], artistAliases: ['Stones'] }) }
    expect(parseQuestion(raw)).toMatchObject({ ask: 'both', music: { titleAliases: ['Satisfaction'], artistAliases: ['Stones'] } })
    expect(parseQuestion({ ...raw, ask: 'album' })).toBeNull()
    expect(parseQuestion({ ...CAPITAL, ask: 'title' })).toBeNull()
    expect(parseQuestion({ ...raw, music: { ...raw.music, titleAliases: [''] } })).toBeNull()
  })
})
