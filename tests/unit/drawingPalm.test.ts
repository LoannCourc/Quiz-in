import { describe, expect, test } from 'vitest'

import { isPalmContact, PALM_CONTACT_PX } from '../../shared/drawing/palm'

describe('isPalmContact (paume posée sur le dessin)', () => {
  const touch = (size: number) => ({ pointerType: 'touch', width: size, height: size })

  test('Android : contact large ignoré, doigt accepté', () => {
    expect(isPalmContact(touch(PALM_CONTACT_PX + 1), false)).toBe(true)
    expect(isPalmContact(touch(30), false)).toBe(false)
    expect(isPalmContact(touch(PALM_CONTACT_PX), false)).toBe(false)
  })

  test('iPhone et iPad : jamais de paume (WebKit donne deux fois le rayon du doigt, souvent 40 à 60 px)', () => {
    for (const size of [30, 41.7, 62.5, 83.4]) expect(isPalmContact(touch(size), true)).toBe(false)
  })

  test('souris et stylet : jamais de paume', () => {
    expect(isPalmContact({ pointerType: 'mouse', width: 100, height: 100 }, false)).toBe(false)
    expect(isPalmContact({ pointerType: 'pen', width: 100, height: 100 }, false)).toBe(false)
  })
})
