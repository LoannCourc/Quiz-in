import type { PublicQuestion } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { AnswerState } from '@/lib/playerGame';

import { ChoicePill } from './ChoicePill';
import { Countdown, type PhaseTiming } from './Countdown';
import { QuestionCard } from './QuestionCard';
import { QuestionHeader } from './QuestionHeader';

interface QuestionViewProps {
  question: PublicQuestion;
  index: number;
  questionCount?: number;
  score: number;
  timing: PhaseTiming;
  answer: Exclude<AnswerState, { kind: 'sent' }>;
  onAnswer: (choice: number) => void;
}

// Un seul appui : dès qu'un choix est fait, tous les boutons sont désactivés, avant même la
// confirmation de l'écriture. Seule une erreur réseau rouvre les boutons pour réessayer.
function isLocked(answer: QuestionViewProps['answer']): boolean {
  if (answer.kind === 'sending') return true;
  return answer.kind === 'refused' && answer.reason === 'tooLate';
}

export function QuestionView({ question, index, questionCount, score, timing, answer, onAnswer }: QuestionViewProps) {
  const locked = isLocked(answer);
  const chosen = answer.kind === 'idle' ? null : answer.choice;

  return (
    <View style={styles.container}>
      <QuestionHeader index={index} questionCount={questionCount} score={score} />
      <Countdown {...timing} />
      <QuestionCard text={question.text} />

      {question.options ? (
        <View style={styles.choices}>
          {question.options.map((option, choice) => (
            <ChoicePill
              key={choice}
              choice={choice}
              text={option}
              isSelected={choice === chosen}
              isDimmed={locked && choice !== chosen}
              disabled={locked}
              onPress={() => onAnswer(choice)}
            />
          ))}
        </View>
      ) : (
        <Text style={textStyles.muted}>{strings.game.waiting}</Text>
      )}

      {answer.kind === 'sending' && <Text style={[textStyles.muted, styles.centered]}>{strings.game.question.sending}</Text>}
      {answer.kind === 'refused' && (
        <Text style={[textStyles.error, styles.centered]}>{strings.game.question.refusals[answer.reason]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  choices: {
    gap: Spacing.three,
  },
  centered: {
    textAlign: 'center',
  },
});
