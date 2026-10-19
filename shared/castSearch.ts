// Attente des TV avant d'ouvrir la liste Cast (iOS) : la liste n'est ouverte qu'une fois une TV vue, pour ne
// jamais montrer « No devices available » juste après la demande d'accès au réseau local. Relance de secours
// à CAST_RESCUE_RESTART_MS, limite haute à CAST_SEARCH_LIMIT_MS : au-delà, la liste si une TV est vue, sinon
// « Aucune TV trouvée ». Les deux minuteries repartent à chaque retour de l'app au premier plan (fenêtre
// d'iOS fermée, retour des Réglages) ; la limite n'aboutit jamais hors du premier plan.

export const CAST_RESCUE_RESTART_MS = 3000
export const CAST_SEARCH_LIMIT_MS = 8000

export interface CastSearchDeps {
  now: () => number
  setTimer: (callback: () => void, delayMs: number) => unknown
  clearTimer: (timer: unknown) => void
  isForeground: () => boolean
  deviceCount: () => Promise<number>
  restart: (reason: string) => void
  log: (message: string) => void
}

export interface CastSearch {
  // Liste des TV vues mise à jour par le SDK.
  devicesSeen: (count: number) => void
  // L'app vient de repasser au premier plan (la relance elle-même est faite par l'appelant).
  foreground: () => void
  cancel: () => void
}

export function startCastSearch(deps: CastSearchDeps, onDone: (found: boolean) => void): CastSearch {
  const startedAt = deps.now()
  let timers: unknown[] = []
  let isOver = false

  const clearTimers = () => {
    timers.forEach(deps.clearTimer)
    timers = []
  }
  const finish = (found: boolean) => {
    if (isOver) return
    isOver = true
    clearTimers()
    const elapsed = deps.now() - startedAt
    deps.log(found ? `Première TV vue ${elapsed} ms après l'appui : liste ouverte` : `Aucune TV vue ${elapsed} ms après l'appui`)
    onDone(found)
  }
  const reachLimit = () => {
    if (!deps.isForeground()) {
      deps.log('Limite atteinte hors du premier plan : attente du retour')
      return
    }
    void deps.deviceCount().then((count) => finish(count > 0))
  }
  const schedule = () => {
    clearTimers()
    timers.push(deps.setTimer(() => deps.restart(`secours, ${CAST_RESCUE_RESTART_MS / 1000} s`), CAST_RESCUE_RESTART_MS))
    timers.push(deps.setTimer(reachLimit, CAST_SEARCH_LIMIT_MS))
  }

  schedule()
  return {
    devicesSeen: (count) => {
      if (count > 0) finish(true)
    },
    foreground: () => {
      if (!isOver) schedule()
    },
    cancel: () => {
      isOver = true
      clearTimers()
    },
  }
}
