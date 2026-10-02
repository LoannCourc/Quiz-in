import type { PlayerResult } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface RevealViewProps {
  correctAnswer: string;
  explanation?: string;
  // undefined : le joueur n'a pas répondu.
  result: PlayerResult | undefined;
  rank: number;
  score: number;
  playerCount: number;
}

type Outcome = 'correct' | 'wrong' | 'noAnswer';

function outcomeOf(result: PlayerResult | undefined): Outcome {
  if (!result) return 'noAnswer';
  return result.correct ? 'correct' : 'wrong';
}

// Icône et texte en plus de la couleur : le résultat reste lisible sans distinguer les couleurs.
const OUTCOMES: Record<Outcome, { icon: string; label: string; color: string }> = {
  correct: { icon: '✓', label: strings.game.reveal.correct, color: AppColors.correct },
  wrong: { icon: '✗', label: strings.game.reveal.wrong, color: AppColors.wrong },
  noAnswer: { icon: '–', label: strings.game.reveal.noAnswer, color: AppColors.textMuted },
};

export function RevealView({ correctAnswer, explanation, result, rank, score, playerCount }: RevealViewProps) {
  const outcome = OUTCOMES[outcomeOf(result)];
  const { ordinal, points } = strings.game;

  return (
    <View style={styles.container}>
      <View style={[styles.outcome, { borderColor: outcome.color }]}>
        <Text style={[styles.icon, { color: outcome.color }]}>{outcome.icon}</Text>
        <Text style={[styles.outcomeLabel, { color: outcome.color }]}>{outcome.label}</Text>
        {result && <Text style={styles.points}>{strings.game.reveal.pointsWon(result.points)}</Text>}
      </View>

      <View style={styles.answer}>
        <Text style={textStyles.muted}>{strings.game.reveal.correctAnswerLabel}</Text>
        <Text style={styles.correctAnswer}>{correctAnswer}</Text>
        {explanation && <Text style={textStyles.body}>{explanation}</Text>}
      </View>

      <View style={styles.standing}>
        <Text style={textStyles.label}>{strings.game.reveal.rank(ordinal(rank), playerCount)}</Text>
        <Text style={textStyles.muted}>{strings.game.reveal.total(points(score))}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  outcome: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: AppSizes.radius,
    borderWidth: 4,
    backgroundColor: AppColors.surface,
  },
  icon: {
    fontSize: AppSizes.textHuge,
    fontWeight: '900',
  },
  outcomeLabel: {
    fontSize: AppSizes.textTitle,
    fontWeight: '900',
  },
  points: {
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '800',
  },
  answer: {
    gap: Spacing.one,
  },
  correctAnswer: {
    color: AppColors.correct,
    fontSize: AppSizes.textLarge,
    fontWeight: '800',
  },
  standing: {
    alignItems: 'center',
    gap: Spacing.one,
  },
});
