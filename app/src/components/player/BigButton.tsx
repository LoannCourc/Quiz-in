import { Pressable, StyleSheet, Text } from 'react-native';

import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
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
    minHeight: PlayerSizes.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: PlayerSizes.radius,
  },
  primary: {
    backgroundColor: PlayerColors.accent,
  },
  secondary: {
    backgroundColor: PlayerColors.surface,
  },
  dimmed: {
    opacity: 0.5,
  },
  label: {
    fontSize: PlayerSizes.textLarge,
    fontWeight: '800',
  },
  primaryLabel: {
    color: PlayerColors.onAccent,
  },
  secondaryLabel: {
    color: PlayerColors.text,
  },
});
