import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

export type TransitionStep = 0 | 1 | 2;

// Étapes entre deux questions : Révélation, Classement, Question suivante (l'étape en cours
// en or). Indication seulement, sans interaction. Suspense ou dernière question (withRanking faux) : sans
// Classement ; dernière question : « Classement final » à la place de « Question suivante ».
// Étiquettes jamais tronquées : sur un écran trop étroit (ou en grande police), elles passent à la ligne.
// labels : autres étapes, même présentation (validation de l'hôte : Question, Validation, Révélation).
export function TransitionSteps({
  active,
  withRanking = true,
  isLastQuestion = false,
  labels = strings.game.transition.steps,
}: {
  active: TransitionStep;
  withRanking?: boolean;
  isLastQuestion?: boolean;
  labels?: readonly string[];
}) {
  const activeLabel = labels[active];
  const named = isLastQuestion ? [...labels.slice(0, 2), strings.game.transition.finalStep] : labels;
  const steps = withRanking ? named : named.filter((_, index) => index !== 1);
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel={activeLabel}>
      {steps.map((label) => {
        const isActive = label === activeLabel;
        return (
          <View key={label} style={[styles.step, isActive && styles.activeStep]}>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Assez serré pour que les trois étapes tiennent sur une ligne sur un téléphone de 360 dp.
const STEP_PADDING = 6;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  step: {
    paddingHorizontal: STEP_PADDING,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.surface,
  },
  activeStep: {
    backgroundColor: AppColors.accent,
  },
  label: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: AppColors.onAccent,
  },
});
