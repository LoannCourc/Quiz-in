import type { BadgeId } from '@shared/badges';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { shareApp } from '@/lib/badgeActions';

import { BadgeEmblem } from './LazyBadges';

const ICON_SIZE = 22;

// « À propos » (maquette G3) : ligne jaune « Partager Quiz'in » ; le badge Partager se débloque à l'ouverture
// de la fenêtre de partage du système (onUnlocked : badges à montrer par l'écran).
export function ShareAppRow({ onUnlocked }: { onUnlocked: (badges: BadgeId[]) => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void shareApp().then(onUnlocked)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <BadgeEmblem name="partager" size={ICON_SIZE} />
      <Text style={styles.label}>{strings.trophies.shareButton}</Text>
      <View style={styles.chevron}>
        <SettingsIcon name="chevron" color={AppColors.onBadge} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.badgeNotice,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    flex: 1,
    color: AppColors.onBadge,
    fontFamily: AppFonts.black,
    fontSize: 17,
    ...TEXT_FIT_SAFETY,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
