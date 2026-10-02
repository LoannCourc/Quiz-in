import type { PublicQuestion } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { Countdown, type PhaseTiming } from './Countdown';
import { QuestionHeader } from './QuestionHeader';

interface AnswerSentViewProps {
  question: PublicQuestion;
  index: number;
  timing: PhaseTiming;
  // null : réponse envoyée avant un rechargement de la page, choix inconnu du téléphone.
  choice: number | null;
}

// Réponse définitive : on rappelle le choix et on attend la fin du chrono ou des autres.
export function AnswerSentView({ question, index, timing, choice }: AnswerSentViewProps) {
  const option = choice === null ? undefined : question.options?.[choice];

  return (
    <View style={styles.container}>
      <QuestionHeader index={index} difficulty={question.difficulty} />
      <Countdown key={timing.phaseStartedAt} {...timing} />

      <View style={styles.card}>
        <Text style={styles.title}>{`✓ ${strings.game.answerSent.title}`}</Text>
        {option !== undefined && choice !== null ? (
          <>
            <Text style={textStyles.muted}>{strings.game.answerSent.yourChoice}</Text>
            <Text style={styles.choice}>{`${strings.game.choiceLetters[choice]} · ${option}`}</Text>
          </>
        ) : (
          <Text style={textStyles.body}>{strings.game.answerSent.unknownChoice}</Text>
        )}
      </View>

      <Text style={[textStyles.muted, styles.centered]}>{strings.game.answerSent.waiting}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  card: {
    gap: Spacing.two,
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  title: {
    color: AppColors.accent,
    fontSize: AppSizes.textTitle,
    fontWeight: '900',
    textAlign: 'center',
  },
  choice: {
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '700',
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
