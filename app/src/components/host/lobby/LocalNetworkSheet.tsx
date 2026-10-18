import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface LocalNetworkSheetProps {
  isOpen: boolean;
  onContinue: () => void;
  onLater: () => void;
  onDismissed: () => void;
}

const texts = strings.cast;

// iOS, première recherche des TV : explique la demande d'accès au réseau local avant qu'iOS l'affiche
// (Google l'exige quand l'app ouvre elle-même la liste des TV). La liste s'ouvre une fois la feuille
// disparue (onDismissed) : iOS n'affiche pas deux fenêtres à la fois.
export function LocalNetworkSheet({ isOpen, onContinue, onLater, onDismissed }: LocalNetworkSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onLater}
      onDismissed={onDismissed}
      title={texts.localNetworkTitle}
      footer={
        <View style={styles.footer}>
          <SubmitButton label={texts.localNetworkContinue} onPress={onContinue} />
          <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={onLater}>
            <Text style={styles.later}>{texts.localNetworkLater}</Text>
          </Pressable>
        </View>
      }>
      <Text style={styles.text}>{texts.localNetworkText}</Text>
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
  later: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
