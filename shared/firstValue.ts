// Première valeur d'un abonnement (Firebase onValue…), avec un délai maximal et une valeur de repli. Sûr si
// l'abonnement rappelle tout de suite, avant même de rendre sa fonction de désabonnement (valeur en cache :
// c'était le plantage « undefined is not a function » au retour sur l'accueil). Ne rejette jamais.
export function firstValue<T>(
  subscribe: (onValue: (value: T) => void) => () => void,
  timeoutMs: number,
  fallback: T,
): Promise<T> {
  return new Promise((resolve) => {
    let isDone = false
    let unsubscribe: (() => void) | undefined
    const finish = (value: T) => {
      if (isDone) return
      isDone = true
      clearTimeout(timer)
      unsubscribe?.()
      resolve(value)
    }
    const timer = setTimeout(() => finish(fallback), timeoutMs)
    try {
      unsubscribe = subscribe(finish)
    } catch {
      finish(fallback)
      return
    }
    // Rappel immédiat : le désabonnement n'existait pas encore au moment de la valeur.
    if (isDone) unsubscribe()
  })
}
