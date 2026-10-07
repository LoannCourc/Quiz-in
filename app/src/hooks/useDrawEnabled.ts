import { DRAW_ENABLED_PATH } from '@shared/constants';

import { useLiveValue } from './useLiveValue';

// Interrupteur à distance de Dessine-moi (config/drawEnabled), modifiable dans la console Firebase
// seulement. Contrairement au blind test, ouvert par défaut : seul false le coupe (pendant la lecture,
// ouvert : pas de tuile qui clignote dans le cas normal).
export function useDrawEnabled(): boolean {
  const value = useLiveValue<unknown>(DRAW_ENABLED_PATH);
  return !(value.kind === 'ready' && value.value === false);
}
