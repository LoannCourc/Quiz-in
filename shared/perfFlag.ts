// Panneau de mesures de la TV (?perf=1) : allumé seulement par une action volontaire, pour la page en cours.
// Logique pure, testée. Rien n'est mémorisé : au rechargement ou à un nouveau Cast, le panneau est éteint.
// Avant la 1.2.2, la TV gardait le réglage (localStorage « quizin.perf ») : il restait affiché à chaque
// partie sur une box où on l'avait allumé une fois. Cette ancienne valeur est effacée au démarrage.
export const LEGACY_PERF_STORAGE_KEY = 'quizin.perf'

// Paramètre d'adresse (plan B) : « 1 » allume le panneau pour cette page ; tout le reste (absent, « 0 ») le
// laisse éteint.
export function perfEnabledFromUrl(search: string): boolean {
  return new URLSearchParams(search).get('perf') === '1'
}
