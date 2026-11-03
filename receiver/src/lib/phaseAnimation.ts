import type { CSSProperties } from 'react'

// Style d'une animation CSS calée sur une phase (anneau du chrono, 3-2-1, barre « question suivante ») :
// durée, et délai négatif pour reprendre là où en est la phase. En mode allégé, ces éléments sont masqués
// (displayMode.css).
export function phaseAnimation(durationMs: number, elapsedMs: number): CSSProperties {
  return {
    animationDuration: `${Math.max(1, durationMs)}ms`,
    animationDelay: `-${Math.max(0, elapsedMs)}ms`,
  }
}
