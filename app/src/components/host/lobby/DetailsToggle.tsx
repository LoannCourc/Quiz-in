import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface DetailsToggleProps {
  label: string;
  isOpen: boolean;
  onPress: () => void;
}

// Pilule « Détails ▾ » / « Masquer ▴ » des blocs repliables du salon (barre TV, code de la partie).
export function DetailsToggle({ label, isOpen, onPress }: DetailsToggleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      hitSlop={Spacing.one}
      onPress={onPress}
      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
      {/* Chevron du réglage tourné : vers le bas pour déplier, vers le haut pour replier. */}
      <View style={isOpen ? styles.chevronUp : styles.chevronDown}>
        <SettingsIcon name="chevron" color={AppColors.link} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  chevronDown: {
    transform: [{ rotate: '90deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '-90deg' }],
  },
});
