import { BowlbyOne_400Regular } from '@expo-google-fonts/bowlby-one/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

import { AppFontNames } from '@/constants/appTheme';

// Seules les graisses utilisées par la DA (import par graisse : les autres ne sont pas embarquées).
const FONTS = {
  [AppFontNames.display]: BowlbyOne_400Regular,
  [AppFontNames.bold]: Nunito_700Bold,
  [AppFontNames.extraBold]: Nunito_800ExtraBold,
  [AppFontNames.black]: Nunito_900Black,
};

// Android : polices embarquées dans l'app. Vrai quand l'app peut s'afficher (polices chargées, ou
// échec : on continue avec la police système plutôt que de bloquer l'app).
export function useAppFonts(): boolean {
  const [fontsLoaded, fontError] = useFonts(FONTS);

  useEffect(() => {
    if (fontError) console.warn('Polices non chargées, police système utilisée', fontError);
  }, [fontError]);

  return fontsLoaded || fontError != null;
}
