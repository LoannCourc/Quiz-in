import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import GoogleCast from 'react-native-google-cast';

// iOS : la recherche des TV ne démarre jamais seule (réglage par défaut du SDK Cast : seulement au premier
// appui sur l'icône Cast native). La liste ouverte par « Afficher sur la TV » exige donc un startDiscovery
// explicite, qui déclenche aussi la demande d'accès au réseau local d'iOS. Android : rien à faire.
const STORAGE_KEY = 'quizin:castLocalNetworkAsked';

export const needsExplicitDiscovery = Platform.OS === 'ios';

// Vrai si la recherche a déjà été lancée une fois sur ce téléphone (demande d'iOS déjà faite).
export async function loadLocalNetworkAsked(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveLocalNetworkAsked(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Non mémorisé : la recherche ne repartira qu'au prochain appui sur « Afficher sur la TV ».
  }
}

export async function startCastDiscovery(): Promise<void> {
  if (!needsExplicitDiscovery) return;
  try {
    await GoogleCast.getDiscoveryManager().startDiscovery();
  } catch (error) {
    console.warn('[cast] Recherche des TV impossible à démarrer', error);
  }
}

export function stopCastDiscovery(): void {
  if (!needsExplicitDiscovery) return;
  GoogleCast.getDiscoveryManager()
    .stopDiscovery()
    .catch((error: unknown) => console.warn('[cast] Recherche des TV impossible à arrêter', error));
}

// Relance (arrêt puis démarrage) : une recherche lancée avant l'accord d'accès au réseau local ne trouvait
// jamais rien ensuite (iPhone 16, build 4). Toujours arrêter d'abord : le SDK peut ignorer un démarrage
// quand la recherche tourne déjà.
export async function restartCastDiscovery(reason: string): Promise<void> {
  if (!needsExplicitDiscovery) return;
  console.log(`[cast] Relance de la recherche (${reason})`);
  const manager = GoogleCast.getDiscoveryManager();
  try {
    await manager.stopDiscovery();
    await manager.startDiscovery();
  } catch (error) {
    console.warn('[cast] Relance de la recherche impossible', error);
  }
  void logCastDiscovery(`après la relance (${reason})`);
}

// Ligne [cast] lue dans la console du build de test : la recherche tourne-t-elle, combien de TV vues.
export async function logCastDiscovery(context: string): Promise<void> {
  try {
    const manager = GoogleCast.getDiscoveryManager();
    const [isRunning, devices] = await Promise.all([manager.isRunning(), manager.getDevices()]);
    console.log(`[cast] ${context} : recherche ${isRunning ? 'active' : 'arrêtée'}, ${devices.length} TV vue(s)`);
  } catch (error) {
    console.warn('[cast] État de la recherche illisible', error);
  }
}

export async function castDeviceCount(): Promise<number> {
  try {
    return (await GoogleCast.getDiscoveryManager().getDevices()).length;
  } catch {
    return 0;
  }
}

export function onCastDevicesSeen(listener: (count: number) => void): () => void {
  const subscription = GoogleCast.getDiscoveryManager().onDevicesUpdated((devices) => listener(devices.length));
  return () => subscription.remove();
}
