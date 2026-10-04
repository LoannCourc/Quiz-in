import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { SettingsIcon, type SettingsIconName } from './SettingsIcon';

// active : jaune, texte encre. idle : sombre. soon : grisée, « BIENTÔT », non cliquable.
// blocked : grisée sans étiquette (option incompatible avec les autres réglages).
export type SettingTileState = 'active' | 'idle' | 'soon' | 'blocked';

interface SettingTileProps {
  icon: SettingsIconName;
  title: string;
  hint: string;
  state: SettingTileState;
  // radio : un choix parmi plusieurs (mode de réponse) ; checkbox : option à cocher.
  role: 'radio' | 'checkbox';
  onPress: () => void;
}

// Tuile à toucher de la feuille des réglages (maquette R2).
export function SettingTile({ icon, title, hint, state, role, onPress }: SettingTileProps) {
  const isActive = state === 'active';
  const isDisabled = state === 'soon' || state === 'blocked';
  const textColor = isActive ? AppColors.onAccent : AppColors.text;
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ checked: isActive, disabled: isDisabled }}
      accessibilityHint={
        state === 'soon' ? strings.quizSetup.comingSoon : state === 'blocked' ? strings.quizSetup.incompatible : undefined
      }
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        isActive ? styles.active : styles.idle,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <SettingsIcon name={icon} color={isActive ? AppColors.onAccent : AppColors.text} />
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {state === 'soon' && <Text style={styles.badge}>{strings.catalog.soon}</Text>}
      </View>
      <Text style={[styles.hint, { color: isActive ? AppColors.onAccent : AppColors.textMuted }]}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
  },
  active: {
    backgroundColor: AppColors.accent,
  },
  idle: {
    backgroundColor: AppColors.tileIdle,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.one,
    marginTop: Spacing.one,
  },
  title: {
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  // Même étiquette que les onglets du catalogue : contour cyan, petite.
  badge: {
    paddingHorizontal: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AppColors.soonBadge,
    color: AppColors.soonBadge,
    fontFamily: AppFonts.black,
    fontSize: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  hint: {
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
});
