import type { BadgeId } from '@shared/badges';
import { ANDROID_PACKAGE, IOS_APP_STORE_ID, SHOWCASE_SITE_URL } from '@shared/constants';
import { Linking, Platform, Share } from 'react-native';

import { strings } from '@/constants/strings';

import { recordBadgeAction } from './badgeStore';
import { readOpenGames } from './openGames';

// Partager l'app : badge débloqué dès l'ouverture de la fenêtre de partage du système (déclaratif : on ne
// sait pas si le message est envoyé, ni s'il est annulé). La promesse se résout une fois la fenêtre ouverte
// (Android) ou refermée (iOS) ; fenêtre refusée par le système : rien.
export async function shareApp(): Promise<BadgeId[]> {
  try {
    await Share.share({ message: strings.trophies.shareMessage(SHOWCASE_SITE_URL) });
    return await recordBadgeAction('share', await readOpenGames());
  } catch (error) {
    console.warn('[badges] Partage impossible', error);
    return [];
  }
}

// Fiche du store, application puis site web en secours.
const STORE_URLS: readonly string[] =
  Platform.OS === 'ios'
    ? [
        `itms-apps://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`,
        `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`,
      ]
    : [`market://details?id=${ANDROID_PACKAGE}`, `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`];

// Noter l'app : badge débloqué si la fiche du store s'ouvre (déclaratif). Aucun lien ne s'ouvre : ni message
// ni badge. Les liens ne mènent nulle part tant que l'app n'est pas publique.
export async function rateApp(): Promise<BadgeId[]> {
  for (const url of STORE_URLS) {
    try {
      await Linking.openURL(url);
      return await recordBadgeAction('rate', await readOpenGames());
    } catch {
      // Lien suivant.
    }
  }
  return [];
}
