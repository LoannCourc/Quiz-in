import { describe, expect, test } from 'vitest'

import { compareVersions, parseVersion } from '../../shared/appVersion'

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
