// Dessin enregistré (prototype, lot 1) : les paquets tels qu'ils partiraient dans la base, avec leur
// heure (ms depuis le premier geste). La page de dessin du téléphone l'exporte ; le banc d'essai de la
// TV le rejoue en temps réel.
export interface DrawingRecording {
  version: 1
  chunks: { t: number; data: string }[]
}

export function parseRecording(value: unknown): DrawingRecording | null {
  if (typeof value !== 'object' || value === null) return null
  const { version, chunks } = value as Partial<DrawingRecording>
  if (version !== 1 || !Array.isArray(chunks)) return null
  const valid = chunks.every((chunk) => typeof chunk?.t === 'number' && typeof chunk?.data === 'string')
  return valid ? { version, chunks } : null
}
