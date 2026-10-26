// Mise à jour disponible (spec 21) : versions de l'app comparées nombre par nombre, jamais comme du texte
// (« 1.10.0 » est plus récente que « 1.9.0 »). Logique pure, testée.

// Version lisible : un à trois nombres séparés par des points (« 1 », « 1.1 », « 1.1.0 ») ; sinon null.
// Les nombres manquants valent 0 : « 1.1 » et « 1.1.0 » sont la même version.
export function parseVersion(value: unknown): [number, number, number] | null {
  if (typeof value !== 'string' || !/^\d{1,4}(\.\d{1,4}){0,2}$/.test(value.trim())) return null
  const parts = value.trim().split('.').map(Number)
  return [parts[0], parts[1] ?? 0, parts[2] ?? 0]
}

// Négatif si a est plus ancienne que b, 0 si égales, positif si plus récente ; null si l'une est illisible.
export function compareVersions(a: unknown, b: unknown): number | null {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (!left || !right) return null
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] - right[index]
  }
  return 0
}
