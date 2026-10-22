// Présence d'un joueur dans une partie (spec 7) : connected = true tant que son écran de partie est ouvert.
// Logique pure, accès à Firebase injectés (app/src/hooks/usePresence.ts, testée par tests/unit/presence.test.ts).

export interface PresenceDeps {
  // Appelle onConnected à chaque (re)connexion à Firebase ; renvoie la fonction qui arrête l'écoute.
  watchConnection: (onConnected: () => void) => () => void
  // Confie au serveur l'écriture connected = false à faire si la connexion se perd (onDisconnect).
  armDisconnect: () => Promise<void>
  // Annule cette écriture programmée.
  cancelDisconnect: () => Promise<void>
  setConnected: (connected: boolean) => Promise<void>
  // Échec à la connexion (sans effet visible : la prochaine reconnexion réessaie).
  warn: (error: unknown) => void
}

export interface PresenceTracker {
  // Fin du suivi sans rien écrire (changement de joueur, partie supprimée).
  stop: () => void
  // Écran de la partie quitté (Quitter, retour, autre écran) : absent tout de suite, écriture programmée
  // annulée. La connexion de l'app reste ouverte : sans cela, le serveur n'écrirait jamais false et le joueur
  // resterait compté comme présent. Un refus (entrée déjà retirée : exclusion, « Je joue aussi » arrêté) est
  // ignoré, sans message.
  leave: () => void
}

// À chaque connexion : d'abord l'écriture programmée, puis connected = true. Rien n'est écrit après stop() ou
// leave(), même si une connexion était en cours : un true arrivé après le false de leave() ferait du joueur un
// fantôme.
export function trackPresence(deps: PresenceDeps): PresenceTracker {
  let isActive = true
  let hasLeft = false
  const unwatch = deps.watchConnection(() => {
    if (!isActive) return
    deps
      .armDisconnect()
      .then(() => (isActive ? deps.setConnected(true) : undefined))
      .catch(deps.warn)
  })

  function stop() {
    if (!isActive) return
    isActive = false
    unwatch()
  }

  return {
    stop,
    leave() {
      stop()
      if (hasLeft) return
      hasLeft = true
      // false d'abord : si l'app s'arrête juste après, l'écriture programmée dit encore la même chose.
      void Promise.resolve()
        .then(() => deps.setConnected(false))
        .catch(() => undefined)
      void Promise.resolve()
        .then(() => deps.cancelDisconnect())
        .catch(() => undefined)
    },
  }
}
