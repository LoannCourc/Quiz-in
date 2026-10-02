import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
import { Spacing } from '@/constants/theme';

// Fond et colonne centrée communs aux écrans joueur. Le défilement garde le formulaire
// accessible quand le clavier du téléphone est ouvert.
export function PlayerScreen({ children }: { children: ReactNode }) {
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
    backgroundColor: PlayerColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.three,
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: PlayerSizes.contentMaxWidth,
    gap: Spacing.four,
  },
});
