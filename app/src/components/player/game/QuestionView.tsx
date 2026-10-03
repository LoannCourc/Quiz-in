import type { PublicQuestion } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { AnswerState } from '@/lib/playerGame';

import { ChoicePill, pillSizeForHeight, type PillSize } from './ChoicePill';
import type { PhaseTiming } from './phaseTiming';
import { QuestionHeader } from './QuestionHeader';
import { Timebar } from './Timebar';

interface QuestionViewProps {
  question: PublicQuestion;
  index: number;
  questionCount?: number;
  score: number;
  timing: PhaseTiming;
  answer: Exclude<AnswerState, { kind: 'sent' }>;
  onAnswer: (choice: number) => void;
}

const CHOICE_COUNT_ON_SCREEN = 4;
const CHOICES_GAP = Spacing.three;

// Un seul appui : dès qu'un choix est fait, tous les boutons sont désactivés, avant même la
// confirmation de l'écriture. Seule une erreur réseau rouvre les boutons pour réessayer.
function isLocked(answer: QuestionViewProps['answer']): boolean {
  if (answer.kind === 'sending') return true;
  return answer.kind === 'refused' && answer.reason === 'tooLate';
}

// Écran de question mobile, sans défilement : l'énoncé se lit sur la TV ; les 4 pilules se
// partagent la hauteur restante (72 à 116 px chacune) et la taille du texte suit leur hauteur.
export function QuestionView({ question, index, questionCount, score, timing, answer, onAnswer }: QuestionViewProps) {
  const locked = isLocked(answer);
  const chosen = answer.kind === 'idle' ? null : answer.choice;
  const [pillSize, setPillSize] = useState<PillSize>('medium');

  // Hauteur de la zone des réponses → hauteur d'une pilule → taille du texte (un rendu de plus).
  function measureChoices(event: LayoutChangeEvent) {
    const pillHeight = (event.nativeEvent.layout.height - CHOICES_GAP * (CHOICE_COUNT_ON_SCREEN - 1)) / CHOICE_COUNT_ON_SCREEN;
    setPillSize(pillSizeForHeight(pillHeight));
  }

  return (
    <View style={styles.container}>
      <QuestionHeader index={index} questionCount={questionCount} score={score} />
      <Timebar {...timing} />

      {question.options ? (
        <View style={styles.choices} onLayout={measureChoices}>
          {question.options.map((option, choice) => (
            <ChoicePill
              key={choice}
              choice={choice}
              text={option}
              isSelected={choice === chosen}
              isDimmed={locked && choice !== chosen}
              disabled={locked}
              size={pillSize}
              fill
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
    flexGrow: 1,
    gap: Spacing.three,
  },
  choices: {
    flex: 1,
    gap: CHOICES_GAP,
  },
  centered: {
    textAlign: 'center',
  },
});
