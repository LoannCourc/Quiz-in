import type { CastGame } from './useCastGame';

// Web (site des joueurs) : pas de Cast. La bibliothèque native n'est jamais chargée.
export function useCastGame(): CastGame {
  return { isAvailable: false, isTvConnected: false, castInterrupted: false, showTvPicker: () => {} };
}
