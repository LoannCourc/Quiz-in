import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // En-tête (maquette R4) : titre à gauche, information courte à droite (« 2 joueurs »).
  title?: string;
  aside?: string;
  children: ReactNode;
}

// Feuille du bas, par-dessus l'écran (salon de l'hôte : son, réglages) : poignée, en-tête facultatif, contenu
// qui défile (petit écran, grande police), « Terminé » jaune. Appui en dehors, bouton retour d'Android ou
// « Terminé » : fermeture.
export function BottomSheet({ isOpen, onClose, title, aside, children }: BottomSheetProps) {
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.quizSetup.settingsDone} style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {aside && <Text style={styles.aside}>{aside}</Text>}
            </View>
          )}
          <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
          <BigButton label={strings.quizSetup.settingsDone} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const TITLE_SIZE = 24;
const HANDLE_WIDTH = 44;

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
    maxHeight: '92%',
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  handle: {
    alignSelf: 'center',
    width: HANDLE_WIDTH,
    height: 5,
    borderRadius: 3,
    backgroundColor: AppColors.sheetHandle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  aside: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  content: {
    gap: Spacing.three,
  },
});
