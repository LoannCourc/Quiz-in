import { describe, expect, test } from 'vitest'

import { bluffHideUpdate, canHideBluffChoice, hideableBluffProposals, withHiddenBluffChoices } from '../../shared/bluff'
import { HIDDEN_ANSWER_TEXT } from '../../shared/constants'
import type { BluffChoice, PublicSession } from '../../shared/types'

const choices: BluffChoice[] = [
  { text: 'La vraie réponse', kind: 'truth' },
  { text: 'Une grossièreté', kind: 'bluff', authors: ['lea'] },
  { text: 'Un leurre', kind: 'decoy' },
]
const voting = { status: 'vote' as const, currentIndex: 2, bluffChoices: { 2: choices } }

describe('Bluff : l’hôte masque une proposition', () => {
  test('seulement une proposition de joueur, pendant le vote ou la révélation', () => {
    expect(canHideBluffChoice(voting, 1)).toBe(true)
    expect(canHideBluffChoice(voting, 0)).toBe(false)
    expect(canHideBluffChoice(voting, 2)).toBe(false)
    expect(canHideBluffChoice({ ...voting, status: 'reveal' }, 1)).toBe(true)
    expect(canHideBluffChoice({ ...voting, status: 'question' }, 1)).toBe(false)
  })

  test('écriture : masquer puis réafficher', () => {
    expect(bluffHideUpdate(voting, 1, true)).toEqual({ 'bluffHidden/2/1': true })
    expect(bluffHideUpdate(voting, 1, false)).toEqual({ 'bluffHidden/2/1': null })
    expect(bluffHideUpdate(voting, 0, true)).toBeNull()
  })

  test('affichage : « ••• » au vote et à la révélation, le reste inchangé', () => {
    const session = {
      currentIndex: 2,
      bluffHidden: { 2: { 1: true as const } },
      currentQuestion: { text: 'Q', difficulty: 1, timeLimit: 60, choices: choices.map((choice) => choice.text) },
      reveal: { correctAnswer: 'La vraie réponse', stats: { bluffChoices: choices }, results: {} },
    } as Pick<PublicSession, 'bluffHidden' | 'currentIndex' | 'currentQuestion' | 'reveal'>
    const shown = withHiddenBluffChoices(session)
    expect(shown.currentQuestion?.choices).toEqual(['La vraie réponse', HIDDEN_ANSWER_TEXT, 'Un leurre'])
    expect(shown.reveal?.stats.bluffChoices?.map((choice) => choice.text)).toEqual(['La vraie réponse', HIDDEN_ANSWER_TEXT, 'Un leurre'])
    expect(shown.reveal?.stats.bluffChoices?.[1].authors).toEqual(['lea'])
    // Rien de masqué pour cette question : la session telle quelle.
    const other = { ...session, currentIndex: 3 }
    expect(withHiddenBluffChoices(other)).toBe(other)
  })

  test('panneau de l’hôte : seules les propositions de joueurs, avec leur auteur et leur état', () => {
    expect(hideableBluffProposals({ ...voting, bluffHidden: { 2: { 1: true } } })).toEqual([
      { choiceIndex: 1, text: 'Une grossièreté', authors: ['lea'], hidden: true },
    ])
    expect(hideableBluffProposals({ ...voting, status: 'question' })).toEqual([])
  })
})
