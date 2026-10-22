import { createStatsRecorder, type StatsRecorder } from '@shared/stats';
import { get, increment, ref, update } from 'firebase/database';

import { db } from './firebase';

// Statistiques d'usage anonymes (shared/stats.ts, docs/statistiques.md), écrites par l'app de l'hôte après le
// lancement et après chaque transition. Jamais en développement (__DEV__ : build de développement, écrans
// /debug) ; jamais si config/statsEnabled vaut false. Sans attente : un échec est ignoré, le jeu continue.
const recorder = createStatsRecorder({
  isEnabled: async () => (await get(ref(db, 'config/statsEnabled'))).val() !== false,
  write: (paths) => update(ref(db, 'stats'), Object.fromEntries(paths.map((path) => [path, increment(1)]))),
});

const NO_STATS: StatsRecorder = { gameStart: () => undefined, transition: () => undefined };

export const stats: StatsRecorder = __DEV__ ? NO_STATS : recorder;
