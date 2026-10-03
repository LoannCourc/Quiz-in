import type { PublicQuestion } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
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
  // Joueurs connectés ayant répondu / joueurs connectés (answeredBy : qui, jamais quoi).
  progress: { answered: number; total: number };
}

// Réponse définitive : un seul message, très gros, le rappel du choix (contour blanc), puis
// combien de joueurs ont répondu ; le temps restant reste affiché par la barre.
export function AnswerSentView({ question, index, questionCount, score, timing, choice, progress }: AnswerSentViewProps) {
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
      <Text style={styles.progress}>{strings.game.answerSent.answeredProgress(progress.answered, progress.total)}</Text>
      <Text style={[textStyles.muted, styles.centered]}>{strings.game.answerSent.waiting}</Text>
    </View>
  );
}

const PROGRESS_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  progress: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: PROGRESS_SIZE,
    lineHeight: Math.round(PROGRESS_SIZE * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  centered: {
    textAlign: 'center',
  },
});
