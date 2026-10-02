import { Platform } from 'react-native';

// Vrai uniquement sur la version web de production (npx expo export), c'est-à-dire le site
// des joueurs. Faux en développement (npx expo start, web compris) et sur Android.
export const isPublishedWeb = Platform.OS === 'web' && !__DEV__;
