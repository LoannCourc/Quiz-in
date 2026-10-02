import { StyleSheet, Switch, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
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
        <Text style={textStyles.label}>
          {title}
          {isDisabled && <Text style={styles.reason}> ({disabledReason})</Text>}
        </Text>
        <Text style={textStyles.muted}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={isDisabled}
        trackColor={{ true: AppColors.accent, false: AppColors.background }}
        thumbColor={AppColors.text}
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
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  disabled: {
    opacity: 0.5,
  },
  texts: {
    flex: 1,
    gap: Spacing.one,
  },
  reason: {
    color: AppColors.textMuted,
    fontSize: AppSizes.textBody,
    fontWeight: '400',
  },
});
