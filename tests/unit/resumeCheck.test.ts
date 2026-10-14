import { describe, expect, test, vi } from 'vitest'

import type { ResumeRead } from '../../shared/hostEngine'
import { runResumeCheck, type ResumeCheckDeps } from '../../shared/resumeCheck'

const HOST = 'host-uid'
const NOW = 10_000_000
const MIN = 60_000

function deps(read: ResumeRead | (() => Promise<ResumeRead>), overrides: Partial<ResumeCheckDeps> = {}): ResumeCheckDeps {
  return {
    uid: async () => HOST,
    readGame: typeof read === 'function' ? read : async () => read,
    serverNow: async () => NOW,
    deleteGame: vi.fn(async () => undefined),
    forgetCode: vi.fn(async () => undefined),
    log: () => undefined,
    ...overrides,
  }
}

const found = (status: string, hostLeftAt?: number, hostUid = HOST): ResumeRead =>
  ({ kind: 'found', game: { hostUid, status, hostLeftAt } }) as ResumeRead

describe('Vérification du bouton « Reprendre la partie »', () => {
  test('partie en cours, quittée par le retour (hostLeftAt il y a 2 min) : bouton gardé, rien d’effacé', async () => {
    const d = deps(found('paused', NOW - 2 * MIN))
    expect(await runResumeCheck('ABCD', d)).toBe('shown')
    expect(d.forgetCode).not.toHaveBeenCalled()
    expect(d.deleteGame).not.toHaveBeenCalled()
  })

  test('hôte absent depuis 6 min : la partie est supprimée, puis le code oublié', async () => {
    const d = deps(found('paused', NOW - 6 * MIN))
    expect(await runResumeCheck('ABCD', d)).toBe('forgotten')
    expect(d.deleteGame).toHaveBeenCalledWith('ABCD')
    expect(d.forgetCode).toHaveBeenCalled()
  })

  test('partie terminée récente : code oublié sans supprimer la partie (podium des joueurs)', async () => {
    const d = deps(found('ended', NOW - MIN))
    expect(await runResumeCheck('ABCD', d)).toBe('forgotten')
    expect(d.deleteGame).not.toHaveBeenCalled()
  })

  test('partie absente ou d’un autre hôte : code oublié, rien supprimé', async () => {
    for (const read of [{ kind: 'missing' } as const, found('paused', NOW - 6 * MIN, 'other')]) {
      const d = deps(read)
      expect(await runResumeCheck('ABCD', d)).toBe('forgotten')
      expect(d.deleteGame).not.toHaveBeenCalled()
    }
  })

  test('doute : lecture échouée, connexion qui plante, heure du serveur qui plante → bouton gardé, rien d’effacé', async () => {
    const cases: ResumeCheckDeps[] = [
      deps({ kind: 'failed' }),
      deps(found('paused'), { uid: async () => Promise.reject(new Error('hors ligne')) }),
      deps(async () => Promise.reject(new Error('refus'))),
      deps(found('paused', NOW - 6 * MIN), { serverNow: async () => Promise.reject(new Error('offset')) }),
    ]
    for (const d of cases) {
      expect(await runResumeCheck('ABCD', d)).toBe('retry')
      expect(d.forgetCode).not.toHaveBeenCalled()
      expect(d.deleteGame).not.toHaveBeenCalled()
    }
  })

  test('suppression refusée ou réseau coupé pendant la suppression : code gardé, nouvel essai', async () => {
    const d = deps(found('paused', NOW - 6 * MIN), { deleteGame: vi.fn(async () => Promise.reject(new Error('réseau'))) })
    expect(await runResumeCheck('ABCD', d)).toBe('retry')
    expect(d.forgetCode).not.toHaveBeenCalled()
  })

  test('chaque vérification écrit des lignes [resume]', async () => {
    const lines: string[] = []
    await runResumeCheck('ABCD', deps(found('paused', NOW - 6 * MIN), { log: (line) => lines.push(line) }))
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.every((line) => line.startsWith('[resume] ABCD'))).toBe(true)
  })
})
