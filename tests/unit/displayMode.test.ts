import { describe, expect, test } from 'vitest'

import {
  chromeMajorVersion,
  INITIAL_AUTO_LIGHT,
  isLightActive,
  isOldChrome,
  nextAutoLight,
  readCastLight,
  readDisplaySetting,
  type AutoLightState,
  type FrameWindow,
} from '../../shared/displayMode'

// Une seconde mesurée à fps images par seconde, avec le plus long écart entre deux images.
function second(fps: number, at: number, maxGapMs = 1000 / Math.max(1, fps)): FrameWindow {
  return { frames: fps, elapsedMs: 1000, maxGapMs, at }
}

function run(windows: FrameWindow[], from: AutoLightState = INITIAL_AUTO_LIGHT): AutoLightState {
  return windows.reduce(nextAutoLight, from)
}

describe('Mode allégé de la TV', () => {
  test('réglage lu dans l’adresse ou un message : auto, on, off, 1, 0 ; le reste est ignoré', () => {
    expect(readDisplaySetting('on')).toBe('on')
    expect(readDisplaySetting('1')).toBe('on')
    expect(readDisplaySetting('0')).toBe('off')
    expect(readDisplaySetting('auto')).toBe('auto')
    expect(readDisplaySetting('oui')).toBeNull()
    expect(readCastLight({ light: 'on' })).toBe('on')
    expect(readCastLight({ code: 'ABCD' })).toBeNull()
    expect(readCastLight({ light: 'beaucoup' })).toBeNull()
  })

  test('Chrome 92 et plus ancien (box Android TV) : allégé d’office en automatique', () => {
    const bbox = 'Mozilla/5.0 (Linux; Android 9; Bbox 4K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 CrKey/1.56.500000'
    expect(chromeMajorVersion(bbox)).toBe(92)
    expect(isOldChrome(chromeMajorVersion(bbox))).toBe(true)
    expect(isOldChrome(130)).toBe(false)
    expect(isOldChrome(chromeMajorVersion('Mozilla/5.0 (Macintosh) Safari/605.1.15'))).toBe(false)
  })

  test('automatique : 3 secondes de suite sous 40 images/s allègent (l’écran de fin de la box à 2 images/s)', () => {
    const state = run([second(2, 1000), second(2, 2000), second(3, 3000)])
    expect(state.reason).toBe('slow')
    expect(state.triggeredAt).toBe(3000)
    expect(isLightActive('auto', state)).toBe(true)
  })

  test('automatique : une seconde correcte remet le compte à zéro ; un affichage fluide ne déclenche jamais', () => {
    const state = run([second(20, 1000), second(20, 2000), second(55, 3000), second(20, 4000), second(20, 5000)])
    expect(state.reason).toBeNull()
    expect(state.slowStreak).toBe(2)
    expect(state.lastFps).toBe(20)
    expect(run(Array.from({ length: 60 }, (_, index) => second(60, index * 1000))).reason).toBeNull()
    // Box mesurée au salon : 48 à 50 images/s, au-dessus du seuil.
    expect(run([second(48, 1000), second(49, 2000), second(50, 3000)]).reason).toBeNull()
  })

  test('automatique : affichage figé plus de 2 s d’un coup (battement de 2,4 s mesuré sur la box) : allégé tout de suite', () => {
    expect(run([second(45, 1000, 2400)]).reason).toBe('freeze')
    // Figé plus d’une seconde : la seconde compte comme lente, même avec assez d’images.
    expect(run([second(45, 1000, 1200), second(45, 2000, 1100), second(45, 3000, 1500)]).reason).toBe('slow')
  })

  test('automatique : une page masquée ou suspendue (aucune image, écart de 10 s et plus) ne compte pas', () => {
    expect(run([second(0, 1000), { frames: 1, elapsedMs: 12_000, maxGapMs: 12_000, at: 13_000 }]).reason).toBeNull()
  })

  test('forcé, désactivé, et une fois allégé, l’automatique le reste', () => {
    const triggered = run([second(2, 1000), second(2, 2000), second(2, 3000)])
    expect(run([second(60, 4000)], triggered)).toBe(triggered)
    expect(isLightActive('on', INITIAL_AUTO_LIGHT)).toBe(true)
    expect(isLightActive('off', triggered)).toBe(false)
  })
})
