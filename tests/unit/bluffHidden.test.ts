import { describe, expect, test } from 'vitest'

import { withHiddenBluffChoices } from '../../shared/bluff'
import { HIDDEN_ANSWER_TEXT } from '../../shared/constants'
import type { PublicSession } from '../../shared/types'

// L'app de l'hôte ne masque plus rien depuis la 1.2.3, mais un hôte sur une version publiée peut encore écrire
// bluffHidden : la TV et les téléphones doivent toujours l'appliquer.
describe('Bluff : proposition masquée par un hôte sur une version publiée', () => {
  test('« ••• » au vote et à la révélation, à la bonne question seulement', () => {
    const session = {
      bluffHidden: { 2: { 1: true as const } },
      currentIndex: 2,
      currentQuestion: { text: 'Q', difficulty: 1, timeLimit: 60, choices: ['La vraie réponse', 'Une grossièreté', 'Un leurre'] },
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
