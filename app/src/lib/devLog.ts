// Signale en développement seulement les entrées mal formées ignorées lors d'une lecture de la base.
export function warnIgnoredEntries(source: string, ignoredCount: number) {
  if (__DEV__ && ignoredCount > 0) {
    console.warn(`${source} : ${ignoredCount} entrée(s) invalide(s) ignorée(s).`);
  }
}

// Journal du moteur de l'hôte, en développement seulement : une ligne par transition.
// Exemple : « [engine] question 0 -> reveal, attendu question/0, résultat applied, retard 1204 ms ».
export function logEngine(from: string, to: string, expected: string, result: string, delayMs: number) {
  if (__DEV__) {
    console.log(`[engine] ${from} -> ${to}, attendu ${expected}, résultat ${result}, retard ${Math.round(delayMs)} ms`);
  }
}
