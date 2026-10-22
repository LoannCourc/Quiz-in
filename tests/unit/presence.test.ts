import { describe, expect, test, vi } from 'vitest'

import { trackPresence, type PresenceDeps } from '../../shared/presence'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

// Faux Firebase : journal des écritures dans l'ordre, connexion déclenchée à la main.
function fake(overrides: Partial<PresenceDeps> = {}) {
  const log: string[] = []
  let connect = () => undefined as void
  const unwatch = vi.fn()
  const deps: PresenceDeps = {
    watchConnection: (onConnected) => {
      connect = onConnected
      return unwatch
    },
    armDisconnect: async () => void log.push('arm'),
    cancelDisconnect: async () => void log.push('cancel'),
    setConnected: async (connected) => void log.push(`connected=${connected}`),
    warn: vi.fn(),
    ...overrides,
  }
  return { deps, log, unwatch, connect: () => connect() }
}

describe('Présence d’un joueur : connexion, départ de l’écran, reconnexion', () => {
  test('connexion : écriture programmée d’abord, puis connected = true', async () => {
    const f = fake()
    trackPresence(f.deps)
    f.connect()
    await flush()
    expect(f.log).toEqual(['arm', 'connected=true'])
  })

  test('reconnexion : la même séquence recommence', async () => {
    const f = fake()
    trackPresence(f.deps)
    f.connect()
    await flush()
    f.connect()
    await flush()
    expect(f.log).toEqual(['arm', 'connected=true', 'arm', 'connected=true'])
  })

  test('écran quitté : connected = false tout de suite, écriture programmée annulée, écoute arrêtée', async () => {
    const f = fake()
    const tracker = trackPresence(f.deps)
    f.connect()
    await flush()
    tracker.leave()
    await flush()
    expect(f.log).toEqual(['arm', 'connected=true', 'connected=false', 'cancel'])
    expect(f.unwatch).toHaveBeenCalledTimes(1)
  })

  test('écran quitté pendant que true est encore en route : rien n’est écrit après false', async () => {
    let releaseArm = () => undefined as void
    const f = fake()
    f.deps.armDisconnect = () =>
      new Promise<void>((resolve) => {
        f.log.push('arm')
        releaseArm = resolve
      })
    const tracker = trackPresence(f.deps)
    f.connect()
    tracker.leave()
    await flush()
    releaseArm()
    await flush()
    expect(f.log).toEqual(['arm', 'connected=false', 'cancel'])
  })

  test('connexion signalée après le départ : ignorée', async () => {
    const f = fake()
    const tracker = trackPresence(f.deps)
    tracker.leave()
    f.connect()
    await flush()
    expect(f.log).toEqual(['connected=false', 'cancel'])
  })

  test('départ répété (démontage) : écrit une seule fois', async () => {
    const f = fake()
    const tracker = trackPresence(f.deps)
    tracker.leave()
    tracker.leave()
    await flush()
    expect(f.log).toEqual(['connected=false', 'cancel'])
  })

  test('fin du suivi sans départ (changement de joueur) : rien n’est écrit', async () => {
    const f = fake()
    const tracker = trackPresence(f.deps)
    tracker.stop()
    f.connect()
    await flush()
    expect(f.log).toEqual([])
    expect(f.unwatch).toHaveBeenCalledTimes(1)
  })

  test('entrée déjà retirée (exclusion, « Je joue aussi » arrêté) : refus ignoré, sans exception ni avertissement', async () => {
    const denied = new Error('PERMISSION_DENIED')
    const f = fake({ setConnected: async () => Promise.reject(denied), cancelDisconnect: () => { throw denied } })
    const tracker = trackPresence(f.deps)
    expect(() => tracker.leave()).not.toThrow()
    await flush()
    expect(f.deps.warn).not.toHaveBeenCalled()
  })

  test('échec à la connexion : signalé, sans exception', async () => {
    const f = fake({ armDisconnect: async () => Promise.reject(new Error('réseau')) })
    trackPresence(f.deps)
    f.connect()
    await flush()
    expect(f.deps.warn).toHaveBeenCalledTimes(1)
  })
})
