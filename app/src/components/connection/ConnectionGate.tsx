import { useSyncExternalStore } from 'react';

import { canOpenNetworkSettings, getIsOnline, openNetworkSettings, retryConnection, subscribeConnectivity } from '@/lib/connectivity';

import { ConnectionRequiredPanel } from './ConnectionRequiredPanel';

// Monté à la racine de l'app et du site des joueurs : le panneau bloque tout tant que le réseau manque, et disparaît seul.
export function ConnectionGate() {
  const isOnline = useSyncExternalStore(subscribeConnectivity, getIsOnline, getIsOnline);
  if (isOnline) return null;
  return <ConnectionRequiredPanel onRetry={retryConnection} onOpenSettings={canOpenNetworkSettings ? () => void openNetworkSettings() : undefined} />;
}
