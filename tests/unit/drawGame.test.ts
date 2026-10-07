import { describe, expect, test } from 'vitest'

import { isKnownAnswerMode } from '../../shared/constants'
import { DRAW_QUIZ_SUMMARY, DRAW_ROUNDS_DEFAULT, drawEligiblePlayers, drawGameQuestions, drawOrderFor, wordLetterCount } from '../../shared/drawGame'
import { isDrawGuesser } from '../../shared/drawGuess'
import { hasRankingStep, nextPhase } from '../../shared/gameFlow'
import { launchUpdate, replayUpdate, toPublicQuestion, transitionUpdate, type SessionUpdate } from '../../shared/hostEngine'
import { settingsForGameType } from '../../shared/quizCatalog'
import type { Player, PlayerId, Session, SessionSettings } from '../../shared/types'
import { HOST, makeSession, OTHER, player, PLAYER } from './engineFixtures'

const NOW = 5_000_000
const DRAW: SessionSettings = { answerMode: 'draw', speedBonus: false, control: false, teams: false }

function apply(session: Session, update: SessionUpdate | null): Session {
  expect(update).not.toBeNull()
  const next = structuredClone(session) as unknown as Record<string, unknown>
  for (const [path, value] of Object.entries(update as SessionUpdate)) {
    const keys = path.split('/')
    let node = next
    for (const key of keys.slice(0, -1)) {
      node[key] = (node[key] as Record<string, unknown> | undefined) ?? {}
      node = node[key] as Record<string, unknown>
    }
    if (value === null) delete node[keys[keys.length - 1]]
    else node[keys[keys.length - 1]] = value
  }
  return next as unknown as Session
}

function players(count: number): Record<PlayerId, Player> {
  const result: Record<PlayerId, Player> = { [HOST]: player('Hôte'), [PLAYER]: player('Léa'), [OTHER]: player('Tom') }
  for (let index = 0; index < count - 3; index++) result[`p${index}`] = player(`Joueur ${index}`)
  return result
}

const questions = drawGameQuestions('K7PX')

const countBy = (values: readonly string[]) => values.reduce<Record<string, number>>((counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }), {})

function launched(playerCount = 3): Session {
  const lobby = makeSession({ settings: DRAW, players: players(playerCount), quizId: 'dessine-moi' })
  const launch = launchUpdate(lobby, questions, NOW, undefined, undefined, () => 0.42)
  expect(launch.ok).toBe(true)
  return apply(lobby, launch.ok ? launch.update : null)
}

const advance = (session: Session, at = NOW + 10_000) =>
  apply(session, transitionUpdate(session, questions, { status: session.status, currentIndex: session.currentIndex }, at))

describe('Dessine-moi : mots et dessinateurs', () => {
  test('mêmes mots pour un même code (relance de l’app de l’hôte), autres mots pour un autre code', () => {
    expect(drawGameQuestions('K7PX')).toEqual(questions)
    expect(drawGameQuestions('ABCD').map((question) => question.word)).not.toEqual(questions.map((question) => question.word))
    expect(new Set(questions.map((question) => question.word)).size).toBe(DRAW_ROUNDS_DEFAULT)
  })

  test('l’hôte ne dessine jamais (décision D1)', () => {
    expect(drawEligiblePlayers(players(3), HOST)).toEqual([OTHER, PLAYER].sort())
  })

  test('nombre de lettres : sans tirets ni espaces', () => {
    expect(wordLetterCount('arc-en-ciel')).toBe(9)
    expect(wordLetterCount('vélo')).toBe(4)
  })
})

describe('Dessine-moi : moteur (lot 2, manches sans points)', () => {
  test('lancement : toutes les manches dès 2 dessinateurs, rotation équitable, jamais l’hôte', () => {
    const few = launched(3)
    expect(few.questionCount).toBe(DRAW_ROUNDS_DEFAULT)
    const counts = countBy(few.drawOrder ?? [])
    expect(Object.keys(counts).sort()).toEqual([OTHER, PLAYER].sort())
    expect(Object.values(counts)).toEqual([4, 4])
    // À tour de rôle : jamais deux manches de suite pour le même joueur.
    for (let index = 1; index < (few.drawOrder ?? []).length; index++) expect(few.drawOrder?.[index]).not.toBe(few.drawOrder?.[index - 1])
    const many = launched(12)
    expect(many.drawOrder).toHaveLength(DRAW_ROUNDS_DEFAULT)
    expect(many.drawOrder).not.toContain(HOST)
    expect(new Set(many.drawOrder).size).toBe(DRAW_ROUNDS_DEFAULT)
  })

  test('rotation : écart d’une manche au plus entre deux joueurs (3 dessinateurs, 8 manches)', () => {
    const order = drawOrderFor(players(4), HOST, 8, () => 0.3)
    const values = Object.values(countBy(order))
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1)
  })

  test('Groupe : les équipes dessinent à tour de rôle, autant de fois chacune', () => {
    const grouped: Record<PlayerId, Player> = {
      [HOST]: player('Hôte', { team: 'pink' }),
      a: player('A', { team: 'pink' }),
      b: player('B', { team: 'pink' }),
      c: player('C', { team: 'cyan' }),
      d: player('D', { team: 'cyan' }),
      e: player('E', { team: 'cyan' }),
    }
    const order = drawOrderFor(grouped, HOST, 8, () => 0.6, true)
    const teams = order.map((id) => grouped[id].team)
    expect(countBy(teams.map(String))).toEqual({ pink: 4, cyan: 4 })
    for (let index = 1; index < teams.length; index++) expect(teams[index]).not.toBe(teams[index - 1])
  })

  test('partie à deux : le seul dessinateur possible dessine toutes les manches', () => {
    const lobby = makeSession({ settings: DRAW, players: { [HOST]: player('Hôte'), [PLAYER]: player('Tablette') } })
    const solo = launchUpdate(lobby, questions, NOW)
    expect(solo.ok && solo.update.questionCount).toBe(DRAW_ROUNDS_DEFAULT)
    expect(solo.ok && solo.update.drawOrder).toEqual(Array(DRAW_ROUNDS_DEFAULT).fill(PLAYER))
  })

  test('hôte seul avec personne d’autre pour dessiner : lancement refusé', () => {
    const lobby = makeSession({ settings: DRAW, players: { [HOST]: player('Hôte'), [PLAYER]: player('Léa') } })
    const alone = { ...lobby, players: { [HOST]: player('Hôte') } }
    expect(launchUpdate(alone, questions, NOW).ok).toBe(false)
  })

  test('début de manche : dessinateur, mot pour lui seul, catégorie publiée, jamais le mot', () => {
    const session = advance(launched(3))
    const question = questions[0]
    expect(session.status).toBe('question')
    expect(session.drawTurn).toEqual({ drawer: session.drawOrder?.[0], round: 0, wordLength: wordLetterCount(question.word), category: question.category })
    expect(session.drawSecret).toEqual({ word: question.word, category: question.category })
    expect(session.currentQuestion).toEqual({ text: question.category, difficulty: question.difficulty, timeLimit: 75 })
    expect(JSON.stringify(session.currentQuestion)).not.toContain(question.word)
    expect(toPublicQuestion(question, 'draw').text).toBe(question.category)
  })

  test('réponse : le mot publié, le dessin gardé, personne n’a trouvé (0 point) ; classement, puis manche suivante', () => {
    const question = advance(launched(3))
    const withDrawing = { ...question, drawing: { 0: '0:s0,1,1:a,a' } }
    const reveal = advance(withDrawing, NOW + 100_000)
    expect(reveal.status).toBe('reveal')
    expect(reveal.reveal).toMatchObject({ correctAnswer: questions[0].word, stats: {} })
    expect(reveal.drawSecret).toBeUndefined()
    expect(reveal.drawing).toEqual({ 0: '0:s0,1,1:a,a' })
    expect(reveal.players[PLAYER].score).toBe(0)
    expect(hasRankingStep(reveal)).toBe(true)
    const scores = advance(reveal, NOW + 150_000)
    expect(scores.status).toBe('scores')
    const next = advance(scores, NOW + 200_000)
    expect(next.status).toBe('question')
    expect(next.currentIndex).toBe(1)
    expect(next.drawTurn?.drawer).toBe(next.drawOrder?.[1])
    // Dessin de la manche précédente effacé.
    expect(next.drawing).toBeUndefined()
  })

  test('dernière manche : la révélation mène à la fin', () => {
    expect(nextPhase('reveal', { answerMode: 'draw', currentIndex: 1, questionCount: 2 })).toEqual({ status: 'ended', currentIndex: 1, durationS: null })
  })

  test('Rejouer : tout ce qui concerne le dessin est effacé', () => {
    const ended = { ...advance(launched(3)), status: 'ended' as const }
    const replayed = apply(ended, replayUpdate(ended, NOW))
    expect(replayed.drawOrder).toBeUndefined()
    expect(replayed.drawTurn).toBeUndefined()
    expect(replayed.drawSecret).toBeUndefined()
  })
})

describe('Dessine-moi : chemin de création (hôte + un seul joueur)', () => {
  test('fiche Dessine-moi : mode draw imposé, quels que soient les réglages choisis', () => {
    expect(DRAW_QUIZ_SUMMARY.gameType).toBe('draw')
    const chosen: SessionSettings = { answerMode: 'free', speedBonus: true, control: true, teams: false }
    expect(settingsForGameType(chosen, DRAW_QUIZ_SUMMARY.gameType)).toMatchObject({ answerMode: 'draw', speedBonus: false, control: false })
  })

  test('hôte qui joue + une tablette : toutes les manches, la tablette dessine, l’hôte devine', () => {
    const lobby = makeSession({ settings: DRAW, players: { [HOST]: player('Hôte'), [PLAYER]: player('Tablette') }, quizId: 'dessine-moi' })
    const launch = launchUpdate(lobby, questions, NOW)
    expect(launch.ok).toBe(true)
    const round = advance(apply(lobby, launch.ok ? launch.update : null))
    expect(round.questionCount).toBe(DRAW_ROUNDS_DEFAULT)
    expect(round.settings.answerMode).toBe('draw')
    expect(round.drawTurn?.drawer).toBe(PLAYER)
    expect(isDrawGuesser(round, HOST)).toBe(true)
    expect(isKnownAnswerMode(round.settings.answerMode)).toBe(true)
    expect(isKnownAnswerMode('mime')).toBe(false)
  })
})

describe('Dessine-moi : mots tirés au hasard (niveaux mélangés)', () => {
  test('8 manches : 4 faciles, 3 moyens, 1 difficile ; la première facile ; tous différents', () => {
    for (const code of ['K7PX', 'ABCD', 'MMMM', 'B9CX']) {
      const words = drawGameQuestions(code)
      const levels = words.map((question) => question.difficulty)
      expect([1, 2, 3].map((level) => levels.filter((value) => value === level).length)).toEqual([4, 3, 1])
      expect(levels[0]).toBe(1)
      expect(new Set(words.map((question) => question.word)).size).toBe(8)
    }
  })

  test('4 et 6 manches : pas de mot difficile', () => {
    expect(drawGameQuestions('K7PX', 4).map((question) => question.difficulty).sort()).toEqual([1, 1, 2, 2])
    expect(drawGameQuestions('K7PX', 6).some((question) => question.difficulty === 3)).toBe(false)
  })
})
