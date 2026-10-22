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
