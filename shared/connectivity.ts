// Surveillance du réseau : logique pure, les accès réels sont fournis par l'app. Deux signaux : l'état de la connexion
// à la base (immédiat, mais il peut rester vrai longtemps sur un réseau mort), et un petit appel réel au serveur (fiable :
// un Wi-Fi sans internet échoue). Hors ligne seulement après deux appels ratés à CONNECTIVITY_GRACE_MS d'écart, pour ne
// pas réagir à une coupure brève. Retour en ligne dès qu'un des deux signaux réussit.

export const CONNECTIVITY_GRACE_MS = 1_500
export const CONNECTIVITY_CHECK_EVERY_MS = 20_000
export const CONNECTIVITY_OFFLINE_POLL_MS = 3_000

export interface ConnectivityDeps {
  probe: () => Promise<boolean>
  onChange: (isOnline: boolean) => void
}

export interface ConnectivityMonitor {
  start: () => void
  stop: () => void
  // État de la connexion à la base (.info/connected).
  connectedChanged: (isConnected: boolean) => void
  // Retour au premier plan : vérification tout de suite (les minuteries dorment en arrière-plan).
  checkNow: () => void
  // « Réessayer » : un appel réel, sans attendre ; vrai si le serveur répond.
  retry: () => Promise<boolean>
}

export function createConnectivityMonitor({ probe, onChange }: ConnectivityDeps): ConnectivityMonitor {
  let isOnline = true
  let isRunning = false
  let timer: ReturnType<typeof setTimeout> | null = null
  // Numéro de la vérification en cours : un résultat arrivé après une autre décision est ignoré.
  let generation = 0

  const setOnline = (value: boolean) => {
    if (value === isOnline) return
    isOnline = value
    onChange(value)
  }

  const schedule = (delayMs: number, action: () => void) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(action, delayMs)
  }

  const scheduleNext = () => schedule(isOnline ? CONNECTIVITY_CHECK_EVERY_MS : CONNECTIVITY_OFFLINE_POLL_MS, () => void check(false))

  // isConfirming : second appel après un premier raté.
  async function check(isConfirming: boolean): Promise<void> {
    if (!isRunning) return
    const current = ++generation
    const isReachable = await probe().catch(() => false)
    if (!isRunning || current !== generation) return
    if (isReachable) {
      setOnline(true)
      scheduleNext()
    } else if (isOnline && !isConfirming) {
      schedule(CONNECTIVITY_GRACE_MS, () => void check(true))
    } else {
      setOnline(false)
      scheduleNext()
    }
  }

  return {
    start() {
      isRunning = true
      void check(false)
    },
    stop() {
      isRunning = false
      generation++
      if (timer) clearTimeout(timer)
    },
    connectedChanged(isConnected) {
      if (!isRunning) return
      if (isConnected) {
        generation++
        setOnline(true)
        scheduleNext()
      } else {
        schedule(CONNECTIVITY_GRACE_MS, () => void check(false))
      }
    },
    checkNow() {
      void check(false)
    },
    async retry() {
      const current = ++generation
      const isReachable = await probe().catch(() => false)
      if (current === generation) {
        setOnline(isReachable)
        scheduleNext()
      }
      return isReachable
    },
  }
}
