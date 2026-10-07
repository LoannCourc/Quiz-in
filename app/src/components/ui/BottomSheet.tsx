import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Feuille du bas, par-dessus l'écran (salon de l'hôte : son, réglages). Appui en dehors, bouton retour
// d'Android ou « Terminé » : fermeture. Le contenu défile sur un petit écran ou avec une grande police.
export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.quizSetup.settingsDone} style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
          <BigButton label={strings.quizSetup.settingsDone} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: AppColors.backdrop,
  },
  sheet: {
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    maxHeight: '90%',
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  content: {
    gap: Spacing.three,
  },
});
