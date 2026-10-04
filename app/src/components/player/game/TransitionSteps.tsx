import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

export type TransitionStep = 0 | 1 | 2;

// Étapes entre deux questions : Révélation, Classement, Question suivante (l'étape en cours
// en or). Indication seulement, sans interaction. Suspense (withRanking faux) : sans Classement.
export function TransitionSteps({ active, withRanking = true }: { active: TransitionStep; withRanking?: boolean }) {
  const activeLabel = strings.game.transition.steps[active];
  const steps = withRanking ? strings.game.transition.steps : strings.game.transition.steps.filter((_, index) => index !== 1);
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel={activeLabel}>
      {steps.map((label) => {
        const isActive = label === activeLabel;
        return (
          <View key={label} style={[styles.step, isActive && styles.activeStep]}>
            <Text style={[styles.label, isActive && styles.activeLabel]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  step: {
    flexShrink: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.surface,
  },
  activeStep: {
    backgroundColor: AppColors.accent,
  },
  label: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: AppColors.onAccent,
  },
});
