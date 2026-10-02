import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

// Fond et colonne centrée communs aux écrans de l'app (hôte et joueurs). Le défilement garde le formulaire
// accessible quand le clavier du téléphone est ouvert.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
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
