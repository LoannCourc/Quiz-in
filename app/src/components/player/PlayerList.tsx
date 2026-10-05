import type { PlayerId } from '@shared/types';

import type { LobbyPlayers } from '@/lib/joinGame';

// Joueurs connectés, en direct : le joueur mis en évidence (« toi ») d'abord, même déconnecté, puis
// par ordre alphabétique.
export function visiblePlayers(players: LobbyPlayers, highlightedUid?: PlayerId) {
  return Object.entries(players)
    .filter(([id, player]) => player.connected || id === highlightedUid)
    .map(([id, player]) => ({ id, ...player }))
    .sort(
      (a, b) =>
        Number(b.id === highlightedUid) - Number(a.id === highlightedUid) || a.name.localeCompare(b.name, 'fr'),
    );
}
