import { StyleSheet, Switch, Text, View } from 'react-native';

import { playerTextStyles } from '@/components/player/playerTextStyles';
import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
import { Spacing } from '@/constants/theme';

interface OptionToggleProps {
  title: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
  // Raison affichée quand l'option ne peut pas être activée (« bientôt »…).
  disabledReason?: string;
}

export function OptionToggle({ title, hint, value, onChange, disabledReason }: OptionToggleProps) {
  const isDisabled = disabledReason !== undefined;
  return (
    <View style={[styles.row, isDisabled && styles.disabled]}>
      <View style={styles.texts}>
        <Text style={playerTextStyles.label}>
          {title}
          {isDisabled && <Text style={styles.reason}> ({disabledReason})</Text>}
        </Text>
        <Text style={playerTextStyles.muted}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={isDisabled}
        trackColor={{ true: PlayerColors.accent, false: PlayerColors.background }}
        thumbColor={PlayerColors.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: PlayerSizes.radius,
    backgroundColor: PlayerColors.surface,
  },
  disabled: {
    opacity: 0.5,
  },
  texts: {
    flex: 1,
    gap: Spacing.one,
  },
  reason: {
    color: PlayerColors.textMuted,
    fontSize: PlayerSizes.textBody,
    fontWeight: '400',
  },
});
