import { Pressable, StyleSheet, Text } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  // compact : texte plus petit, sur une seule ligne (deux boutons côte à côte).
  size?: 'large' | 'compact';
}

// Grosse pilule à ombre dure : à l'appui, elle « s'enfonce » (décalage vers le bas, ombre réduite).
export function BigButton({ label, onPress, disabled = false, variant = 'primary', size = 'large' }: BigButtonProps) {
  const isPrimary = variant === 'primary';
  const isCompact = size === 'compact';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text
        numberOfLines={isCompact ? 1 : undefined}
        adjustsFontSizeToFit={isCompact}
        style={[
          styles.label,
          isPrimary ? styles.primaryLabel : styles.secondaryLabel,
          isCompact && (isPrimary ? styles.compactPrimaryLabel : styles.compactLabel),
          disabled && styles.disabledLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: AppSizes.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    boxShadow: AppShadows.hard,
  },
  primary: {
    backgroundColor: AppColors.accent,
  },
  secondary: {
    backgroundColor: AppColors.surface,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  // Désactivé : pilule translucide et texte atténué (l'or à demi transparent virait au brun).
  disabled: {
    backgroundColor: AppColors.surface,
    boxShadow: 'none',
  },
  disabledLabel: {
    color: AppColors.textMuted,
  },
  label: {
    textAlign: 'center',
  },
  primaryLabel: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  compactPrimaryLabel: {
    fontSize: AppSizes.textBody,
    lineHeight: Math.round(AppSizes.textBody * DISPLAY_LINE_HEIGHT),
  },
  compactLabel: {
    fontSize: AppSizes.textBody,
  },
  secondaryLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textLarge,
  },
});
