import { describe, expect, test, vi } from 'vitest'

import { createEnsureSignedIn } from '../../shared/signIn'

// Faux Firebase Auth : utilisateur courant, connexions anonymes comptées (chacune crée un compte).
function fakeAuth(options: { failFirst?: boolean } = {}) {
  let current: { uid: string } | null = null
  let accounts = 0
  let failures = options.failFirst ? 1 : 0
  const signIn = vi.fn(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5))
    if (failures > 0) {
      failures -= 1
      throw new Error('auth/network-request-failed')
    }
    accounts += 1
    current = { uid: `compte-${accounts}` }
    return current
  })
  const ensure = createEnsureSignedIn({ ready: async () => undefined, current: () => current, signIn })
  return { ensure, signIn, accounts: () => accounts }
}

describe('Connexion anonyme : une seule à la fois pour tous les écrans', () => {
  test('premier lancement : trois écrans demandent la connexion en même temps → un seul compte, le même pour tous', async () => {
    const auth = fakeAuth()
    const users = await Promise.all([auth.ensure(), auth.ensure(), auth.ensure()])
    expect(auth.signIn).toHaveBeenCalledTimes(1)
    expect(auth.accounts()).toBe(1)
    expect(new Set(users.map((user) => user.uid))).toEqual(new Set(['compte-1']))
  })

  test('déjà connecté (relance de l’app) : utilisateur réutilisé, aucune nouvelle connexion', async () => {
    const auth = fakeAuth()
    await auth.ensure()
    await auth.ensure()
    expect(auth.signIn).toHaveBeenCalledTimes(1)
  })

  test('échec (réseau) : tous les appelants en attente le reçoivent, l’appel suivant réessaie', async () => {
    const auth = fakeAuth({ failFirst: true })
    const results = await Promise.allSettled([auth.ensure(), auth.ensure()])
    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected'])
    expect(auth.signIn).toHaveBeenCalledTimes(1)
    expect((await auth.ensure()).uid).toBe('compte-1')
    expect(auth.signIn).toHaveBeenCalledTimes(2)
  })

  test('restauration d’une session enregistrée attendue avant de décider', async () => {
    let restored: { uid: string } | null = null
    const signIn = vi.fn(async () => ({ uid: 'nouveau' }))
    const ensure = createEnsureSignedIn({
      ready: async () => {
        restored = { uid: 'enregistré' }
      },
      current: () => restored,
      signIn,
    })
    expect((await ensure()).uid).toBe('enregistré')
    expect(signIn).not.toHaveBeenCalled()
  })
})
