import { describe, expect, test } from 'vitest'

import { containsForbiddenNameWord, containsForbiddenWord } from '../../shared/answerFilter'
import { isAllowedPlayerName } from '../../shared/playerName'

describe('Filtre des mots interdits : faux positifs évités', () => {
  test.each([
    'Pour pique-niquer',
    'un pique-nique',
    'des pique-niqueurs',
    'Il est en retard',
    'un cul-de-sac',
    'des culs-de-sac',
    'un cul-de-poule',
    'cul sec',
    'chili con carne',
    'café con leche',
    'la gueule de bois',
    'un casse-gueule',
    'des amuse-gueules',
    'une tapette à mouches',
    'du pain bâtard',
    'un chien bâtard',
    'Suprême NTM',
    'Le Dîner de cons',
    'diner de con',
    'Moby Dick',
    'une chatte et ses chatons',
    'sucer un glaçon',
    'Scunthorpe',
    'Conrad',
    'Constitution',
    'Canberra',
    'un cône',
    'une bitte d’amarrage',
    'Concarneau',
    'Vaucouleurs',
    'Bassecourt',
    'Marie-Hélène',
    'un 4x4',
    '1789',
    '100 €',
    'Louis XIV',
  ])('« %s » accepté', (text) => {
    expect(containsForbiddenWord(text)).toBe(false)
  })
})

describe('Filtre des mots interdits : insultes refusées', () => {
  test.each([
    'Connard',
    'des PUTES',
    'Enculé',
    'puuuute',
    'connnnard',
    'p.u.t.e',
    'p u t e',
    'm3rde',
    's4lope',
    's@lope',
    'fils-de-pute',
    'pique-nique de pute',
    'dîner de cons de merde',
    'cul sec, gros con',
    'l’enculé',
  ])('« %s » refusé', (text) => {
    expect(containsForbiddenWord(text)).toBe(true)
  })
})

describe('Filtre : réponses et pseudos', () => {
  test('« Hitler » et « nazi » acceptés en réponse, refusés en pseudo', () => {
    expect(containsForbiddenWord('Hitler')).toBe(false)
    expect(containsForbiddenWord('les nazis')).toBe(false)
    expect(containsForbiddenNameWord('Hitler')).toBe(true)
    expect(isAllowedPlayerName('Hitler')).toBe(false)
    expect(isAllowedPlayerName('Mr Nazi')).toBe(false)
  })

  test('un pseudo suit aussi la liste des réponses', () => {
    expect(isAllowedPlayerName('pique-niquer')).toBe(true)
    expect(isAllowedPlayerName('Puuuute')).toBe(false)
  })
})
