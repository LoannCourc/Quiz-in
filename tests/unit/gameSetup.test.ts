import { describe, expect, test } from 'vitest'

import { REVEAL_DURATION_S, ROOM_CODE_ALPHABET, SCORES_DURATION_S } from '../../shared/constants'
import { nextPhase, type FlowContext } from '../../shared/gameFlow'
import {
  areSettingsCompatible,
  averageDifficulty,
  canEnableOption,
  difficultyLevel,
  estimateQuizMinutes,
  withAnswerMode,
} from '../../shared/quizCatalog'
import { generateRoomCode, isValidRoomCode } from '../../shared/roomCode'
import type { SessionSettings } from '../../shared/types'

describe('generateRoomCode', () => {
  test('codes tirés au hasard toujours valides', () => {
    for (let i = 0; i < 200; i++) {
      expect(isValidRoomCode(generateRoomCode())).toBe(true)
    }
  })

  test('bornes du hasard : premier et dernier caractère de l’alphabet', () => {
    expect(generateRoomCode(() => 0)).toBe('AAAA')
    expect(generateRoomCode(() => 0.9999)).toBe(ROOM_CODE_ALPHABET.at(-1)!.repeat(4))
  })
})

describe('nextPhase', () => {
  const choice: FlowContext = { answerMode: 'choice', currentIndex: 0, questionCount: 10 }
  const free: FlowContext = { ...choice, answerMode: 'free' }

  test('lobby → starting (3 s) → première question', () => {
    expect(nextPhase('lobby', choice)).toEqual({ status: 'starting', currentIndex: 0, durationS: 3 })
    expect(nextPhase('starting', choice)).toEqual({ status: 'question', currentIndex: 0, durationS: 20 })
    expect(nextPhase('starting', free)).toEqual({ status: 'question', currentIndex: 0, durationS: 30 })
  })

  test('durée propre à une question', () => {
    expect(nextPhase('starting', choice, 45)?.durationS).toBe(45)
  })

  test('question → reveal (6 s) → scores (5 s), durées lues dans shared/constants', () => {
    expect(nextPhase('question', choice)).toEqual({ status: 'reveal', currentIndex: 0, durationS: REVEAL_DURATION_S.choice })
    expect(nextPhase('question', free)?.durationS).toBe(REVEAL_DURATION_S.free)
    expect(nextPhase('reveal', choice)).toEqual({ status: 'scores', currentIndex: 0, durationS: SCORES_DURATION_S })
    expect([REVEAL_DURATION_S.choice, REVEAL_DURATION_S.free, SCORES_DURATION_S]).toEqual([6, 6, 5])
  })

  test('scores → question suivante, ou fin après la dernière', () => {
    expect(nextPhase('scores', { ...choice, currentIndex: 3 })).toEqual({
      status: 'question',
      currentIndex: 4,
      durationS: 20,
    })
    expect(nextPhase('scores', { ...choice, currentIndex: 9 })).toEqual({
      status: 'ended',
      currentIndex: 9,
      durationS: null,
    })
  })

  test('pas d’état suivant automatique pour ended et paused', () => {
    expect(nextPhase('ended', choice)).toBeNull()
    expect(nextPhase('paused', choice)).toBeNull()
  })
})

describe('catalogue', () => {
  test('difficulté moyenne et niveau, seuils de la spec', () => {
    expect(averageDifficulty([1, 2, 2])).toBe(1.67)
    expect(difficultyLevel(1.66)).toBe('easy')
    expect(difficultyLevel(1.67)).toBe('medium')
    expect(difficultyLevel(2.33)).toBe('medium')
    expect(difficultyLevel(2.34)).toBe('hard')
  })

  // Choix multiples (par défaut) : 3 + 10 × (20 + 6 + 5) = 313 s, arrondi à 6 minutes.
  // Réponse libre : 3 + 10 × (30 + 6 + 5) = 413 s, arrondi à 7 minutes.
  test('durée estimée de 10 questions : 6 minutes, 7 en Réponse libre', () => {
    expect(estimateQuizMinutes(10)).toBe(6)
    expect(estimateQuizMinutes(10, 'free')).toBe(7)
  })
})

describe('compatibilité des réglages', () => {
  const settings: SessionSettings = { answerMode: 'free', speedBonus: false, control: false, teams: false }

  test('Contrôle interdit en Choix multiples', () => {
    expect(areSettingsCompatible({ ...settings, answerMode: 'choice', control: true })).toBe(false)
  })

  test('trois options en Réponse libre, deux au plus en Choix multiples', () => {
    const all = { ...settings, speedBonus: true, control: true, teams: true }
    expect(areSettingsCompatible(all)).toBe(true)
    expect(areSettingsCompatible({ ...all, answerMode: 'choice', control: false })).toBe(true)
  })

  test('au MVP, seule Rapidité peut être activée', () => {
    expect(canEnableOption(settings, 'speedBonus')).toBe(true)
    expect(canEnableOption(settings, 'control')).toBe(false)
    expect(canEnableOption(settings, 'teams')).toBe(false)
  })

  test('passer en Choix multiples coupe Contrôle', () => {
    expect(withAnswerMode({ ...settings, control: true }, 'choice')).toEqual({ ...settings, answerMode: 'choice' })
  })
})
