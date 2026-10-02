import type { Difficulty } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

// « Question 3 · Moyen », en tête des écrans de question.
export function QuestionHeader({ index, difficulty }: { index: number; difficulty: Difficulty }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{strings.game.questionLabel(index)}</Text>
      <Text style={textStyles.muted}>{strings.game.difficulties[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    color: AppColors.accent,
    fontSize: AppSizes.textLarge,
    fontWeight: '800',
  },
});
