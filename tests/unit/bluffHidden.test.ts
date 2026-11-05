import { describe, expect, test } from 'vitest'

import { bluffHideUpdate, canHideBluffChoice, hideableBluffs, withHiddenBluffChoices } from '../../shared/bluff'
import { HIDDEN_ANSWER_TEXT } from '../../shared/constants'
import type { BluffChoice, PublicSession } from '../../shared/types'

const choices: BluffChoice[] = [
  { text: 'La vraie réponse', kind: 'truth' },
  { text: 'Une grossièreté', kind: 'bluff', authors: ['lea'] },
  { text: 'Un leurre', kind: 'decoy' },
]
const voting = { status: 'vote' as const, currentIndex: 2, bluffChoices: { 2: choices } }

describe('Bluff : l’hôte masque un bluff', () => {
  test('seulement une proposition de joueur, pendant le vote ou la révélation', () => {
    expect(canHideBluffChoice(voting, 1)).toBe(true)
    expect(canHideBluffChoice(voting, 0)).toBe(false)
    expect(canHideBluffChoice(voting, 2)).toBe(false)
    expect(canHideBluffChoice({ ...voting, status: 'reveal' }, 1)).toBe(true)
    expect(canHideBluffChoice({ ...voting, status: 'question' }, 1)).toBe(false)
  })

  test('masquer et réafficher écrivent bluffHidden', () => {
    expect(bluffHideUpdate(voting, 1, true)).toEqual({ 'bluffHidden/2/1': true })
    expect(bluffHideUpdate(voting, 1, false)).toEqual({ 'bluffHidden/2/1': null })
    expect(bluffHideUpdate(voting, 0, true)).toBeNull()
  })

  test('liste de l’hôte : jamais les auteurs, ni la vraie réponse, ni un leurre', () => {
    const list = hideableBluffs({ ...voting, bluffHidden: { 2: { 1: true } } })
    expect(list).toEqual([{ choiceIndex: 1, text: 'Une grossièreté', hidden: true }])
    expect(JSON.stringify(list)).not.toContain('lea')
    expect(hideableBluffs({ ...voting, status: 'question' })).toEqual([])
  })

  test('« ••• » au vote et à la révélation, à la bonne question seulement', () => {
    const session = {
      bluffHidden: { 2: { 1: true as const } },
      currentIndex: 2,
      currentQuestion: { text: 'Q', difficulty: 1, timeLimit: 75, choices: ['La vraie réponse', 'Une grossièreté', 'Un leurre'] },
      reveal: { correctAnswer: 'x', stats: { bluffChoices: [{ text: 'La vraie réponse', kind: 'truth' }, { text: 'Une grossièreté', kind: 'bluff' }] } },
    } as Pick<PublicSession, 'bluffHidden' | 'currentIndex' | 'currentQuestion' | 'reveal'>
    const shown = withHiddenBluffChoices(session)
    expect(shown.currentQuestion?.choices).toEqual(['La vraie réponse', HIDDEN_ANSWER_TEXT, 'Un leurre'])
    expect(shown.reveal?.stats.bluffChoices?.[1].text).toBe(HIDDEN_ANSWER_TEXT)
    expect(shown.reveal?.stats.bluffChoices?.[0].text).toBe('La vraie réponse')
    const other = { ...session, currentIndex: 3 }
    expect(withHiddenBluffChoices(other)).toBe(other)
  })
})
