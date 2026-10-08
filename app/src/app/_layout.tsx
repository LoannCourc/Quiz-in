import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { LaunchOverlay } from '@/components/LaunchScreen';
import { ScreenBackground } from '@/components/ui/Screen';
import { AppColors } from '@/constants/appTheme';
import { useAppFonts } from '@/hooks/useAppFonts';

// L'écran de démarrage natif reste affiché jusqu'à la page de démarrage (LaunchOverlay), qui le retire.
SplashScreen.preventAutoHideAsync();

// Racine : une pile d'écrans sans en-tête. Les onglets de l'hôte sont dans (host)/_layout.tsx,
// pour que les écrans joueur (/join) s'affichent seuls.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsReady = useAppFonts();

  return (
    <View style={styles.root}>
      {/* Pas de flash de police système : fond seul en attendant les polices. */}
      {fontsReady ? (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: AppColors.background } }} />
        </ThemeProvider>
      ) : (
        <ScreenBackground />
      )}
      <LaunchOverlay fontsReady={fontsReady} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
