import type { SessionSettings } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Résumé des réglages : « Choix multiples · Rapidité activée » ou « … · sans Rapidité », puis
// « · Pas à pas » et « · Suspense » s'ils sont activés. Contrôle et Groupe ne sont pas encore
// disponibles : ils n'apparaissent pas.
export function settingsSummary(settings: SessionSettings): string {
  const speedBonus = settings.speedBonus ? strings.quizSetup.speedBonusOn : strings.quizSetup.speedBonusOff;
  const parts = [strings.quizSetup.answerModes[settings.answerMode], speedBonus];
  if (settings.stepByStep) parts.push(strings.quizSetup.stepByStep.title);
  if (settings.suspense) parts.push(strings.quizSetup.suspense.title);
  return parts.join(' · ');
}

interface GameSettingsCardProps {
  settings: SessionSettings;
  onPress: () => void;
}

// Carte « Réglages de la partie » de la fiche : toute la carte ouvre la feuille des réglages.
export function GameSettingsCard({ settings, onPress }: GameSettingsCardProps) {
  const summary = settingsSummary(settings);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.quizSetup.settingsCardLabel(summary)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <SettingsIcon name="sliders" color={AppColors.link} />
      <View style={styles.texts}>
        <Text style={styles.title}>{strings.quizSetup.settingsTitle}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
      </View>
      <SettingsIcon name="chevron" color={AppColors.link} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 60,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.link,
    backgroundColor: AppColors.panel,
  },
  pressed: {
    opacity: 0.8,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  summary: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
});
