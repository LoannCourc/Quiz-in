import { describe, expect, test } from 'vitest'

import {
  canRemindUpdate,
  compareVersions,
  MAX_UPDATE_REMINDERS,
  parsePlatformUpdateConfig,
  parseUpdateReminders,
  parseVersion,
  remindedUpdate,
  updatePromptFor,
  type PlatformUpdateConfig,
} from '../../shared/appVersion'

describe('Versions de l’app : lecture', () => {
  test('un à trois nombres, les manquants valent 0', () => {
    expect(parseVersion('1.1.0')).toEqual([1, 1, 0])
    expect(parseVersion('1.1')).toEqual([1, 1, 0])
    expect(parseVersion('2')).toEqual([2, 0, 0])
    expect(parseVersion(' 1.2.3 ')).toEqual([1, 2, 3])
  })

  test('illisible : null', () => {
    for (const value of ['', '1.', '.1', '1.1.0.0', 'v1.1.0', '1.1.0-beta', '1,1', 'abc', '12345.0', null, undefined, 110, {}]) {
      expect(parseVersion(value)).toBeNull()
    }
  })
})

describe('Versions de l’app : comparaison en nombres, pas en texte', () => {
  test('1.10.0 est plus récente que 1.9.0 (en texte, ce serait l’inverse)', () => {
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0)
    expect(compareVersions('1.9.0', '1.10.0')).toBeLessThan(0)
  })

  test('correctif, mineure, majeure', () => {
    expect(compareVersions('1.1.0', '1.1.1')).toBeLessThan(0)
    expect(compareVersions('1.1.9', '1.2.0')).toBeLessThan(0)
    expect(compareVersions('1.99.99', '2.0.0')).toBeLessThan(0)
    expect(compareVersions('2.0.0', '1.99.99')).toBeGreaterThan(0)
  })

  test('égales, aussi écrites autrement', () => {
    expect(compareVersions('1.1.0', '1.1.0')).toBe(0)
    expect(compareVersions('1.1', '1.1.0')).toBe(0)
  })

  test('une version illisible : null (jamais de décision sur une valeur douteuse)', () => {
    expect(compareVersions('1.1.0', 'dernière')).toBeNull()
    expect(compareVersions(undefined, '1.1.0')).toBeNull()
  })
})

const PLAY = 'https://play.google.com/store/apps/details?id=com.herocorp.quizin'
const APP_STORE = 'https://apps.apple.com/app/id6820975402'
const TODAY = '2026-10-27'

function android(overrides: Record<string, unknown> = {}) {
  return { latest: '1.2.0', minimum: '1.0.0', storeUrl: PLAY, enabled: true, ...overrides }
}

describe('Config config/appVersion : lecture', () => {
  test('valide : gardée telle quelle', () => {
    expect(parsePlatformUpdateConfig(android(), 'android')).toEqual({ latest: '1.2.0', minimum: '1.0.0', storeUrl: PLAY })
    expect(parsePlatformUpdateConfig(android({ storeUrl: APP_STORE }), 'ios')).not.toBeNull()
  })

  test('absente, désactivée ou mal formée : null (rien n’est affiché)', () => {
    for (const raw of [null, undefined, '1.2.0', 42, [], {}]) expect(parsePlatformUpdateConfig(raw, 'android')).toBeNull()
    for (const overrides of [{ enabled: false }, { enabled: undefined }, { enabled: 'true' }, { latest: '1.2.0.0' }, { minimum: undefined }, { latest: 120 }]) {
      expect(parsePlatformUpdateConfig(android(overrides), 'android')).toBeNull()
    }
  })

  test('minimum supérieure à latest : null ; égale : acceptée', () => {
    expect(parsePlatformUpdateConfig(android({ minimum: '1.3.0' }), 'android')).toBeNull()
    expect(parsePlatformUpdateConfig(android({ minimum: '1.2.0' }), 'android')).not.toBeNull()
  })

  test('adresse hors de la fiche du store de la plateforme : null', () => {
    for (const storeUrl of [
      'http://play.google.com/store/apps/details?id=com.herocorp.quizin',
      'https://play.google.com.evil.example/store',
      'https://example.com/quizin',
      'market://details?id=com.herocorp.quizin',
      APP_STORE,
      PLAY + 'x'.repeat(400),
      7,
    ]) {
      expect(parsePlatformUpdateConfig(android({ storeUrl }), 'android')).toBeNull()
    }
    expect(parsePlatformUpdateConfig(android(), 'ios')).toBeNull()
  })
})

describe('Popup doux : au plus une fois par jour, trois fois par valeur de latest', () => {
  test('jamais montré : oui ; même jour : non ; jour suivant : oui ; après 3 fois : plus pour cette version', () => {
    expect(canRemindUpdate(null, '1.2.0', TODAY)).toBe(true)
    let reminders = remindedUpdate(null, '1.2.0', TODAY)
    expect(reminders).toEqual({ latest: '1.2.0', count: 1, lastDay: TODAY })
    expect(canRemindUpdate(reminders, '1.2.0', TODAY)).toBe(false)
    expect(canRemindUpdate(reminders, '1.2.0', '2026-10-28')).toBe(true)
    reminders = remindedUpdate(reminders, '1.2.0', '2026-10-28')
    reminders = remindedUpdate(reminders, '1.2.0', '2026-10-30')
    expect(reminders.count).toBe(MAX_UPDATE_REMINDERS)
    expect(canRemindUpdate(reminders, '1.2.0', '2026-11-15')).toBe(false)
  })

  test('nouvelle valeur de latest : compte remis à zéro (1.2 et 1.2.0 sont la même)', () => {
    const exhausted = { latest: '1.2.0', count: 3, lastDay: '2026-10-30' }
    expect(canRemindUpdate(exhausted, '1.2', '2026-10-31')).toBe(false)
    expect(canRemindUpdate(exhausted, '1.2.1', '2026-10-30')).toBe(true)
    expect(remindedUpdate(exhausted, '1.2.1', '2026-10-30')).toEqual({ latest: '1.2.1', count: 1, lastDay: '2026-10-30' })
  })

  test('rappels gardés illisibles : ignorés', () => {
    for (const raw of [
      null,
      'x',
      { latest: '1.2.0' },
      { latest: 'abc', count: 1, lastDay: TODAY },
      { latest: '1.2.0', count: -1, lastDay: TODAY },
      { latest: '1.2.0', count: 1.5, lastDay: TODAY },
    ]) {
      expect(parseUpdateReminders(raw)).toBeNull()
    }
    expect(parseUpdateReminders({ latest: '1.2.0', count: 2, lastDay: TODAY })).toEqual({ latest: '1.2.0', count: 2, lastDay: TODAY })
  })
})

describe('Ce que l’accueil affiche', () => {
  const config = (overrides: Partial<PlatformUpdateConfig> = {}): PlatformUpdateConfig => ({
    latest: '1.2.0',
    minimum: '1.0.0',
    storeUrl: PLAY,
    ...overrides,
  })

  test('à jour, ou plus récente que la config : rien', () => {
    expect(updatePromptFor('1.2.0', config(), null, TODAY)).toEqual({ kind: 'none' })
    expect(updatePromptFor('1.3.0', config(), null, TODAY)).toEqual({ kind: 'none' })
  })

  test('sortie de la 1.1.0 : latest = 1.1.0, aucun popup pour les premiers utilisateurs', () => {
    expect(updatePromptFor('1.1.0', config({ latest: '1.1.0' }), null, TODAY)).toEqual({ kind: 'none' })
  })

  test('sous latest : popup doux, selon les rappels', () => {
    expect(updatePromptFor('1.1.0', config(), null, TODAY)).toEqual({ kind: 'soft', latest: '1.2.0', storeUrl: PLAY })
    expect(updatePromptFor('1.1.0', config(), { latest: '1.2.0', count: 1, lastDay: TODAY }, TODAY)).toEqual({ kind: 'none' })
  })

  test('sous minimum : écran obligatoire, même après trois rappels', () => {
    const exhausted = { latest: '1.2.0', count: 3, lastDay: TODAY }
    expect(updatePromptFor('1.1.0', config({ minimum: '1.2.0' }), exhausted, TODAY)).toEqual({ kind: 'required', storeUrl: PLAY })
    expect(updatePromptFor('1.1.9', config({ minimum: '1.1.10', latest: '1.1.10' }), null, TODAY).kind).toBe('required')
  })

  test('config invalide (minimum au-dessus de latest, adresse hors des stores) : ni popup ni écran obligatoire', () => {
    for (const raw of [android({ minimum: '9.0.0' }), android({ minimum: '1.2.0', storeUrl: 'https://example.com/quizin' })]) {
      expect(updatePromptFor('1.0.0', parsePlatformUpdateConfig(raw, 'android'), null, TODAY)).toEqual({ kind: 'none' })
    }
  })

  test('config absente, ou version de l’app illisible : rien', () => {
    expect(updatePromptFor('1.0.0', null, null, TODAY)).toEqual({ kind: 'none' })
    expect(updatePromptFor(undefined, config({ minimum: '1.2.0' }), null, TODAY)).toEqual({ kind: 'none' })
  })
})
