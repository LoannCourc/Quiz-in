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
