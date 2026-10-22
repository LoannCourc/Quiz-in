import { afterEach, describe, expect, test, vi } from 'vitest'

import { claimRoomCode, createGameFailureOf, TimeoutError, withTimeout, type ClaimDeps } from '../../shared/gameCreation'

const DENIED = new Error('PERMISSION_DENIED: Permission denied')

// Codes tirés dans l'ordre ; taken : codes déjà pris à la première lecture ; takenAfterWrite : pris entre la
// lecture et l'écriture (un autre hôte) ; write : résultat de l'écriture.
function deps(options: { taken?: string[]; takenAfterWrite?: string[]; write?: (code: string) => Promise<void> } = {}) {
  const codes = ['AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF']
  const written = new Set<string>()
  const d: ClaimDeps = {
    generateCode: vi.fn(() => codes.shift() ?? 'ZZZZ'),
    isCodeTaken: vi.fn(async (code: string) => options.taken?.includes(code) || (written.has(code) && (options.takenAfterWrite?.includes(code) ?? false))),
    writeGame: vi.fn(async (code: string) => {
      written.add(code)
      if (options.takenAfterWrite?.includes(code)) throw DENIED
      await options.write?.(code)
    }),
  }
  return d
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Création d’une partie : tirage du code et cause d’un échec', () => {
  test('premier code libre : partie créée', async () => {
    expect(await claimRoomCode(deps())).toEqual({ ok: true, code: 'AAAA' })
  })

  test('codes déjà pris : on tire le suivant', async () => {
    const d = deps({ taken: ['AAAA', 'BBBB'] })
    expect(await claimRoomCode(d)).toEqual({ ok: true, code: 'CCCC' })
    expect(d.writeGame).toHaveBeenCalledTimes(1)
  })

  test('code pris entre la lecture et l’écriture (refus relu, hostUid présent) : on retente', async () => {
    const d = deps({ takenAfterWrite: ['AAAA'] })
    expect(await claimRoomCode(d)).toEqual({ ok: true, code: 'BBBB' })
  })

  test('partie refusée par les règles (hostUid absent à la relecture) : « refused » tout de suite, sans autre tirage', async () => {
    const d = deps({ write: async () => Promise.reject(DENIED) })
    const outcome = await claimRoomCode(d)
    expect(outcome).toEqual({ ok: false, failure: 'refused', cause: DENIED })
    expect(d.writeGame).toHaveBeenCalledTimes(1)
  })

  test('tous les codes tirés déjà pris : « codeTaken »', async () => {
    const d = deps({ taken: ['AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE'] })
    expect(await claimRoomCode(d)).toEqual({ ok: false, failure: 'codeTaken' })
    expect(d.writeGame).not.toHaveBeenCalled()
  })

  test('hors ligne à la lecture : « offline »', async () => {
    const offline = new Error('Error: Client is offline.')
    const d = deps()
    d.isCodeTaken = async () => Promise.reject(offline)
    expect(await claimRoomCode(d)).toEqual({ ok: false, failure: 'offline', cause: offline })
  })

  test('écriture sans réponse : délai dépassé, « offline »', async () => {
    vi.useFakeTimers()
    const d = deps({ write: () => new Promise<void>(() => undefined) })
    const write = d.writeGame
    d.writeGame = (code) => withTimeout(write(code), 10_000)
    const pending = claimRoomCode(d)
    await vi.advanceTimersByTimeAsync(10_000)
    const outcome = await pending
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) {
      expect(outcome.failure).toBe('offline')
      expect(outcome.cause).toBeInstanceOf(TimeoutError)
    }
  })

  test('autre erreur : « unknown », avec l’erreur réelle', async () => {
    const strange = new Error('Quelque chose d’inattendu')
    expect(await claimRoomCode(deps({ write: async () => Promise.reject(strange) }))).toEqual({ ok: false, failure: 'unknown', cause: strange })
  })

  test('classement des messages Firebase', () => {
    expect(createGameFailureOf(new Error('permission_denied at /sessions/ABCD'))).toBe('refused')
    expect(createGameFailureOf(new Error('Firebase: Error (auth/network-request-failed).'))).toBe('offline')
    expect(createGameFailureOf(new TimeoutError())).toBe('offline')
    expect(createGameFailureOf('bizarre')).toBe('unknown')
  })

  test('withTimeout : la valeur passe si elle arrive à temps', async () => {
    await expect(withTimeout(Promise.resolve(42), 1000)).resolves.toBe(42)
  })
})
