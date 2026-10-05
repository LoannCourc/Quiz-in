import { FREE_ANSWER_MAX_LENGTH } from '@shared/constants';
import type { PublicQuestion } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { isFreeText, type AnswerState, type FreeText } from '@/lib/playerGame';

import type { PhaseTiming } from './phaseTiming';
import { QuestionHeader } from './QuestionHeader';
import { Timebar } from './Timebar';

interface FreeQuestionViewProps {
  question: PublicQuestion;
  index: number;
  questionCount?: number;
  score: number;
  timing: PhaseTiming;
  answer: Exclude<AnswerState, { kind: 'sent' }>;
  onAnswer: (given: FreeText) => void;
}

// Texte déjà tapé : gardé après une erreur réseau, pour réessayer sans tout retaper.
function typedText(answer: FreeQuestionViewProps['answer']): FreeText {
  return answer.kind !== 'idle' && isFreeText(answer.given) ? answer.given : { value: '' };
}

// Réponse libre (maquette S1) : l'énoncé (ou, pour un blind test, ce qu'il faut trouver), un champ
// (deux pour un blind test « both » : titre et artiste, un seul suffit) et VALIDER. Entrée valide
// aussi. Correction et majuscule automatiques désactivées : la correction de l'hôte s'en charge.
// Un seul envoi : une fois validée, la réponse ne peut plus changer.
export function FreeQuestionView({ question, index, questionCount, score, timing, answer, onAnswer }: FreeQuestionViewProps) {
  const isBlindTest = question.ask !== undefined;
  const isBoth = question.ask === 'both';
  const [initial] = useState(() => typedText(answer));
  const [value, setValue] = useState(initial.value);
  const [artist, setArtist] = useState(initial.artist ?? '');
  const isLocked = answer.kind === 'sending' || (answer.kind === 'refused' && answer.reason === 'tooLate');
  const canSubmit = !isLocked && (value.trim() !== '' || (isBoth && artist.trim() !== ''));

  function submit() {
    if (canSubmit) onAnswer(isBoth ? { value, artist } : { value });
  }

  return (
    <View style={styles.container}>
      <QuestionHeader index={index} questionCount={questionCount} score={score} />
      <Timebar {...timing} />

      {isBlindTest && question.ask ? (
        <View style={styles.listening}>
          <Equalizer />
          <View style={styles.askPill}>
            <Text style={styles.askText}>{strings.game.freeQuestion.asks[question.ask]}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.questionText}>{question.text}</Text>
      )}

      {isBoth ? (
        <>
          <AnswerField
            label={strings.game.freeQuestion.titleLabel}
            placeholder={strings.game.freeQuestion.titlePlaceholder}
            text={value}
            onChangeText={setValue}
            onSubmit={submit}
            disabled={isLocked}
            autoFocus
          />
          <AnswerField
            label={strings.game.freeQuestion.artistLabel}
            placeholder={strings.game.freeQuestion.artistPlaceholder}
            text={artist}
            onChangeText={setArtist}
            onSubmit={submit}
            disabled={isLocked}
          />
          <Text style={styles.hint}>{strings.game.freeQuestion.bothHint}</Text>
        </>
      ) : (
        <>
          <AnswerField
            label={strings.game.freeQuestion.answerLabel}
            placeholder={strings.game.freeQuestion.answerPlaceholder}
            text={value}
            onChangeText={setValue}
            onSubmit={submit}
            disabled={isLocked}
            autoFocus
          />
          {!isBlindTest && <Text style={styles.hint}>{strings.game.freeQuestion.hint}</Text>}
        </>
      )}

      <View style={styles.footer}>
        {answer.kind === 'sending' && <Text style={[textStyles.muted, styles.centered]}>{strings.game.question.sending}</Text>}
        {answer.kind === 'refused' && (
          <Text style={[textStyles.error, styles.centered]}>{strings.game.question.refusals[answer.reason]}</Text>
        )}
        <BigButton label={strings.game.freeQuestion.submit} onPress={submit} disabled={!canSubmit} />
      </View>
    </View>
  );
}

interface AnswerFieldProps {
  label: string;
  placeholder: string;
  text: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  autoFocus?: boolean;
}

// Champ blanc, contour cyan quand il a le focus, compteur de caractères à droite.
function AnswerField({ label, placeholder, text, onChangeText, onSubmit, disabled, autoFocus = false }: AnswerFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputBox, isFocused && styles.inputFocused, disabled && styles.inputDisabled]}>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textMuted}
          maxLength={FREE_ANSWER_MAX_LENGTH}
          editable={!disabled}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          returnKeyType="send"
          submitBehavior="submit"
          accessibilityLabel={label}
          style={styles.input}
        />
        <Text style={styles.counter}>{strings.game.freeQuestion.counter(text.length, FREE_ANSWER_MAX_LENGTH)}</Text>
      </View>
    </View>
  );
}

// Indicateur d'écoute du blind test : barres fixes (le son ne joue que sur la TV).
const EQUALIZER_BARS = [18, 30, 42, 34, 44, 26, 14];

function Equalizer() {
  return (
    <View style={styles.equalizer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {EQUALIZER_BARS.map((height, barIndex) => (
        <View key={barIndex} style={[styles.bar, { height }]} />
      ))}
    </View>
  );
}

const FIELD_BORDER = 3;
const BAR_WIDTH = 8;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: Spacing.three,
  },
  questionText: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textLarge,
    textAlign: 'center',
  },
  listening: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  equalizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one + 2,
    height: 44,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: AppColors.link,
  },
  askPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.link,
  },
  askText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  field: {
    gap: Spacing.one + 2,
  },
  fieldLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AppSizes.buttonHeight,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: FIELD_BORDER,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.card,
    boxShadow: AppShadows.hard,
  },
  inputFocused: {
    borderColor: AppColors.link,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.two,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 22,
    // Web : pas de contour du navigateur, le cadre cyan indique le focus.
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  counter: {
    ...TEXT_FIT_SAFETY,
    marginLeft: Spacing.two,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing.two,
  },
  centered: {
    textAlign: 'center',
  },
});
