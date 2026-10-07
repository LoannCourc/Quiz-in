import { describe, expect, test } from 'vitest'

import { DRAW_GUESS_MAX_POINTS, DRAW_GUESS_MIN_POINTS } from '../../shared/constants'
import { drawGameQuestions } from '../../shared/drawGame'
import { drawAllFoundAt, drawFoundProgress, drawGuessers, drawHintsUpdate, drawResults, drawWordChangeUpdate, judgeDrawGuess } from '../../shared/drawGuess'
import { drawCancelUpdate, hostControls, nextDeadline, transitionUpdate, type SessionUpdate } from '../../shared/hostEngine'
import { soundCues } from '../../shared/sound'
import type { Player, PlayerId, Session, SessionSettings } from '../../shared/types'
import { HOST, makeSession, OTHER, player, PLAYER } from './engineFixtures'

const START = 1_000_000
const END = START + 75_000
const NOW_SOUND = 9_000_000
const DRAW: SessionSettings = { answerMode: 'draw', speedBonus: false, control: false, teams: false }
const questions = drawGameQuestions('K7PX')

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

// Manche en cours : Léa dessine « chat » ; l'hôte, Tom et Zoé devinent.
function round(overrides: Partial<Session> = {}, players: Record<PlayerId, Player> = {}): Session {
  return makeSession({
    status: 'question',
    settings: DRAW,
    currentIndex: 0,
    questionCount: 2,
    phaseStartedAt: START,
    phaseEndsAt: END,
    players: { [HOST]: player('Hôte'), [PLAYER]: player('Léa'), [OTHER]: player('Tom'), zoe: player('Zoé'), ...players },
    drawOrder: [PLAYER, OTHER],
    drawTurn: { drawer: PLAYER, round: 0, wordLength: 4, category: 'Animal' },
    drawSecret: { word: 'chat', category: 'Animal' },
    currentQuestion: { text: 'Animal', difficulty: 1, timeLimit: 75 },
    ...overrides,
  })
}

const reveal = (session: Session) => apply(session, transitionUpdate(session, questions, { status: 'question', currentIndex: 0 }, END + 2_000))

describe('Dessine-moi : jugement d’un mot', () => {
  test('sans casse, sans accents, sans article, sans pluriel', () => {
    expect(judgeDrawGuess('CHAT', 'chat')).toBe('found')
    expect(judgeDrawGuess('le chat', 'chat')).toBe('found')
    expect(judgeDrawGuess('fusee', 'fusée')).toBe('found')
    expect(judgeDrawGuess('girafes', 'girafe')).toBe('found')
    expect(judgeDrawGuess('gâteaux', 'gâteau')).toBe('found')
  })

  test('une faute tolérée dès 5 lettres ; jamais en dessous', () => {
    expect(judgeDrawGuess('giraffe', 'girafe')).toBe('found')
    expect(judgeDrawGuess('girfae', 'girafe')).toBe('found')
    expect(judgeDrawGuess('chot', 'chat')).toBe('close')
  })

  test('« proche » : deux fautes, ou le début du mot ; sinon « pas ça »', () => {
    expect(judgeDrawGuess('parapluje', 'parapluie')).toBe('found')
    expect(judgeDrawGuess('paraplouje', 'parapluie')).toBe('close')
    expect(judgeDrawGuess('para', 'parapluie')).toBe('close')
    expect(judgeDrawGuess('chien', 'chat')).toBe('wrong')
    expect(judgeDrawGuess('', 'chat')).toBe('wrong')
  })
})

describe('Dessine-moi : devineurs et verdicts de l’hôte', () => {
  test('devineurs : connectés, sans le dessinateur ; en Groupe, son équipe seulement', () => {
    expect(drawGuessers(round()).sort()).toEqual([HOST, OTHER, 'zoe'].sort())
    const teams = round({ settings: { ...DRAW, teams: true, teamCount: 2 } }, {
      [PLAYER]: player('Léa', { team: 'pink' }),
      [OTHER]: player('Tom', { team: 'pink' }),
      zoe: player('Zoé', { team: 'cyan' }),
      [HOST]: player('Hôte', { team: 'cyan' }),
    })
    expect(drawGuessers(teams)).toEqual([OTHER])
    expect(drawGuessers(round({}, { zoe: player('Zoé', { connected: false }) }))).not.toContain('zoe')
  })

  test('chaque nouvel essai est jugé une fois : verdict pour le joueur, « trouvé » à l’heure de l’essai', () => {
    let session = round({ drawGuess: { [OTHER]: { text: 'chien', count: 1, at: START + 5_000 }, zoe: { text: 'chat', count: 1, at: START + 9_000 } } })
    session = apply(session, drawHintsUpdate(session))
    expect(session.drawHint).toEqual({ [OTHER]: { count: 1, verdict: 'wrong' }, zoe: { count: 1, verdict: 'found' } })
    expect(session.drawFound).toEqual({ zoe: START + 9_000 })
    expect(drawHintsUpdate(session)).toBeNull()
    session = { ...session, drawGuess: { ...session.drawGuess, [OTHER]: { text: 'chot', count: 2, at: START + 7_000 } } }
    expect(drawHintsUpdate(session)).toEqual({ [`drawHint/${OTHER}`]: { count: 2, verdict: 'close' } })
  })

  test('le dessinateur n’est jamais jugé', () => {
    expect(drawHintsUpdate(round({ drawGuess: { [PLAYER]: { text: 'chat', count: 1, at: START + 1_000 } } }))).toBeNull()
  })
})

describe('Dessine-moi : points, fin de manche, annulation', () => {
  test('devineur : 1 000 tout de suite, 400 à la fin ; dessinateur : 1 000 × part des devineurs qui ont trouvé', () => {
    const results = drawResults(round({ drawFound: { [OTHER]: START, zoe: END } }))
    expect(results[OTHER]).toEqual({ correct: true, points: DRAW_GUESS_MAX_POINTS })
    expect(results.zoe).toEqual({ correct: true, points: DRAW_GUESS_MIN_POINTS })
    // 2 devineurs sur 3 (l'hôte n'a pas trouvé).
    expect(results[PLAYER]).toEqual({ correct: true, points: 667 })
    expect(results[HOST]).toBeUndefined()
  })

  test('personne n’a trouvé : 0 pour le dessinateur', () => {
    expect(drawResults(round())[PLAYER]).toEqual({ correct: false, points: 0 })
  })

  test('fin anticipée 2 s après que tous les devineurs connectés ont trouvé', () => {
    expect(drawAllFoundAt(round({ drawFound: { [OTHER]: START + 10_000, zoe: START + 12_000 } }))).toBeNull()
    const all = round({ drawFound: { [OTHER]: START + 10_000, zoe: START + 12_000, [HOST]: START + 20_000 } })
    expect(drawAllFoundAt(all)).toBe(START + 22_000)
    expect(nextDeadline(all)).toBe(START + 22_000)
  })

  test('réponse : points dans drawPoints, scores et rangs, série inchangée', () => {
    const after = reveal(round({ drawFound: { [OTHER]: START } }, { [OTHER]: player('Tom', { streak: 4 }) }))
    expect(after.drawPoints?.[0]).toEqual({ [OTHER]: 1_000, [PLAYER]: 333 })
    expect(after.players[OTHER]).toMatchObject({ score: 1_000, rank: 1, streak: 4 })
    expect(after.reveal?.correctAnswer).toBe('chat')
  })

  test('dessinateur parti à la fin de la manche : annulée, aucun point', () => {
    const after = reveal(round({ drawFound: { [OTHER]: START } }, { [PLAYER]: player('Léa', { connected: false }) }))
    expect(after.reveal).toMatchObject({ stats: { drawCancelled: true }, results: {} })
    expect(after.drawPoints).toBeUndefined()
    expect(after.players[OTHER].score).toBe(0)
  })

  test('l’hôte annule la manche : réponse tout de suite, aucun point même pour qui avait trouvé', () => {
    const session = round({ drawFound: { [OTHER]: START } })
    expect(hostControls(session).canCancelDraw).toBe(true)
    const after = apply(session, drawCancelUpdate(session, questions, START + 30_000))
    expect(after.status).toBe('reveal')
    expect(after.reveal?.stats).toEqual({ drawCancelled: true })
    expect(after.drawPoints).toBeUndefined()
    expect(after.players[OTHER].score).toBe(0)
  })
})

describe('Dessine-moi : changement de mot', () => {
  test('une fois : nouveau mot hors de la partie, catégorie et nombre de lettres mis à jour', () => {
    const session = round({ drawWordChange: true, drawSecret: { word: questions[0].word, category: questions[0].category } })
    const changed = apply(session, drawWordChangeUpdate(session, questions))
    expect(changed.drawWordChange).toBeUndefined()
    expect(questions.map((question) => question.word)).not.toContain(changed.drawSecret?.word)
    expect(changed.drawTurn).toMatchObject({ changedWord: true, category: changed.drawSecret?.category })
    expect(changed.currentQuestion?.text).toBe(changed.drawSecret?.category)
    expect(drawWordChangeUpdate({ ...changed, drawWordChange: true }, questions)).toBeNull()
  })

  test('la réponse donne le mot du dessinateur (après changement)', () => {
    expect(reveal(round({ drawSecret: { word: 'fusée', category: 'Transport' } })).reveal?.correctAnswer).toBe('fusée')
  })
})

describe('Dessine-moi : TV (qui a trouvé) et sons', () => {
  test('progression : devineurs, trouvés dans l’ordre, le dernier en bandeau ; un absent qui avait trouvé reste compté', () => {
    const session = round({ drawFound: { zoe: START + 9_000, [OTHER]: START + 4_000 } }, { zoe: player('Zoé', { connected: false }) })
    const progress = drawFoundProgress(session)
    expect(progress.found).toEqual([OTHER, 'zoe'])
    expect(progress.latest).toBe('zoe')
    expect([...progress.guessers].sort()).toEqual([HOST, OTHER, 'zoe'].sort())
    expect(drawFoundProgress(round()).latest).toBeNull()
  })

  test('un joueur trouve : « pop » ; le dernier devineur : « tous » ; jamais pour un essai faux', () => {
    const before = round({ phaseStartedAt: NOW_SOUND - 500, phaseEndsAt: NOW_SOUND + 60_000 })
    const one = { ...before, drawFound: { [OTHER]: NOW_SOUND } }
    expect(soundCues(before, one, NOW_SOUND)).toEqual(['answerPop'])
    const all = { ...one, drawFound: { ...one.drawFound, zoe: NOW_SOUND, [HOST]: NOW_SOUND } }
    expect(soundCues(one, all, NOW_SOUND)).toEqual(['allAnswered'])
    expect(soundCues(before, { ...before, drawHint: { [OTHER]: { count: 1, verdict: 'wrong' } } }, NOW_SOUND)).toEqual([])
  })

  test('réponse : fanfare si quelqu’un a trouvé, « raté » sinon ou si la manche est annulée', () => {
    const question = round({ phaseStartedAt: NOW_SOUND - 60_000, phaseEndsAt: NOW_SOUND })
    const revealed = (reveal: Session['reveal']) => ({ ...question, status: 'reveal' as const, phaseStartedAt: NOW_SOUND - 100, reveal })
    expect(soundCues(question, revealed({ correctAnswer: 'chat', stats: {}, results: { [OTHER]: { correct: true, points: 900 } } }), NOW_SOUND)).toEqual(['fanfare'])
    expect(soundCues(question, revealed({ correctAnswer: 'chat', stats: {}, results: {} }), NOW_SOUND)).toEqual(['miss'])
    expect(soundCues(question, revealed({ correctAnswer: 'chat', stats: { drawCancelled: true }, results: {} }), NOW_SOUND)).toEqual(['miss'])
  })
})

describe('Dessine-moi : changement de mot au hasard', () => {
  test('jamais un mot de la partie ; deux manches, deux remplaçants différents ; même niveau si possible', () => {
    const replacement = (index: number) => {
      const session = round({ drawWordChange: true, drawTurn: { drawer: PLAYER, round: index, wordLength: 4, category: 'Animal' } })
      return (drawWordChangeUpdate(session, questions) as Record<string, { word: string }>).drawSecret.word
    }
    const words = [0, 1, 2, 3].map(replacement)
    expect(new Set(words).size).toBe(4)
    for (const word of words) expect(questions.map((question) => question.word)).not.toContain(word)
  })
})
