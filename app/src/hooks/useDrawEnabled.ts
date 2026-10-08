import { DRAW_ENABLED_PATH } from '@shared/constants';

import { useLiveValue } from './useLiveValue';

// Interrupteur à distance de Dessine-moi (config/drawEnabled), modifiable dans la console Firebase
// seulement. Contrairement au blind test, ouvert par défaut : seul false le coupe. null tant qu'il n'est
// pas lu (l'appelant attend).
export function useDrawEnabled(): boolean | null {
  const value = useLiveValue<unknown>(DRAW_ENABLED_PATH);
  if (value.kind === 'loading') return null;
  return !(value.kind === 'ready' && value.value === false);
}
