import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface QuestionHeaderProps {
  index: number;
  // Nombre de questions de la partie (absent avant le lancement : « QUESTION 3 » seul).
  questionCount?: number;
  score: number;
}

// Pastille or « QUESTION 3/10 » à gauche, score du joueur à droite (maquette mobile).
export function QuestionHeader({ index, questionCount, score }: QuestionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{strings.game.questionPill(index, questionCount)}</Text>
      </View>
      <Text style={styles.score}>{strings.game.score(score)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
  },
  pillText: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.display,
    fontSize: 15,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  score: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 17,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
});
