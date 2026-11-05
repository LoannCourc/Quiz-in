import { BLIND_TEST_ENABLED_PATH } from '@shared/constants';
import { blindTestSwitch } from '@shared/quizCatalog';
import { useEffect } from 'react';

import { useLiveValue } from './useLiveValue';

// Dernière valeur confirmée, pour toute l'app : un écran monté pendant une coupure ou une relecture la reprend.
let lastKnown: boolean | null = null;

// Interrupteur à distance du blind test (BLIND_TEST_ENABLED_PATH, config/blindTestV2Enabled), modifiable dans la console
// Firebase seulement. Ouvert seulement s'il vaut true ; lecture en cours ou impossible : le dernier état connu, null si
// aucun (l'appelant attend, il ne conclut jamais « coupé » sans valeur confirmée). Relu au retour du réseau.
export function useBlindTestEnabled(): boolean | null {
  const value = useLiveValue<unknown>(BLIND_TEST_ENABLED_PATH, true);
  const enabled = blindTestSwitch(value, lastKnown);
  useEffect(() => {
    if (value.kind === 'ready') lastKnown = enabled;
  }, [value.kind, enabled]);
  return enabled;
}
