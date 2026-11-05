// Connexion anonyme à Firebase : un seul chemin pour l'app, le site des joueurs et la TV.
// Au premier lancement, plusieurs écrans demandent la connexion en même temps (interrupteurs, catalogue). Si
// chacun lançait sa propre connexion anonyme, plusieurs comptes seraient créés et la connexion à la base pourrait
// rester authentifiée avec l'un d'eux alors que l'app écrit au nom d'un autre : écriture refusée par les règles
// (hostUid, players/{uid}, tvPresence/{uid}). Ici, une connexion en cours est partagée par tous les appelants.

export interface SignInDeps<User> {
  // Attend la restauration d'une session enregistrée (Firebase : auth.authStateReady()).
  ready: () => Promise<void>
  current: () => User | null
  // Nouvelle connexion anonyme (Firebase : signInAnonymously).
  signIn: () => Promise<User>
}

export function createEnsureSignedIn<User>(deps: SignInDeps<User>): () => Promise<User> {
  let pending: Promise<User> | null = null
  return async () => {
    await deps.ready()
    const user = deps.current()
    if (user) return user
    // Échec : la connexion suivante réessaie.
    pending ??= deps.signIn().finally(() => {
      pending = null
    })
    return pending
  }
}

// Le compte gardé par le navigateur n'existe plus : seule une nouvelle connexion peut marcher.
const ACCOUNT_GONE_CODES = ['auth/user-token-expired', 'auth/user-not-found', 'auth/user-disabled', 'auth/invalid-user-token']

export interface RefreshDeps {
  // Jeton renouvelé auprès du serveur (Firebase : getIdToken(true)) ; rien à faire sans utilisateur.
  refreshToken: () => Promise<unknown>
  signOut: () => Promise<void>
}

// Lecture refusée alors que la partie peut exister : jeton renouvelé ; compte disparu, déconnexion (la connexion
// suivante en crée un autre). Réseau coupé : on garde le compte, le joueur retrouvera sa place.
export async function refreshAfterRefusal(deps: RefreshDeps): Promise<void> {
  try {
    await deps.refreshToken()
  } catch (error) {
    const code = (error as { code?: unknown } | null)?.code
    if (typeof code === 'string' && ACCOUNT_GONE_CODES.includes(code)) await deps.signOut()
  }
}
