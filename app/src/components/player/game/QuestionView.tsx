import type { ChoiceOptions, PublicQuestion } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { AnswerState } from '@/lib/playerGame';

import { Countdown, type PhaseTiming } from './Countdown';
import { QuestionHeader } from './QuestionHeader';

interface QuestionViewProps {
  question: PublicQuestion;
  index: number;
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

export function QuestionView({ question, index, timing, answer, onAnswer }: QuestionViewProps) {
  const locked = isLocked(answer);
  const chosen = answer.kind === 'idle' ? null : answer.choice;

  return (
    <View style={styles.container}>
      <QuestionHeader index={index} difficulty={question.difficulty} />
      <Countdown key={timing.phaseStartedAt} {...timing} />
      <Text style={styles.text}>{question.text}</Text>

      {question.options ? (
        <ChoiceButtons options={question.options} chosen={chosen} locked={locked} onAnswer={onAnswer} />
      ) : (
        <Text style={textStyles.muted}>{strings.game.waiting}</Text>
      )}

      {answer.kind === 'sending' && <Text style={[textStyles.muted, styles.centered]}>{strings.game.question.sending}</Text>}
      {answer.kind === 'refused' && <Text style={textStyles.error}>{strings.game.question.refusals[answer.reason]}</Text>}
    </View>
  );
}

interface ChoiceButtonsProps {
  options: ChoiceOptions;
  chosen: number | null;
  locked: boolean;
  onAnswer: (choice: number) => void;
}

function ChoiceButtons({ options, chosen, locked, onAnswer }: ChoiceButtonsProps) {
  return (
    <View style={styles.choices}>
      {options.map((option, choice) => {
        const isChosen = choice === chosen;
        const letter = strings.game.choiceLetters[choice];
        return (
          <Pressable
            key={choice}
            accessibilityRole="button"
            accessibilityLabel={`${letter} : ${option}`}
            accessibilityState={{ disabled: locked, selected: isChosen }}
            disabled={locked}
            onPress={() => onAnswer(choice)}
            style={({ pressed }) => [
              styles.choice,
              isChosen && styles.chosenChoice,
              locked && !isChosen && styles.dimmed,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.letter, isChosen && styles.chosenText]}>{letter}</Text>
            <Text style={[styles.option, isChosen && styles.chosenText]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  text: {
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '700',
  },
  choices: {
    gap: Spacing.two,
  },
  choice: {
    minHeight: AppSizes.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: AppColors.surface,
  },
  chosenChoice: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accent,
  },
  dimmed: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  letter: {
    color: AppColors.accent,
    fontSize: AppSizes.textLarge,
    fontWeight: '900',
  },
  option: {
    flex: 1,
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '700',
  },
  chosenText: {
    color: AppColors.onAccent,
  },
  centered: {
    textAlign: 'center',
  },
});
