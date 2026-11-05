import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { CONNECTIVITY_CHECK_EVERY_MS, CONNECTIVITY_GRACE_MS, CONNECTIVITY_OFFLINE_POLL_MS, createConnectivityMonitor } from '../../shared/connectivity'

function setup(initialReachable = true) {
  const state = { reachable: initialReachable }
  const changes: boolean[] = []
  const probe = vi.fn(async () => state.reachable)
  const monitor = createConnectivityMonitor({ probe, onChange: (value) => changes.push(value) })
  return { state, changes, probe, monitor }
}

const advance = (ms: number) => vi.advanceTimersByTimeAsync(ms)

describe('Surveillance du réseau', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('serveur joignable : rien ne change, nouvelle vérification périodique', async () => {
    const { changes, probe, monitor } = setup()
    monitor.start()
    await advance(0)
    expect(probe).toHaveBeenCalledTimes(1)
    await advance(CONNECTIVITY_CHECK_EVERY_MS)
    expect(probe).toHaveBeenCalledTimes(2)
    expect(changes).toEqual([])
    monitor.stop()
  })

  test('au lancement sans réseau : hors ligne après la confirmation, pas au premier échec', async () => {
    const { changes, monitor } = setup(false)
    monitor.start()
    await advance(CONNECTIVITY_GRACE_MS - 1)
    expect(changes).toEqual([])
    await advance(1)
    expect(changes).toEqual([false])
    monitor.stop()
  })

  test('coupure brève : le second appel réussit, aucun panneau', async () => {
    const { state, changes, monitor } = setup()
    monitor.start()
    await advance(0)
    state.reachable = false
    monitor.connectedChanged(false)
    await advance(CONNECTIVITY_GRACE_MS)
    state.reachable = true
    await advance(CONNECTIVITY_GRACE_MS)
    expect(changes).toEqual([])
    monitor.stop()
  })

  test('Wi-Fi sans internet avec une connexion à la base encore « vraie » : l’appel réel le détecte', async () => {
    const { state, changes, monitor } = setup()
    monitor.start()
    monitor.connectedChanged(true)
    await advance(0)
    state.reachable = false
    await advance(CONNECTIVITY_CHECK_EVERY_MS + CONNECTIVITY_GRACE_MS)
    expect(changes).toEqual([false])
    monitor.stop()
  })

  test('hors ligne : retour automatique dès que le serveur répond, ou dès que la base se reconnecte', async () => {
    const first = setup(false)
    first.monitor.start()
    await advance(CONNECTIVITY_GRACE_MS)
    first.state.reachable = true
    await advance(CONNECTIVITY_OFFLINE_POLL_MS)
    expect(first.changes).toEqual([false, true])
    first.monitor.stop()

    const second = setup(false)
    second.monitor.start()
    await advance(CONNECTIVITY_GRACE_MS)
    second.monitor.connectedChanged(true)
    expect(second.changes).toEqual([false, true])
    second.monitor.stop()
  })

  test('« Réessayer » : un appel tout de suite, résultat rendu ; un appel qui plante vaut un échec', async () => {
    const { state, changes, probe, monitor } = setup(false)
    monitor.start()
    await advance(CONNECTIVITY_GRACE_MS)
    await expect(monitor.retry()).resolves.toBe(false)
    state.reachable = true
    await expect(monitor.retry()).resolves.toBe(true)
    expect(changes).toEqual([false, true])
    probe.mockRejectedValueOnce(new Error('réseau'))
    await expect(monitor.retry()).resolves.toBe(false)
    expect(changes).toEqual([false, true, false])
    monitor.stop()
  })

  test('arrêté : plus aucun appel ni changement', async () => {
    const { probe, changes, monitor } = setup(false)
    monitor.start()
    monitor.stop()
    await advance(60_000)
    expect(probe).toHaveBeenCalledTimes(1)
    expect(changes).toEqual([])
  })
})
