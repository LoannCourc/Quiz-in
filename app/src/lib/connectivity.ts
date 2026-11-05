import { createConnectivityMonitor } from '@shared/connectivity';
import { getApp } from 'firebase/app';
import { onValue, ref } from 'firebase/database';
import { AppState, Linking, Platform } from 'react-native';

import { db } from './firebase';

// Réseau de l'app, sans dépendance : état de la connexion à la base, plus un petit appel réel au serveur de la base.
// Toute réponse HTTP, même un refus (la racine n'est pas lisible), prouve que l'internet passe ; une erreur ou un délai
// dépassé, non : un Wi-Fi sans internet ou un portail captif échoue (adresse https de Firebase).
const PROBE_TIMEOUT_MS = 6_000;

async function probeServer(): Promise<boolean> {
  const url = getApp().options.databaseURL;
  if (!url) return true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    // Web : no-cors, la réponse n'a pas besoin d'être lue, seule compte son arrivée.
    await fetch(`${url}/.json?shallow=true`, { cache: 'no-store', signal: controller.signal, ...(Platform.OS === 'web' ? { mode: 'no-cors' as const } : null) });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

let isOnline = true;
let listeners: (() => void)[] = [];

const monitor = createConnectivityMonitor({
  probe: probeServer,
  onChange: (value) => {
    isOnline = value;
    console.info(`[réseau] ${value ? 'en ligne' : 'hors ligne'}`);
    listeners.forEach((listener) => listener());
  },
});

let stopWatching: (() => void) | null = null;

function startWatching(): () => void {
  monitor.start();
  const offConnected = onValue(ref(db, '.info/connected'), (snapshot) => monitor.connectedChanged(snapshot.val() === true));
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active') monitor.checkNow();
  });
  return () => {
    offConnected();
    appState.remove();
    monitor.stop();
  };
}

// useSyncExternalStore : la surveillance tourne tant qu'un écran écoute.
export function subscribeConnectivity(listener: () => void): () => void {
  listeners = [...listeners, listener];
  stopWatching ??= startWatching();
  return () => {
    listeners = listeners.filter((other) => other !== listener);
    if (listeners.length === 0) {
      stopWatching?.();
      stopWatching = null;
    }
  };
}

export const getIsOnline = (): boolean => isOnline;
export const retryConnection = (): Promise<boolean> => monitor.retry();

// Le site des joueurs ne peut pas ouvrir les réglages du téléphone : lien masqué.
export const canOpenNetworkSettings = Platform.OS === 'android' || Platform.OS === 'ios';

// Android : réglages réseau ; iOS : seule la page de l'app est permise par le système.
export async function openNetworkSettings(): Promise<void> {
  try {
    if (Platform.OS === 'android') await Linking.sendIntent('android.settings.WIRELESS_SETTINGS');
    else await Linking.openSettings();
  } catch {
    await Linking.openSettings().catch(() => undefined);
  }
}
