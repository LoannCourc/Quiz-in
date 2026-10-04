import { AVAILABLE_OPTIONS, canEnableOption, withAnswerMode, type GameOption } from '@shared/quizCatalog';
import type { AnswerMode, SessionSettings } from '@shared/types';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { OptionToggle } from '@/components/host/OptionToggle';
import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const MODE_CHOICES: Choice<AnswerMode>[] = (['choice', 'free'] as const).map((mode) => ({
  value: mode,
  label: strings.quizSetup.answerModes[mode],
}));

const OPTIONS: readonly GameOption[] = ['speedBonus', 'control', 'teams'];

// Raison affichée à côté d'une option qu'on ne peut pas activer, sinon undefined.
function disabledReason(settings: SessionSettings, option: GameOption): string | undefined {
  if (!AVAILABLE_OPTIONS.includes(option)) return strings.quizSetup.comingSoon;
  if (!settings[option] && !canEnableOption(settings, option)) return strings.quizSetup.incompatible;
  return undefined;
}

interface GameSettingsSheetProps {
  visible: boolean;
  settings: SessionSettings;
  onChange: (settings: SessionSettings) => void;
  onClose: () => void;
}

// Feuille des réglages de la partie (mode de réponse, options), ouverte depuis la fiche du quiz.
export function GameSettingsSheet({ visible, settings, onChange, onClose }: GameSettingsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.quizSetup.settingsDone} style={styles.backdrop} onPress={onClose} />
        <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
          <Text style={[textStyles.label, styles.centered]}>{strings.quizSetup.settingsTitle}</Text>

          <View style={styles.section}>
            <Text style={textStyles.label}>{strings.quizSetup.answerModeLabel}</Text>
            <ChoiceChips
              choices={MODE_CHOICES}
              selected={settings.answerMode}
              onSelect={(mode) => onChange(withAnswerMode(settings, mode))}
            />
            <Text style={textStyles.muted}>{strings.quizSetup.answerModeHints[settings.answerMode]}</Text>
          </View>

          <View style={styles.section}>
            <Text style={textStyles.label}>{strings.quizSetup.optionsLabel}</Text>
            {OPTIONS.map((option) => (
              <OptionToggle
                key={option}
                title={strings.quizSetup.options[option].title}
                hint={strings.quizSetup.options[option].hint}
                value={settings[option]}
                disabledReason={disabledReason(settings, option)}
                onChange={(value) => onChange({ ...settings, [option]: value })}
              />
            ))}
          </View>

          <BigButton label={strings.quizSetup.settingsDone} onPress={onClose} />
        </ScrollView>
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
    flexGrow: 0,
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    alignSelf: 'center',
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  sheetContent: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
  },
});
