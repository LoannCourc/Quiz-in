import { BLIND_TEST_ENABLED_PATH } from '@shared/constants';

import { useLiveValue } from './useLiveValue';

// Interrupteur à distance du blind test (config/blindTestEnabled), modifiable dans la console
// Firebase seulement. Ouvert seulement s'il vaut true ; null tant qu'il n'est pas lu (l'appelant attend,
// il ne conclut jamais « coupé » pendant la lecture) ; lecture impossible : coupé.
export function useBlindTestEnabled(): boolean | null {
  const value = useLiveValue<unknown>(BLIND_TEST_ENABLED_PATH);
  if (value.kind === 'loading') return null;
  return value.kind === 'ready' && value.value === true;
}
