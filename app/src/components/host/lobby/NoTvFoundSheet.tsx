import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

export type NoTvFoundAction = 'settings' | 'retry' | 'help';

interface NoTvFoundSheetProps {
  isOpen: boolean;
  onChoose: (action: NoTvFoundAction) => void;
  onClose: () => void;
  onDismissed: () => void;
}

const texts = strings.cast.noTvFound;

// iOS : aucune TV vue après la recherche (accès au réseau local refusé, autre Wi-Fi, TV éteinte). iOS ne dit
// pas si l'accès est refusé : le texte couvre les deux causes. L'action choisie part une fois la feuille
// disparue (onDismissed) : iOS n'affiche pas deux fenêtres à la fois.
export function NoTvFoundSheet({ isOpen, onChoose, onClose, onDismissed }: NoTvFoundSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      onDismissed={onDismissed}
      title={texts.title}
      footer={
        <View style={styles.footer}>
          <SubmitButton label={texts.openSettings} onPress={() => onChoose('settings')} />
          <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={() => onChoose('retry')}>
            <Text style={styles.link}>{texts.retry}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={() => onChoose('help')}>
            <Text style={styles.muted}>{texts.help}</Text>
          </Pressable>
        </View>
      }>
      <Text style={styles.text}>{texts.text}</Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  text: {
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 18,
    lineHeight: 26,
  },
  footer: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  link: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  muted: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
