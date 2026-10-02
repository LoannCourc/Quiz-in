// Signale en développement seulement les entrées mal formées ignorées lors d'une lecture de la base.
export function warnIgnoredEntries(source: string, ignoredCount: number) {
  if (__DEV__ && ignoredCount > 0) {
    console.warn(`${source} : ${ignoredCount} entrée(s) invalide(s) ignorée(s).`);
  }
}

// TEMPORAIRE (diagnostic du blocage « Connexion à la partie… ») : étapes de la connexion et des
// lectures, en développement seulement. À retirer une fois le problème réglé.
export function traceJoin(...details: unknown[]) {
  if (__DEV__) {
    console.log('[join]', ...details);
  }
}
