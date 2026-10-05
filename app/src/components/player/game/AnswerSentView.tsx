import type { PublicQuestion } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { MarkIcon } from '@/components/ui/MarkIcon';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { isFreeText, type FreeText, type GivenAnswer } from '@/lib/playerGame';

import { ChoicePill, choiceTextSize } from './ChoicePill';
import type { PhaseTiming } from './phaseTiming';
import { QuestionHeader } from './QuestionHeader';
import { Timebar } from './Timebar';

interface AnswerSentViewProps {
  question: PublicQuestion;
  index: number;
  questionCount?: number;
  score: number;
  timing: PhaseTiming;
  // null : réponse envoyée avant un rechargement de la page, inconnue de l'appareil.
  given: GivenAnswer | null;
  // Joueurs connectés ayant répondu / joueurs connectés (answeredBy : qui, jamais quoi).
  progress: { answered: number; total: number };
}

// Réponse définitive : un seul message, très gros, le rappel de la réponse, puis combien de joueurs
// ont répondu ; le temps restant reste affiché par la barre. Réponse libre : maquette S2.
export function AnswerSentView({ question, index, questionCount, score, timing, given, progress }: AnswerSentViewProps) {
  const isFree = question.options === undefined;
  return (
    <View style={[styles.container, isFree && styles.freeContainer]}>
      <QuestionHeader index={index} questionCount={questionCount} score={score} />
      <Timebar {...timing} />
      {isFree ? (
        <FreeSent given={isFreeText(given) ? given : null} />
      ) : (
        <>
          <Text style={textStyles.hero}>{strings.game.answerSent.title}</Text>
          <ChoiceSent question={question} choice={typeof given === 'number' ? given : null} />
        </>
      )}
      <Text style={styles.progress}>{strings.game.answerSent.answeredProgress(progress.answered, progress.total)}</Text>
      {isFree ? (
        <Text style={[textStyles.muted, styles.centered, styles.locked]}>{strings.game.answerSent.locked}</Text>
      ) : (
        <Text style={[textStyles.muted, styles.centered]}>{strings.game.answerSent.waiting}</Text>
      )}
    </View>
  );
}

function ChoiceSent({ question, choice }: { question: PublicQuestion; choice: number | null }) {
  const option = choice === null ? undefined : question.options?.[choice];
  if (option === undefined || choice === null) {
    return <Text style={[textStyles.body, styles.centered]}>{strings.game.answerSent.unknownChoice}</Text>;
  }
  return <ChoicePill choice={choice} text={option} textSize={choiceTextSize(question.options ?? [])} isSelected />;
}

// Coche verte, « RÉPONSE ENVOYÉE », puis la carte « TA RÉPONSE » (titre – artiste pour « both »).
function FreeSent({ given }: { given: FreeText | null }) {
  const text = given ? strings.game.answerSent.bothAnswer(given.value.trim(), given.artist?.trim() ?? '') : '';
  return (
    <View style={styles.freeSent}>
      <View style={styles.checkDisc}>
        <MarkIcon kind="check" size={52} color={AppColors.onCorrect} />
      </View>
      <Text style={textStyles.hero}>{strings.game.answerSent.title}</Text>
      {text === '' ? (
        <Text style={[textStyles.body, styles.centered]}>{strings.game.answerSent.unknownChoice}</Text>
      ) : (
        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>{strings.game.answerSent.yourAnswer}</Text>
          <Text style={styles.answerText}>{text}</Text>
        </View>
      )}
      <Text style={[textStyles.body, styles.centered]}>{strings.game.answerSent.freeWaiting}</Text>
    </View>
  );
}

const PROGRESS_SIZE = 22;
const CHECK_SIZE = 96;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  freeContainer: {
    flexGrow: 1,
  },
  freeSent: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  checkDisc: {
    alignSelf: 'center',
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.correct,
    boxShadow: AppShadows.hard,
  },
  answerCard: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  answerLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  answerText: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textLarge,
    textAlign: 'center',
  },
  progress: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: PROGRESS_SIZE,
    lineHeight: Math.round(PROGRESS_SIZE * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  locked: {
    fontSize: 14,
  },
  centered: {
    textAlign: 'center',
  },
});
