import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

// Dégradé radial de la DA. Android : experimental_backgroundImage (React Native ≥ 0.80).
// Web : react-native-web transmet backgroundImage tel quel au CSS, mais ce nom n'existe pas
// dans les types React Native, d'où la conversion de type.
const gradientStyle: ViewStyle =
  Platform.OS === 'web'
    ? ({ backgroundImage: AppBackground } as ViewStyle)
    : { experimental_backgroundImage: AppBackground };

// Fond seul, sans contenu : écran de chargement (polices) et base de Screen.
export function ScreenBackground({ children }: { children?: ReactNode }) {
  return <View style={[styles.background, gradientStyle]}>{children}</View>;
}

// Fond et colonne centrée communs aux écrans de l'app (hôte et joueurs). Le défilement garde le formulaire
// accessible quand le clavier du téléphone est ouvert.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.three,
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    gap: Spacing.four,
  },
});
