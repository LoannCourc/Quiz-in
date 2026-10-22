import { describe, expect, test, vi } from 'vitest'

import { transitionUpdate } from '../../shared/hostEngine'
import { createStatsRecorder, startStatsEvent, statsDay, statsModeOf, transitionStatsEvent, type StatsWrite } from '../../shared/stats'
import type { Answer, Reveal, Session } from '../../shared/types'
import { BLUFF_QUESTIONS, HOST, makeQuestion, makeSession, OTHER, player, PLAYER, QUESTIONS } from './engineFixtures'

// 22 octobre 2026, 23 h 30 UTC (déjà le 23 à Paris : la date suit l'UTC).
const NOW = Date.UTC(2026, 9, 22, 23, 30)
const BLIND_TEST = [makeQuestion(0, { music: { source: 'deezer', trackId: '1', title: 'Titre', artist: 'Artiste' } as never })]

const answer = (value: number): Answer => ({ value, answeredAt: NOW - 1000 }) as Answer

describe('Statistiques anonymes : chemins augmentés à chaque événement', () => {
  test('jeu compté : Quiz, Bluff, Dessine-moi ; jamais le blind test', () => {
    expect(statsModeOf(makeSession(), QUESTIONS)).toBe('quiz')
    expect(statsModeOf(makeSession({ settings: { answerMode: 'bluff', speedBonus: false, control: false, teams: false } }), BLUFF_QUESTIONS)).toBe('bluff')
    expect(statsModeOf(makeSession({ settings: { answerMode: 'draw', speedBonus: false, control: false, teams: false } }), [])).toBe('draw')
    expect(statsModeOf(makeSession(), BLIND_TEST)).toBeNull()
    expect(startStatsEvent(makeSession(), BLIND_TEST, NOW)).toBeNull()
    expect(transitionStatsEvent(makeSession({ status: 'question' }), { status: 'ended' }, BLIND_TEST, NOW)).toBeNull()
  })

  test('jour en UTC', () => {
    expect(statsDay(NOW)).toBe('2026-10-22')
  })

  test('lancement d’un quiz fixe : jeu, jour, joueurs connectés (hôte compris) ; quiz à part', () => {
    const session = makeSession({ players: { [HOST]: player('Hôte'), [PLAYER]: player('Léa'), [OTHER]: player('Tom', { connected: false }) } })
    expect(startStatsEvent(session, QUESTIONS, NOW)).toEqual({
      key: 'start',
      writes: [['modes/quiz/started', 'daily/2026-10-22/started', 'playerCounts/2'], ['quizzes/quiz-1/started']],
    })
  })

  test('lancement d’une partie tirée dans des thèmes ou d’un mélange : compteur de l’ensemble', () => {
    const themes = makeSession({ settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false, themes: ['Histoire'], questionCount: 20 } })
    expect(startStatsEvent(themes, QUESTIONS, NOW)?.writes[1]).toEqual(['pools/themes/started'])
    const mix = makeSession({ settings: { answerMode: 'bluff', speedBonus: false, control: false, teams: false, quizIds: ['bluff-a', 'bluff-b'] } })
    expect(startStatsEvent(mix, BLUFF_QUESTIONS, NOW)?.writes[1]).toEqual(['pools/mix/started'])
  })

  test('Dessine-moi : ni quiz ni question du catalogue', () => {
    const draw = makeSession({ quizId: 'dessine-moi', settings: { answerMode: 'draw', speedBonus: false, control: false, teams: false } })
    expect(startStatsEvent(draw, [], NOW)?.writes).toEqual([['modes/draw/started', 'daily/2026-10-22/started', 'playerCounts/3']])
    expect(transitionStatsEvent(draw, { status: 'reveal', reveal: { correctAnswer: 'chat', stats: {} } }, [], NOW)).toBeNull()
  })

  test('question i affichée : modes/…/reached/i (la courbe donne les abandons)', () => {
    const session = makeSession({ status: 'scores', currentIndex: 2 })
    expect(transitionStatsEvent(session, { status: 'question', currentIndex: 3 }, QUESTIONS, NOW)).toEqual({ key: 'question:3', writes: [['modes/quiz/reached/3']] })
    expect(transitionStatsEvent(makeSession({ status: 'starting' }), { status: 'question', currentIndex: 0 }, QUESTIONS, NOW)?.key).toBe('question:0')
  })

  test('révélation réelle du moteur : une écriture par réponse, la bonne réponse comptée avec elle', () => {
    // Deux bonnes réponses (index 1), une fausse.
    const session = makeSession({
      status: 'question',
      currentIndex: 0,
      currentQuestion: { text: 'Q', options: QUESTIONS[0].options, difficulty: 2, timeLimit: 20 },
      phaseEndsAt: NOW,
      answers: { 0: { [HOST]: answer(1), [PLAYER]: answer(1), [OTHER]: answer(0) } },
    } as Partial<Session>)
    const changes = transitionUpdate(session, QUESTIONS, { status: 'question', currentIndex: 0 }, NOW)
    expect(changes?.status).toBe('reveal')
    const event = transitionStatsEvent(session, changes!, QUESTIONS, NOW)
    expect(event).toEqual({
      key: 'reveal:0',
      writes: [
        ['questions/quiz-1/q-0/answered', 'questions/quiz-1/q-0/correct'],
        ['questions/quiz-1/q-0/answered', 'questions/quiz-1/q-0/correct'],
        ['questions/quiz-1/q-0/answered'],
      ],
    })
  })

  test('partie tirée : la question est comptée dans son vrai quiz (questionRefs)', () => {
    const session = makeSession({ status: 'question', currentIndex: 1, questionRefs: ['histoire-1/h-07', 'sport-2/s-03'] })
    const reveal: Reveal = { correctAnswer: 'x', stats: {}, results: { [PLAYER]: { correct: true, points: 1000 } } }
    expect(transitionStatsEvent(session, { status: 'reveal', reveal }, QUESTIONS, NOW)?.writes).toEqual([['questions/sport-2/s-03/answered', 'questions/sport-2/s-03/correct']])
  })

  test('Bluff : réponses = votes, bonnes = votes pour la vraie réponse (pas les auteurs sans vote)', () => {
    const session = makeSession({ status: 'vote', currentIndex: 0, settings: { answerMode: 'bluff', speedBonus: false, control: false, teams: false } })
    const reveal: Reveal = {
      correctAnswer: 'vrai',
      stats: { bluffChoices: [{ text: 'vrai', kind: 'truth', voters: [PLAYER] }, { text: 'faux', kind: 'player', authors: [HOST], voters: [OTHER, HOST] }] },
      results: { [PLAYER]: { correct: true, points: 1000 }, [OTHER]: { correct: false, points: 0 }, [HOST]: { correct: false, points: 1000 } },
    } as Reveal
    expect(transitionStatsEvent(session, { status: 'reveal', reveal }, BLUFF_QUESTIONS, NOW)?.writes).toEqual([
      ['questions/quiz-1/b-0/answered', 'questions/quiz-1/b-0/correct'],
      ['questions/quiz-1/b-0/answered'],
      ['questions/quiz-1/b-0/answered'],
    ])
  })

  test('révélation sans aucune réponse : rien à écrire', () => {
    const reveal: Reveal = { correctAnswer: 'x', stats: {}, results: {} }
    expect(transitionStatsEvent(makeSession({ status: 'question' }), { status: 'reveal', reveal }, QUESTIONS, NOW)).toBeNull()
  })

  test('fin normale : partie terminée (jeu, jour, quiz) ; autres transitions : rien', () => {
    expect(transitionStatsEvent(makeSession({ status: 'reveal', currentIndex: 9 }), { status: 'ended' }, QUESTIONS, NOW)).toEqual({
      key: 'end',
      writes: [['modes/quiz/completed', 'daily/2026-10-22/completed'], ['quizzes/quiz-1/completed']],
    })
    expect(transitionStatsEvent(makeSession({ status: 'reveal' }), { status: 'scores' }, QUESTIONS, NOW)).toBeNull()
    expect(transitionStatsEvent(makeSession({ status: 'question' }), { status: 'validation' }, QUESTIONS, NOW)).toBeNull()
  })

  test('limites des règles : question 30 et plus, plus de 20 joueurs, identifiant invalide : chemin omis', () => {
    expect(transitionStatsEvent(makeSession({ status: 'scores' }), { status: 'question', currentIndex: 30 }, QUESTIONS, NOW)).toBeNull()
    const crowd = Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`p${i}`, player(`J${i}`)]))
    expect(startStatsEvent(makeSession({ players: crowd }), QUESTIONS, NOW)?.writes[0]).toEqual(['modes/quiz/started', 'daily/2026-10-22/started'])
    expect(startStatsEvent(makeSession({ quizId: 'Quiz Démo' }), QUESTIONS, NOW)?.writes).toHaveLength(1)
  })

  test('rien de personnel dans les chemins : ni uid, ni prénom, ni code de partie', () => {
    const session = makeSession({ status: 'question', currentIndex: 0 })
    const reveal: Reveal = { correctAnswer: 'x', stats: {}, results: { [PLAYER]: { correct: true, points: 1 }, [OTHER]: { correct: false, points: 0 } } }
    const paths = [
      ...(startStatsEvent(session, QUESTIONS, NOW)?.writes ?? []),
      ...(transitionStatsEvent(session, { status: 'reveal', reveal }, QUESTIONS, NOW)?.writes ?? []),
    ].flat()
    for (const path of paths) {
      for (const secret of [HOST, PLAYER, OTHER, 'Léa', 'Tom', 'Hôte']) expect(path).not.toContain(secret)
    }
  })
})

describe('Envoi des statistiques : interrupteur, garde anti-double-compte, échecs ignorés', () => {
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0))
  function recorder(isEnabled: () => Promise<boolean> = async () => true, write: (paths: StatsWrite) => Promise<void> = async () => undefined) {
    const writes: StatsWrite[] = []
    const deps = {
      isEnabled: vi.fn(isEnabled),
      write: vi.fn(async (paths: StatsWrite) => {
        writes.push(paths)
        await write(paths)
      }),
    }
    return { stats: createStatsRecorder(deps), deps, writes }
  }
  const lobby = makeSession()
  const toQuestion = (index: number) => [makeSession({ status: index === 0 ? 'starting' : 'scores', currentIndex: Math.max(0, index - 1) }), { status: 'question', currentIndex: index }] as const

  test('transition rejouée ou reconnexion : comptée une seule fois', async () => {
    const { stats, writes } = recorder()
    stats.gameStart('ABCD', lobby, QUESTIONS, NOW)
    stats.gameStart('ABCD', lobby, QUESTIONS, NOW)
    for (let i = 0; i < 3; i++) stats.transition('ABCD', ...toQuestion(0), QUESTIONS, NOW)
    stats.transition('ABCD', makeSession({ status: 'reveal', currentIndex: 9 }), { status: 'ended' }, QUESTIONS, NOW)
    stats.transition('ABCD', makeSession({ status: 'reveal', currentIndex: 9 }), { status: 'ended' }, QUESTIONS, NOW)
    await flush()
    expect(writes.flat().filter((path) => path === 'modes/quiz/started')).toHaveLength(1)
    expect(writes.flat().filter((path) => path === 'modes/quiz/reached/0')).toHaveLength(1)
    expect(writes.flat().filter((path) => path === 'modes/quiz/completed')).toHaveLength(1)
  })

  test('Changer de jeu (nouveau lancement sur le même code) : nouvelle partie, comptée à nouveau', async () => {
    const { stats, writes } = recorder()
    stats.gameStart('ABCD', lobby, QUESTIONS, NOW)
    stats.transition('ABCD', ...toQuestion(0), QUESTIONS, NOW)
    stats.gameStart('ABCD', lobby, QUESTIONS, NOW + 600_000)
    stats.transition('ABCD', ...toQuestion(0), QUESTIONS, NOW + 600_000)
    await flush()
    expect(writes.flat().filter((path) => path === 'modes/quiz/started')).toHaveLength(2)
    expect(writes.flat().filter((path) => path === 'modes/quiz/reached/0')).toHaveLength(2)
  })

  test('config/statsEnabled à false : rien n’est écrit ; interrupteur lu une fois par partie', async () => {
    const { stats, deps } = recorder(async () => false)
    stats.gameStart('ABCD', lobby, QUESTIONS, NOW)
    stats.transition('ABCD', ...toQuestion(0), QUESTIONS, NOW)
    stats.transition('ABCD', ...toQuestion(1), QUESTIONS, NOW)
    await flush()
    expect(deps.write).not.toHaveBeenCalled()
    expect(deps.isEnabled).toHaveBeenCalledTimes(1)
  })

  test('lecture de l’interrupteur en échec : statistiques écrites comme d’habitude', async () => {
    const { stats, writes } = recorder(async () => Promise.reject(new Error('Client is offline.')))
    stats.gameStart('ABCD', lobby, QUESTIONS, NOW)
    await flush()
    expect(writes.flat()).toContain('modes/quiz/started')
  })

  test('écriture refusée ou erreur immédiate : ignorée, sans exception ni rejet non traité', async () => {
    const { stats } = recorder(async () => true, async () => Promise.reject(new Error('PERMISSION_DENIED')))
    expect(() => stats.gameStart('ABCD', lobby, QUESTIONS, NOW)).not.toThrow()
    const throwing = createStatsRecorder({ isEnabled: async () => true, write: () => { throw new Error('synchrone') } })
    expect(() => throwing.gameStart('ABCD', lobby, QUESTIONS, NOW)).not.toThrow()
    await flush()
  })

  test('partie reprise après une relance de l’app (pas de lancement en mémoire) : comptée sous « resumed »', async () => {
    const { stats, writes } = recorder()
    stats.transition('WXYZ', ...toQuestion(4), QUESTIONS, NOW)
    stats.transition('WXYZ', ...toQuestion(4), QUESTIONS, NOW)
    await flush()
    expect(writes).toEqual([['modes/quiz/reached/4']])
  })

  test('blind test : rien, même au lancement', async () => {
    const { stats, deps } = recorder()
    stats.gameStart('ABCD', lobby, BLIND_TEST, NOW)
    stats.transition('ABCD', makeSession({ status: 'reveal' }), { status: 'ended' }, BLIND_TEST, NOW)
    await flush()
    expect(deps.write).not.toHaveBeenCalled()
    expect(deps.isEnabled).not.toHaveBeenCalled()
  })
})
