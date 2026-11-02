// Niveau mesuré d'un morceau (F, M, D, I) d'après les seuils calibrés (thresholds.json, étape 1).
import { readFileSync } from 'node:fs'

const here = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
export const THRESHOLDS = JSON.parse(readFileSync(`${here}thresholds.json`, 'utf8'))

// Absent du top 50 de l'artiste : position au-delà de 50.
const OUT_OF_TOP = 51

// m : { nbFan, position, rank }. null : entre deux niveaux (ni D ni I), le morceau est écarté.
export function measuredLevel(m) {
  const t = THRESHOLDS
  const position = m.position ?? OUT_OF_TOP
  const known = m.nbFan >= t.knownMinFans
  if (position <= t.easyMaxPosition && (known || m.rank >= t.easyMinRankAnyArtist)) return 'F'
  if (known) return position >= t.mediumMinPosition ? 'M' : null
  if (m.rank >= t.hardMinRank || position <= t.hardMaxPosition) return 'D'
  if (m.nbFan <= t.impossibleMaxFans && m.rank < t.impossibleMaxRank && position >= t.impossibleMinPosition) return 'I'
  return null
}
