import type { BadgeGame } from '@shared/badges';
import { BLIND_TEST_ENABLED_PATH, DRAW_ENABLED_PATH } from '@shared/constants';
import { withTimeout } from '@shared/gameCreation';
import { get, ref } from 'firebase/database';

import { db } from './firebase';

const READ_TIMEOUT_MS = 5_000;

// Interrupteur lu une fois ; null si illisible (réseau, délai).
async function readSwitch(path: string): Promise<unknown> {
  try {
    return (await withTimeout(get(ref(db, path)), READ_TIMEOUT_MS)).val();
  } catch {
    return null;
  }
}

// Jeux ouverts aujourd'hui (badge Touche-à-tout), mêmes règles que l'accueil : Quiz et Bluff toujours ;
// Dessine-moi sauf si config/drawEnabled vaut false ; le jeu musical seulement si son interrupteur vaut true.
export async function readOpenGames(): Promise<BadgeGame[]> {
  const [blindTest, draw] = await Promise.all([readSwitch(BLIND_TEST_ENABLED_PATH), readSwitch(DRAW_ENABLED_PATH)]);
  const games: BadgeGame[] = ['quiz', 'bluff'];
  if (draw !== false) games.push('draw');
  if (blindTest === true) games.push('blindTest');
  return games;
}
