import { difficultyLevel } from '@shared/quizCatalog';
import type { QuizSummary } from '@shared/types';
import { Pressable, StyleSheet, Text } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface QuizCardProps {
  quiz: QuizSummary;
  onPress: () => void;
}

// Le niveau affiché est recalculé depuis la moyenne, pour rester cohérent avec les filtres.
export function QuizCard({ quiz, onPress }: QuizCardProps) {
  const level = strings.catalog.difficultyLevels[difficultyLevel(quiz.difficulty)];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.theme}>{quiz.theme}</Text>
      <Text style={textStyles.label}>{quiz.title}</Text>
      <Text style={textStyles.muted}>
        {strings.catalog.difficulty(level, quiz.difficulty)} ·{' '}
        {strings.catalog.details(quiz.questionCount, quiz.estimatedMinutes)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  theme: {
    color: AppColors.accent,
    fontSize: AppSizes.textBody,
    fontWeight: '700',
  },
});
