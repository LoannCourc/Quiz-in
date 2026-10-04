import { BLIND_TEST_ENABLED_PATH } from '@shared/constants';

import { useLiveValue } from './useLiveValue';

// Interrupteur à distance du blind test (config/blindTestEnabled), modifiable dans la console
// Firebase seulement. Absent, false ou pas encore lu : désactivé.
export function useBlindTestEnabled(): boolean {
  const value = useLiveValue<unknown>(BLIND_TEST_ENABLED_PATH);
  return value.kind === 'ready' && value.value === true;
}
