import { BowlbyOne_400Regular } from '@expo-google-fonts/bowlby-one/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ScreenBackground } from '@/components/ui/Screen';
import { AppColors, AppFonts } from '@/constants/appTheme';

SplashScreen.preventAutoHideAsync();

// Seules les graisses utilisées par la DA (import par graisse : les autres ne sont pas embarquées).
const FONTS = {
  [AppFonts.display]: BowlbyOne_400Regular,
  [AppFonts.bold]: Nunito_700Bold,
  [AppFonts.extraBold]: Nunito_800ExtraBold,
  [AppFonts.black]: Nunito_900Black,
};

// Racine : une pile d'écrans sans en-tête. Les onglets de l'hôte sont dans (host)/_layout.tsx,
// pour que les écrans joueur (/join) s'affichent seuls.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(FONTS);

  useEffect(() => {
    if (fontError) console.warn('Polices non chargées, police système utilisée', fontError);
  }, [fontError]);

  // Pas de flash de police système : écran de démarrage (Android) ou fond seul (web) en attendant.
  // En cas d'échec, on continue avec la police système plutôt que de bloquer l'app.
  if (!fontsLoaded && !fontError) return <ScreenBackground />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: AppColors.background } }} />
    </ThemeProvider>
  );
}
