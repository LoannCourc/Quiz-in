import type { PublicQuestion } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { ChoicePill } from './ChoicePill';
import type { PhaseTiming } from './phaseTiming';
import { QuestionHeader } from './QuestionHeader';
import { Timebar } from './Timebar';

interface AnswerSentViewProps {
  question: PublicQuestion;
  index: number;
  questionCount?: number;
  score: number;
  timing: PhaseTiming;
  // null : réponse envoyée avant un rechargement de la page, choix inconnu du téléphone.
  choice: number | null;
}

// Réponse définitive : un seul message, très gros, et le rappel du choix (contour blanc).
export function AnswerSentView({ question, index, questionCount, score, timing, choice }: AnswerSentViewProps) {
  const option = choice === null ? undefined : question.options?.[choice];

  return (
    <View style={styles.container}>
      <QuestionHeader index={index} questionCount={questionCount} score={score} />
      <Timebar {...timing} />
      <Text style={textStyles.hero}>{strings.game.answerSent.title}</Text>
      {option !== undefined && choice !== null ? (
        <ChoicePill choice={choice} text={option} isSelected />
      ) : (
        <Text style={[textStyles.body, styles.centered]}>{strings.game.answerSent.unknownChoice}</Text>
      )}
      <Text style={[textStyles.muted, styles.centered]}>{strings.game.answerSent.waiting}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
});
