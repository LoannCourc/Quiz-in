import { describe, expect, test } from 'vitest'

import { bluffRevealTimeline } from '../../shared/bluff'
import {
  CLOCK_TICK_COUNT,
  CUE_MAX_AGE_MS,
  DEFAULT_SOUND_SETTINGS,
  RANK_SHUFFLE_DELAY_MS,
  VALIDATED_RESULT_DELAY_MS,
  SOUND_MIX,
  SUSPENSE_DRUMROLL_MS,
  TRAPPED_DELAY_MS,
  channelGains,
  masterGain,
  parseSoundSettings,
  phaseKey,
  ranksChanged,
  soundCues,
  soundSettingsOf,
  timedCues,
} from '../../shared/sound'
import {
  PODIUM_ENTRY_STEP_MS,
  SCORES_ENTRY_STEP_MS,
  SCORES_FIRST_ENTRY_MS,
  podiumEntryMs,
  scoresEntryMs,
} from '../../shared/rankingTimeline'
import type { RevealedBluffChoice, Session } from '../../shared/types'
import { HOST, OTHER, PLAYER, makeSession, player } from './engineFixtures'

const NOW = 1_000_000

describe('Réglages du son', () => {
  test('forme valide acceptée, le reste refusé', () => {
    expect(parseSoundSettings({ music: false, effects: true, volume: 40 })).toEqual({ music: false, effects: true, volume: 40 })
    expect(parseSoundSettings({ music: false, effects: true, volume: 140 })).toBeNull()
    expect(parseSoundSettings({ music: false, effects: true, volume: 40.5 })).toBeNull()
    expect(parseSoundSettings({ music: 'oui', effects: true, volume: 40 })).toBeNull()
    expect(parseSoundSettings(null)).toBeNull()
  })

  test('partie sans réglage du son : réglages par défaut', () => {
    expect(soundSettingsOf({})).toEqual(DEFAULT_SOUND_SETTINGS)
    expect(soundSettingsOf({ sound: { music: false, effects: false, volume: 20 } })).toEqual({ music: false, effects: false, volume: 20 })
  })

  test('gains : courbe du volume, part des canaux, interrupteurs', () => {
    expect(masterGain(0)).toBe(0)
    expect(masterGain(100)).toBe(1)
    expect(masterGain(60)).toBeLessThan(0.6)
    expect(channelGains({ music: true, effects: true, volume: 100 })).toEqual(SOUND_MIX)
    expect(channelGains({ music: false, effects: true, volume: 100 })).toEqual({ music: 0, effects: SOUND_MIX.effects })
    expect(channelGains({ music: true, effects: false, volume: 100 })).toEqual({ music: SOUND_MIX.music, effects: 0 })
  })
})

// Phase démarrée il y a 500 ms (récente) et finissant dans 19,5 s.
function inPhase(overrides: Partial<Session>): Session {
  return makeSession({ currentIndex: 0, phaseStartedAt: NOW - 500, phaseEndsAt: NOW + 19_500, ...overrides })
}

describe('Sons déduits des changements d’état', () => {
  const question = inPhase({ status: 'question' })

  test('premier état reçu : aucun son (TV ouverte en pleine partie)', () => {
    expect(soundCues(null, question, NOW)).toEqual([])
  })

  test('un joueur rejoint le salon, un joueur le quitte', () => {
    const lobby = makeSession({ status: 'lobby', players: { [HOST]: player('Hôte') } })
    const joined = { ...lobby, players: { ...lobby.players, [PLAYER]: player('Léa') } }
    expect(soundCues(lobby, joined, NOW)).toEqual(['playerJoined'])
    expect(soundCues(joined, lobby, NOW)).toEqual(['playerLeft'])
    expect(soundCues(lobby, lobby, NOW)).toEqual([])
    // Hors du salon : ni arrivée ni départ.
    const question = inPhase({ status: 'question', players: lobby.players })
    expect(soundCues(question, { ...question, players: joined.players }, NOW)).toEqual([])
  })

  test('Rejouer : retour au salon depuis la fin de partie', () => {
    const ended = makeSession({ status: 'ended' })
    expect(soundCues(ended, makeSession({ status: 'lobby', phaseStartedAt: NOW - 200 }), NOW)).toEqual(['replay'])
    expect(soundCues(ended, makeSession({ status: 'lobby', phaseStartedAt: NOW - CUE_MAX_AGE_MS }), NOW)).toEqual([])
  })

  test('tirage des équipes : à chaque nouveau tirage récent', () => {
    const lobby = makeSession({ status: 'lobby' })
    expect(soundCues(lobby, { ...lobby, teamDrawAt: NOW - 100 }, NOW)).toEqual(['teamDraw'])
    expect(soundCues({ ...lobby, teamDrawAt: NOW - 100 }, { ...lobby, teamDrawAt: NOW - 100 }, NOW)).toEqual([])
    expect(soundCues(lobby, { ...lobby, teamDrawAt: NOW - CUE_MAX_AGE_MS }, NOW)).toEqual([])
  })

  test('« GO » à la première question, puis question qui apparaît (et début du vote), si la phase est récente', () => {
    const starting = makeSession({ status: 'starting' })
    expect(soundCues(starting, question, NOW)).toEqual(['go'])
    expect(soundCues(question, { ...question, currentIndex: 1 }, NOW)).toEqual(['questionShown'])
    expect(soundCues(inPhase({ status: 'scores' }), { ...question, currentIndex: 1 }, NOW)).toEqual(['questionShown'])
    expect(soundCues(question, inPhase({ status: 'vote' }), NOW)).toEqual(['questionShown'])
    expect(soundCues(starting, question, NOW + CUE_MAX_AGE_MS)).toEqual([])
  })

  test('Contrôle : début de la validation, puis « validé » à la révélation (le résultat suit, programmé)', () => {
    const control = { ...question.settings, answerMode: 'free' as const, control: true }
    const validation = inPhase({ status: 'validation', phaseEndsAt: 0, settings: control })
    expect(soundCues(inPhase({ status: 'question', settings: control }), validation, NOW)).toEqual(['validationStart'])
    const reveal = inPhase({ status: 'reveal', settings: control, phaseStartedAt: NOW, reveal: { correctAnswer: 'A', stats: {}, results: { [PLAYER]: { correct: true, points: 100 } } } })
    expect(soundCues(validation, reveal, NOW)).toEqual(['validated'])
    expect(timedCues(reveal)).toEqual([{ id: 'fanfare', at: NOW + VALIDATED_RESULT_DELAY_MS }])
    // Sans Contrôle : le résultat joue tout de suite, rien n'est programmé.
    expect(timedCues({ ...reveal, settings: question.settings })).toEqual([])
  })

  test('pause, puis reprise sans rejouer l’entrée de la phase', () => {
    const paused = makeSession({ status: 'paused', pausedFrom: 'question', remainingMs: 12_000 })
    expect(soundCues(question, paused, NOW)).toEqual(['paused'])
    expect(soundCues(paused, question, NOW)).toEqual(['resumed'])
    expect(soundCues(paused, inPhase({ status: 'reveal', reveal: { correctAnswer: 'A', stats: {}, results: {} } }), NOW)).toEqual(['resumed'])
    expect(soundCues(paused, makeSession({ status: 'ended' }), NOW)).toEqual([])
  })

  test('un joueur répond, puis le dernier joueur connecté', () => {
    const one = { ...question, answeredBy: { 0: { [PLAYER]: true as const } } }
    const two = { ...question, answeredBy: { 0: { [PLAYER]: true as const, [OTHER]: true as const } } }
    const all = { ...question, answeredBy: { 0: { [PLAYER]: true as const, [OTHER]: true as const, [HOST]: true as const } } }
    expect(soundCues(question, one, NOW)).toEqual(['answerPop'])
    expect(soundCues(one, two, NOW)).toEqual(['answerPop'])
    expect(soundCues(two, all, NOW)).toEqual(['allAnswered'])
    expect(soundCues(all, all, NOW)).toEqual([])
  })

  test('Bluff : propositions acceptées (bluffedBy) et votes (votedBy)', () => {
    const writing = inPhase({ status: 'question', settings: { ...question.settings, answerMode: 'bluff' } })
    expect(soundCues(writing, { ...writing, bluffedBy: { 0: { [PLAYER]: true } } }, NOW)).toEqual(['answerPop'])
    // Une réponse en Choix multiples ne compte pas pendant l'écriture du Bluff.
    expect(soundCues(writing, { ...writing, answeredBy: { 0: { [PLAYER]: true } } }, NOW)).toEqual([])
    const vote = inPhase({ status: 'vote' })
    expect(soundCues(vote, { ...vote, votedBy: { 0: { [OTHER]: true } } }, NOW)).toEqual(['answerPop'])
  })

  test('révélation : fanfare si au moins un joueur a trouvé, « raté » sinon, rien en Bluff', () => {
    const reveal = (results: Record<string, { correct: boolean; points: number }>) =>
      inPhase({ status: 'reveal', reveal: { correctAnswer: 'A', stats: {}, results } })
    expect(soundCues(question, reveal({ [PLAYER]: { correct: true, points: 100 }, [OTHER]: { correct: false, points: 0 } }), NOW)).toEqual(['fanfare'])
    expect(soundCues(question, reveal({ [PLAYER]: { correct: false, points: 0 } }), NOW)).toEqual(['miss'])
    expect(soundCues(question, reveal({}), NOW)).toEqual(['miss'])
    const bluff = inPhase({ status: 'reveal', reveal: { correctAnswer: 'A', stats: { bluffChoices: [] }, results: {} } })
    expect(soundCues(inPhase({ status: 'vote' }), bluff, NOW)).toEqual([])
  })

  test('classement : points qui montent ; fin : rien d’emblée (podium programmé), roulement de tambour en Suspense', () => {
    expect(soundCues(question, inPhase({ status: 'scores' }), NOW)).toEqual(['pointsUp'])
    expect(soundCues(question, inPhase({ status: 'ended', phaseEndsAt: 0 }), NOW)).toEqual([])
    const suspense = inPhase({ status: 'ended', phaseEndsAt: 0, settings: { ...question.settings, suspense: true } })
    expect(soundCues(question, suspense, NOW)).toEqual(['drumroll'])
  })
})

describe('Sons programmés de la phase', () => {
  test('3-2-1 : un bip par seconde', () => {
    const starting = makeSession({ status: 'starting', phaseStartedAt: NOW, phaseEndsAt: NOW + 3_000 })
    expect(timedCues(starting)).toEqual([
      { id: 'countdown', at: NOW },
      { id: 'countdown', at: NOW + 1_000 },
      { id: 'countdown', at: NOW + 2_000 },
    ])
  })

  test('chrono : tic pendant les 5 dernières secondes, puis buzzer (question et vote)', () => {
    const question = inPhase({ status: 'question' })
    const cues = timedCues(question)
    expect(cues.filter((cue) => cue.id === 'clockTick').map((cue) => cue.at)).toEqual(
      Array.from({ length: CLOCK_TICK_COUNT }, (_, step) => question.phaseEndsAt - (CLOCK_TICK_COUNT - step) * 1_000),
    )
    expect(cues.at(-1)).toEqual({ id: 'buzzer', at: question.phaseEndsAt })
    expect(timedCues(inPhase({ status: 'vote' })).at(-1)?.id).toBe('buzzer')
  })

  test('chrono : rien en blind test, ni quand tout le monde a répondu, ni sans échéance', () => {
    const blindTest = inPhase({ status: 'question', currentQuestion: { text: 'Quel est ce titre ?', difficulty: 1, timeLimit: 20, audio: { url: 'https://a', startS: 0, durationS: 20 } } })
    expect(timedCues(blindTest)).toEqual([])
    const all = inPhase({ status: 'question', answeredBy: { 0: { [HOST]: true, [PLAYER]: true, [OTHER]: true } } })
    expect(timedCues(all)).toEqual([])
    expect(timedCues(inPhase({ status: 'question', phaseEndsAt: 0 }))).toEqual([])
  })

  test('Bluff : carte retournée toutes les 2 s, « piégé » si elle a des votants, puis la vraie réponse', () => {
    const choices: RevealedBluffChoice[] = [
      { text: 'Faux 1', kind: 'bluff', authors: [PLAYER], voters: [OTHER] },
      { text: 'Vrai', kind: 'truth', voters: [HOST] },
      { text: 'Leurre', kind: 'decoy' },
    ]
    const reveal = inPhase({ status: 'reveal', phaseStartedAt: NOW, reveal: { correctAnswer: 'Vrai', stats: { bluffChoices: choices }, results: {} } })
    expect(timedCues(reveal)).toEqual([
      { id: 'cardFlip', at: NOW },
      { id: 'trapped', at: NOW + TRAPPED_DELAY_MS },
      { id: 'cardFlip', at: NOW + 2_000 },
      { id: 'bluffTruth', at: NOW + 4_000 },
    ])
    expect(bluffRevealTimeline(choices).flips.map((flip) => flip.index)).toEqual([0, 2])
  })

  test('classement : une ligne après l’autre, de la dernière à la première, de plus en plus aiguë', () => {
    const scores = inPhase({ status: 'scores', phaseStartedAt: NOW })
    // Trois joueurs : 3e, 2e puis 1er.
    expect(timedCues(scores)).toEqual([0, 1, 2].map((step) => ({ id: 'rowEnter', at: NOW + scoresEntryMs(2 - step, 3), step })))
    expect(scoresEntryMs(2, 3)).toBe(SCORES_FIRST_ENTRY_MS)
    expect(scoresEntryMs(1, 3) - scoresEntryMs(2, 3)).toBe(SCORES_ENTRY_STEP_MS)
    // Au plus un son de ligne tous les 120 ms.
    expect(SCORES_ENTRY_STEP_MS).toBeGreaterThanOrEqual(120)
  })

  test('classement : glissement après la dernière ligne, seulement si un rang a changé (pas en Groupe)', () => {
    const players = {
      [PLAYER]: player('Léa', { score: 200, rank: 1 }),
      [OTHER]: player('Tom', { score: 150, rank: 2 }),
    }
    // Avant la question : Léa 100, Tom 150 → Tom 1er, Léa 2e ; après : Léa passe devant.
    const moved = inPhase({ status: 'scores', phaseStartedAt: NOW, players, reveal: { correctAnswer: 'A', stats: {}, results: { [PLAYER]: { correct: true, points: 100 } } } })
    expect(ranksChanged(moved)).toBe(true)
    expect(timedCues(moved).at(-1)).toEqual({ id: 'rankShuffle', at: NOW + scoresEntryMs(0, 2) + RANK_SHUFFLE_DELAY_MS })
    const same = { ...moved, reveal: { correctAnswer: 'A', stats: {}, results: { [PLAYER]: { correct: true, points: 10 } } } }
    expect(ranksChanged(same)).toBe(false)
    expect(timedCues(same).map((cue) => cue.id)).toEqual(['rowEnter', 'rowEnter'])
    expect(timedCues({ ...moved, settings: { ...moved.settings, teams: true } }).some((cue) => cue.id === 'rankShuffle')).toBe(false)
  })

  test('fin : le 3e, le 2e puis le 1er arrivent sur le podium (le 1er avec le tada), après le roulement en Suspense', () => {
    const ended = inPhase({ status: 'ended', phaseStartedAt: NOW, phaseEndsAt: 0 })
    expect(timedCues(ended)).toEqual([
      { id: 'podiumThird', at: NOW + podiumEntryMs(2, 0) },
      { id: 'podiumSecond', at: NOW + podiumEntryMs(1, 0) },
      { id: 'tada', at: NOW + podiumEntryMs(0, 0) },
    ])
    expect(podiumEntryMs(1, 0) - podiumEntryMs(2, 0)).toBe(PODIUM_ENTRY_STEP_MS)
    const suspense = { ...ended, settings: { ...ended.settings, suspense: true } }
    expect(timedCues(suspense)[0]).toEqual({ id: 'podiumThird', at: NOW + SUSPENSE_DRUMROLL_MS + podiumEntryMs(2, 0) })
    // Deux joueurs : pas de 3e marche.
    const two = { ...ended, players: { [PLAYER]: player('Léa'), [OTHER]: player('Tom') } }
    expect(timedCues(two).map((cue) => cue.id)).toEqual(['podiumSecond', 'tada'])
  })

  test('clé de phase : change avec l’état, la question et le début de phase', () => {
    const question = inPhase({ status: 'question' })
    expect(phaseKey(question)).toBe(phaseKey({ ...question, answeredBy: { 0: { [PLAYER]: true } } }))
    expect(phaseKey(question)).not.toBe(phaseKey({ ...question, phaseStartedAt: NOW }))
  })
})
