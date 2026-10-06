import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ScreenBackground } from '@/components/ui/Screen';
import { AppColors } from '@/constants/appTheme';
import { useAppFonts } from '@/hooks/useAppFonts';

SplashScreen.preventAutoHideAsync();

// Racine : une pile d'écrans sans en-tête. Les onglets de l'hôte sont dans (host)/_layout.tsx,
// pour que les écrans joueur (/join) s'affichent seuls.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsReady = useAppFonts();

  // Pas de flash de police système : écran de démarrage (Android) ou fond seul (web) en attendant.
  if (!fontsReady) return <ScreenBackground />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: AppColors.background } }} />
    </ThemeProvider>
  );
}
