import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

export type DisplayOption = 'tvHelp' | 'computer';

interface DisplayOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // Choix fait : la feuille se ferme, l'écran correspondant s'ouvre (HostLobby).
  onChoose: (option: DisplayOption) => void;
  onDismissed?: () => void;
}

const texts = strings.hostLobby.displayOptions;

// « Pas de Chromecast ? Autres façons d'afficher » : l'aide Chromecast, ou l'écran « Sur un ordinateur ».
export function DisplayOptionsSheet({ isOpen, onClose, onChoose, onDismissed }: DisplayOptionsSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      onDismissed={onDismissed}
      title={texts.title}
      footer={
        <Pressable accessibilityRole="button" hitSlop={Spacing.three} onPress={onClose} style={styles.closeButton}>
          <Text style={styles.close}>{texts.close}</Text>
        </Pressable>
      }>
      <OptionRow title={texts.tvHelp} hint={texts.tvHelpHint} onPress={() => onChoose('tvHelp')} />
      <OptionRow title={texts.computer} hint={texts.computerHint} onPress={() => onChoose('computer')} />
    </BottomSheet>
  );
}

function OptionRow({ title, hint, onPress }: { title: string; hint: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityHint={hint} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <SettingsIcon name="chevron" color={AppColors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.lobbyPanel,
  },
  pressed: {
    opacity: 0.8,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 17,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  closeButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  close: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
