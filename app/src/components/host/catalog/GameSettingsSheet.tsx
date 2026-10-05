import {
  AVAILABLE_ANSWER_MODES,
  AVAILABLE_OPTIONS,
  BLUFF_HIDDEN_OPTIONS,
  canEnableOption,
  withAnswerMode,
  type GameOption,
} from '@shared/quizCatalog';
import type { AnswerMode, SessionSettings } from '@shared/types';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { SettingsIconName } from '@/components/host/settings/SettingsIcon';
import { SettingTile, type SettingTileState } from '@/components/host/settings/SettingTile';
import { BigButton } from '@/components/ui/BigButton';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const ANSWER_MODES: readonly { mode: AnswerMode; icon: SettingsIconName }[] = [
  { mode: 'choice', icon: 'grid' },
  { mode: 'free', icon: 'keyboard' },
];

const OPTIONS: readonly { option: GameOption; icon: SettingsIconName }[] = [
  { option: 'speedBonus', icon: 'bolt' },
  { option: 'control', icon: 'check' },
  { option: 'teams', icon: 'group' },
];

function answerModeState(settings: SessionSettings, mode: AnswerMode): SettingTileState {
  if (!AVAILABLE_ANSWER_MODES.includes(mode)) return 'soon';
  return settings.answerMode === mode ? 'active' : 'idle';
}

function optionState(settings: SessionSettings, option: GameOption): SettingTileState {
  if (!AVAILABLE_OPTIONS.includes(option)) return 'soon';
  if (settings[option]) return 'active';
  return canEnableOption(settings, option) ? 'idle' : 'blocked';
}

interface GameSettingsSheetProps {
  visible: boolean;
  settings: SessionSettings;
  onChange: (settings: SessionSettings) => void;
  onClose: () => void;
}

// Feuille des réglages de la partie (maquette R2) : tuiles à toucher, « Terminé » fixé en bas (seules
// les tuiles défilent sur un petit écran). Fermeture aussi par un appui à côté ou le bouton retour.
// Changer de mode coupe les options devenues incompatibles (withAnswerMode).
// Bluff : ni mode de réponse ni Contrôle ou Rapidité, seulement Groupe et le rythme.
export function GameSettingsSheet({ visible, settings, onChange, onClose }: GameSettingsSheetProps) {
  const isBluff = settings.answerMode === 'bluff';
  const options = isBluff ? OPTIONS.filter(({ option }) => !BLUFF_HIDDEN_OPTIONS.includes(option)) : OPTIONS;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.quizSetup.settingsDone} style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{strings.quizSetup.settingsTitle}</Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.sections}>
            {!isBluff && (
              <>
                <Text style={styles.sectionLabel}>{strings.quizSetup.answerModeLabel}</Text>
                <View style={styles.grid}>
                  {ANSWER_MODES.map(({ mode, icon }) => (
                    <SettingTile
                      key={mode}
                      icon={icon}
                      title={strings.quizSetup.answerModes[mode]}
                      hint={strings.quizSetup.answerModeHints[mode]}
                      state={answerModeState(settings, mode)}
                      role="radio"
                      onPress={() => onChange(withAnswerMode(settings, mode))}
                    />
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionLabel}>{strings.quizSetup.optionsLabel}</Text>
            <View style={styles.grid}>
              {options.map(({ option, icon }) => (
                <SettingTile
                  key={option}
                  icon={icon}
                  title={strings.quizSetup.options[option].title}
                  hint={strings.quizSetup.options[option].hint}
                  state={optionState(settings, option)}
                  role="checkbox"
                  onPress={() => onChange({ ...settings, [option]: !settings[option] })}
                />
              ))}
              {/* Nombre impair de tuiles : la dernière garde une demi-largeur. */}
              {options.length % 2 === 1 && <View style={styles.filler} />}
            </View>

            {/* Rythme : hors des options (ne compte pas dans la limite de deux en Choix multiples). */}
            <Text style={styles.sectionLabel}>{strings.quizSetup.rhythmLabel}</Text>
            <View style={styles.grid}>
              <SettingTile
                icon="next"
                title={strings.quizSetup.stepByStep.title}
                hint={strings.quizSetup.stepByStep.hint}
                state={settings.stepByStep ? 'active' : 'idle'}
                role="checkbox"
                onPress={() => onChange({ ...settings, stepByStep: !settings.stepByStep })}
              />
              <SettingTile
                icon="podium"
                title={strings.quizSetup.suspense.title}
                hint={strings.quizSetup.suspense.hint}
                state={settings.suspense ? 'active' : 'idle'}
                role="checkbox"
                onPress={() => onChange({ ...settings, suspense: !settings.suspense })}
              />
            </View>
          </ScrollView>

          <BigButton label={strings.quizSetup.settingsDone} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const TITLE_SIZE = 20;

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
    maxHeight: '92%',
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
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
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.textMuted,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  sections: {
    gap: Spacing.two,
  },
  sectionLabel: {
    marginTop: Spacing.one,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filler: {
    flexBasis: '47%',
    flexGrow: 1,
  },
});
