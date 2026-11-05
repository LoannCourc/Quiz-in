// Compteur animé (points qui montent) : calcul pur, l'écran n'affiche que le résultat.

// Ralentit à la fin.
export function easeOutCubic(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress))
  return 1 - (1 - clamped) ** 3
}

// Valeur entière à l'instant elapsedMs : from au début, exactement to à la fin.
export function countUpValue(from: number, to: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return to
  return Math.round(from + (to - from) * easeOutCubic(elapsedMs / durationMs))
}
