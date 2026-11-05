import { describe, expect, test } from 'vitest'

import { bluffWritingStyle, styledAnswerText, voteChoiceTexts } from '../../shared/bluffStyle'
import { BLUFF_ANSWER_STYLE_LEVEL } from '../../shared/constants'
import type { BluffChoice } from '../../shared/types'

const CARELESS = { capitalized: false, accented: false, finalDot: false }

describe('Bluff : style des réponses du jeu au vote', () => {
  test('fautes légères par défaut', () => {
    expect(BLUFF_ANSWER_STYLE_LEVEL).toBe('light')
  })

  test('style lu sur les propositions de la manche ; deux au moins', () => {
    expect(bluffWritingStyle(['un seul bluff'])).toBeNull()
    expect(bluffWritingStyle(['un chat', 'une poule'])).toEqual(CARELESS)
    expect(bluffWritingStyle(['Un chat.', 'Une poule.'])).toEqual({ capitalized: true, accented: false, finalDot: true })
    expect(bluffWritingStyle(['Un chat.', 'une poule', 'Un âne', 'la lune.'])).toEqual({ capitalized: true, accented: true, finalDot: true })
  })

  test('joueurs négligés : ni majuscule, ni accents, ni point final', () => {
    expect(styledAnswerText('Une tortue, lâchée par un aigle.', CARELESS)).toBe('une tortue, lachee par un aigle')
    expect(styledAnswerText("En se jetant dans l'Etna ; le volcan.", CARELESS)).toBe("en se jetant dans l'Etna ; le volcan")
  })

  test('joueurs soigneux : le texte ne change pas', () => {
    const style = { capitalized: true, accented: true, finalDot: true }
    expect(styledAnswerText('Une tortue, lâchée par un aigle.', style)).toBe('Une tortue, lâchée par un aigle.')
  })

  test('noms propres : majuscule gardée en début de phrase et dans la phrase', () => {
    expect(styledAnswerText('Shrek, face à « Monstres et Cie ».', CARELESS)).toBe('Shrek, face à « Monstres et Cie »')
    expect(styledAnswerText('De François Mansart.', CARELESS)).toBe('de Francois Mansart')
  })

  test('accents qui changent le sens : gardés', () => {
    expect(styledAnswerText('Il est mûr, sûr et marié à côté.', CARELESS)).toBe('il est mûr, sûr et marié à côté')
    expect(styledAnswerText('Où est la tâche du pêcheur ?', CARELESS)).toBe('Où est la tâche du pêcheur ?')
  })

  test('points de suspension gardés ; jamais plus long que la limite des règles', () => {
    expect(styledAnswerText('Le chat...', CARELESS)).toBe('le chat...')
    const long = `Cœur ${'x'.repeat(95)}`
    expect(long).toHaveLength(100)
    expect(styledAnswerText(long, { ...CARELESS, finalDot: true })).toBe(long)
  })

  const choices: BluffChoice[] = [
    { text: 'La Vraie Réponse, écrite.', kind: 'truth' },
    { text: 'un bluff tapé vite.', kind: 'bluff', authors: ['a'] },
    { text: 'autre bluff', kind: 'bluff', authors: ['b'] },
    { text: 'Un leurre élégant.', kind: 'decoy' },
  ]

  test('vote : les propositions des joueurs ne bougent jamais, même ordre, même nombre', () => {
    // Un bluff a un accent et un point sur deux : accents et point gardés, seule la majuscule part.
    expect(voteChoiceTexts(choices)).toEqual(['la Vraie Réponse, écrite.', 'un bluff tapé vite.', 'autre bluff', 'un leurre élégant.'])
    const careless = choices.map((choice) => (choice.kind === 'bluff' ? { ...choice, text: 'un bluff' } : choice))
    expect(voteChoiceTexts(careless)[0]).toBe('la Vraie Reponse, ecrite')
  })

  test('niveau « sans faute » : aucun changement', () => {
    expect(voteChoiceTexts(choices, 'clean')).toEqual(choices.map((choice) => choice.text))
  })

  test('moins de deux propositions : aucun changement', () => {
    const one = choices.filter((choice) => choice.authors?.[0] !== 'b')
    expect(voteChoiceTexts(one)).toEqual(one.map((choice) => choice.text))
  })
})
