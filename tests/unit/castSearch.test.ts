import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { CAST_RESCUE_RESTART_MS, CAST_SEARCH_LIMIT_MS, startCastSearch, type CastSearchDeps } from '../../shared/castSearch'

function setup(options: { devices?: number; foreground?: boolean } = {}) {
  const state = { devices: options.devices ?? 0, foreground: options.foreground ?? true }
  const restart = vi.fn()
  const onDone = vi.fn()
  const deps: CastSearchDeps = {
    now: () => Date.now(),
    setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
    clearTimer: (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
    isForeground: () => state.foreground,
    deviceCount: () => Promise.resolve(state.devices),
    restart,
    log: () => {},
  }
  const search = startCastSearch(deps, onDone)
  return { state, restart, onDone, search }
}

describe('Attente des TV avant la liste Cast (iOS)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('une TV vue ouvre la liste aussitôt, sans attendre', () => {
    const { search, onDone, restart } = setup()
    search.devicesSeen(1)
    expect(onDone).toHaveBeenCalledWith(true)
    vi.advanceTimersByTime(CAST_SEARCH_LIMIT_MS)
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(restart).not.toHaveBeenCalled()
  })

  test('une liste vide reçue du SDK ne termine pas l’attente', () => {
    const { search, onDone } = setup()
    search.devicesSeen(0)
    expect(onDone).not.toHaveBeenCalled()
  })

  test('relance de secours à 3 s, puis « Aucune TV trouvée » à la limite', async () => {
    const { onDone, restart } = setup()
    vi.advanceTimersByTime(CAST_RESCUE_RESTART_MS)
    expect(restart).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(CAST_SEARCH_LIMIT_MS - CAST_RESCUE_RESTART_MS)
    expect(onDone).toHaveBeenCalledWith(false)
  })

  test('à la limite, une TV déjà connue ouvre la liste', async () => {
    const { state, onDone } = setup()
    state.devices = 2
    await vi.advanceTimersByTimeAsync(CAST_SEARCH_LIMIT_MS)
    expect(onDone).toHaveBeenCalledWith(true)
  })

  test('hors du premier plan, la limite attend le retour, qui relance les minuteries', async () => {
    const { state, search, onDone, restart } = setup({ foreground: false })
    await vi.advanceTimersByTimeAsync(CAST_SEARCH_LIMIT_MS + 5000)
    expect(onDone).not.toHaveBeenCalled()
    state.foreground = true
    search.foreground()
    await vi.advanceTimersByTimeAsync(CAST_RESCUE_RESTART_MS)
    expect(restart).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(CAST_SEARCH_LIMIT_MS - CAST_RESCUE_RESTART_MS)
    expect(onDone).toHaveBeenCalledWith(false)
  })

  test('annulée : plus rien ne se passe', async () => {
    const { search, onDone, restart } = setup()
    search.cancel()
    search.devicesSeen(1)
    await vi.advanceTimersByTimeAsync(CAST_SEARCH_LIMIT_MS)
    expect(onDone).not.toHaveBeenCalled()
    expect(restart).not.toHaveBeenCalled()
  })
})
