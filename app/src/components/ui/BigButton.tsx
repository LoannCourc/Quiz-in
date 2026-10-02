import { Pressable, StyleSheet, Text } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function BigButton({ label, onPress, disabled = false, variant = 'primary' }: BigButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        (pressed || disabled) && styles.dimmed,
      ]}>
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
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
    borderRadius: AppSizes.radius,
  },
  primary: {
    backgroundColor: AppColors.accent,
  },
  secondary: {
    backgroundColor: AppColors.surface,
  },
  dimmed: {
    opacity: 0.5,
  },
  label: {
    fontSize: AppSizes.textLarge,
    fontWeight: '800',
  },
  primaryLabel: {
    color: AppColors.onAccent,
  },
  secondaryLabel: {
    color: AppColors.text,
  },
});
