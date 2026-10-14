import { describe, expect, test } from 'vitest'

import { trackOptionAnswer, trackOptionParts } from '../../shared/trackOption'

describe('Proposition « Titre – Artiste » (blind test)', () => {
  test('titre et artiste ; sans séparateur : le texte entier, sans artiste', () => {
    expect(trackOptionParts('Karma Chameleon – Culture Club')).toEqual({ title: 'Karma Chameleon', artist: 'Culture Club' })
    expect(trackOptionParts('Paris')).toEqual({ title: 'Paris', artist: null })
    // Un trait d'union ordinaire n'est pas le séparateur.
    expect(trackOptionParts('Hey-Ho - Live')).toEqual({ title: 'Hey-Ho - Live', artist: null })
  })

  test('au dernier séparateur : un titre peut en contenir un', () => {
    expect(trackOptionParts('Ballade – version courte – Artiste')).toEqual({ title: 'Ballade – version courte', artist: 'Artiste' })
  })

  test('ce que demande la question en Réponse libre', () => {
    const option = 'Take On Me – a-ha'
    expect(trackOptionAnswer(option, 'title')).toBe('Take On Me')
    expect(trackOptionAnswer(option, 'artist')).toBe('a-ha')
    expect(trackOptionAnswer(option, 'both')).toBe(option)
    expect(trackOptionAnswer('Paris', 'artist')).toBe('Paris')
  })
})
