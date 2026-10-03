import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackgrounds, AppColors, AppSizes, type AppBackgroundName } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

import { gradientStyle } from './gradient';

interface BackgroundProps {
  children?: ReactNode;
  background?: AppBackgroundName;
}

// Fond seul, sans contenu : écran de chargement (polices) et base de Screen.
export function ScreenBackground({ children, background = 'main' }: BackgroundProps) {
  return <View style={[styles.background, gradientStyle(AppBackgrounds[background])]}>{children}</View>;
}

interface ScreenProps extends BackgroundProps {
  // Fixé en bas de l'écran, hors de la zone qui défile : toujours visible.
  footer?: ReactNode;
}

// Fond et colonne centrée communs aux écrans de l'app (hôte et joueurs). Le défilement garde le formulaire
// accessible quand le clavier du téléphone est ouvert.
export function Screen({ children, background, footer }: ScreenProps) {
  return (
    <ScreenBackground background={background}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
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
  footer: {
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    gap: Spacing.four,
  },
});
