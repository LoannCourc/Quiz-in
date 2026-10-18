import { Platform } from 'react-native';

// Vrai uniquement sur la version web de production (npx expo export), c'est-à-dire le site
// des joueurs. Faux en développement (npx expo start, web compris) et sur Android.
export const isPublishedWeb = Platform.OS === 'web' && !__DEV__;

// iPhone ou iPad : l'appli iOS, ou Safari (et les autres navigateurs, tous sur WebKit) sur iOS. iPadOS se
// présente comme un Mac : reconnu à son écran tactile.
function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

export const isIosDevice = Platform.OS === 'ios' || (Platform.OS === 'web' && isIosBrowser());
