import { ANDROID_PACKAGE } from '@shared/constants';
import { Linking, Platform } from 'react-native';

// Fiche de l'app dans l'application du store (Android), avant l'adresse web en secours.
export const ANDROID_MARKET_URL = `market://details?id=${ANDROID_PACKAGE}`;

// Ouvre la première adresse qui s'ouvre ; false si aucune (store absent, adresse refusée par le système).
export async function openFirstUrl(urls: readonly string[]): Promise<boolean> {
  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      // Adresse suivante.
    }
  }
  return false;
}

// Fiche du store pour une mise à jour : sur Android, l'application Play Store puis la page web de la config.
export function openUpdateStore(storeUrl: string): Promise<boolean> {
  return openFirstUrl(Platform.OS === 'android' ? [ANDROID_MARKET_URL, storeUrl] : [storeUrl]);
}
