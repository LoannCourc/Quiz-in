import type { PublicQuestion } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { AnswerState } from '@/lib/playerGame';

import { ChoicePill, choiceTextSize, pillSizeForHeight, type PillSize } from './ChoicePill';

interface QuestionViewProps {
  question: PublicQuestion;
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

// Écran de question mobile : l'énoncé se lit sur la TV ; les 4 pilules se partagent la hauteur restante
// (72 à 116 px chacune, hauteur minimale) et la taille du texte suit leur hauteur. Une pilule grandit si son
// texte le demande : rien n'est jamais rogné, l'écran défile en dernier recours.
export function QuestionView({ question, answer, onAnswer }: QuestionViewProps) {
  const locked = isLocked(answer);
  const chosen = answer.kind === 'idle' || typeof answer.given !== 'number' ? null : answer.given;
  const [pillSize, setPillSize] = useState<PillSize>('medium');
  const [pillHeight, setPillHeight] = useState<number>(AppSizes.choiceHeightMin);
  // Même taille de texte pour les 4 propositions, d'après la plus longue.
  const textSize = choiceTextSize(question.options ?? []);

  // Hauteur de la zone des réponses → hauteur d'une pilule → taille du texte (un rendu de plus).
  // Mesurée sur la place offerte (zone sans contenu), pas sur les pilules : un texte qui fait grandir une
  // pilule ne change pas la part des autres.
  function measureChoices(event: LayoutChangeEvent) {
    const share = (event.nativeEvent.layout.height - CHOICES_GAP * (CHOICE_COUNT_ON_SCREEN - 1)) / CHOICE_COUNT_ON_SCREEN;
    setPillSize(pillSizeForHeight(share));
    setPillHeight(Math.min(AppSizes.choiceHeightLarge, Math.max(AppSizes.choiceHeightMin, Math.floor(share))));
  }

  return (
    <View style={styles.container}>

      {question.options ? (
        <View style={styles.choices}>
          <View style={StyleSheet.absoluteFill} onLayout={measureChoices} pointerEvents="none" />
          {question.options.map((option, choice) => (
            <ChoicePill
              key={choice}
              choice={choice}
              text={option}
              isSelected={choice === chosen}
              isDimmed={locked && choice !== chosen}
              disabled={locked}
              size={pillSize}
              textSize={textSize}
              fillHeight={pillHeight}
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
    flexGrow: 1,
    gap: CHOICES_GAP,
  },
  centered: {
    textAlign: 'center',
  },
});
