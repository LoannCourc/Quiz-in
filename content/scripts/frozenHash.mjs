// Empreinte d'un blind test figé : son fichier source (relu, donc indépendante des espaces et des fins de ligne) et,
// pour chaque question, le morceau Deezer vérifié (identifiant et case verified). Partagée par
// scripts/blind-tests/freeze.mjs (qui l'écrit) et buildImport.ts (qui la contrôle).
import { createHash } from 'node:crypto'

export function frozenHash(quiz, check) {
  const tracks = (check?.tracks ?? []).map((track) => [track.questionId, track.found?.id ?? null, Boolean(track.verified)])
  return createHash('sha256').update(JSON.stringify({ quiz, tracks })).digest('hex')
}
