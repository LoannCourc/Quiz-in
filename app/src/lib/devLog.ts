// Signale en développement seulement les entrées mal formées ignorées lors d'une lecture de la base.
export function warnIgnoredEntries(source: string, ignoredCount: number) {
  if (__DEV__ && ignoredCount > 0) {
    console.warn(`${source} : ${ignoredCount} entrée(s) invalide(s) ignorée(s).`);
  }
}
