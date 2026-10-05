import type { ValidationDecisions } from '@shared/freeAnswers';
import type { Question, Session } from '@shared/types';
import type { ExpectedAnswer, ReviewGroup } from '@shared/validationReview';
import { StyleSheet, Text, View } from 'react-native';

import { TransitionSteps } from '@/components/player/game/TransitionSteps';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { ReviewGroupCard } from './ReviewGroupCard';

// Variantes écrites en minuscules dans le contenu (« napoléon ») : majuscule initiale à l'affichage.
function capitalized(text: string): string {
  return text.charAt(0).toLocaleUpperCase('fr') + text.slice(1);
}

interface HostValidationProps {
  session: Session;
  question: Question;
  expected: ExpectedAnswer;
  groups: ReviewGroup[];
  decisions: ValidationDecisions;
  onChange: (decisions: ValidationDecisions) => void;
}

// Validation des réponses par l'hôte (Contrôle, maquette V1) : étapes, question, réponse attendue et
// variantes acceptées, puis les réponses regroupées. Les coches suivent la correction automatique
// tant que l'hôte n'y touche pas ; « Valider les réponses » est dans le pied d'écran.
export function HostValidation({ session, question, expected, groups, decisions, onChange }: HostValidationProps) {
  const { hostValidation } = strings;
  const answeredCount = groups.reduce((total, group) => total + group.playerIds.length, 0);
  const totalPlayers = Object.keys(session.players).length;
  const pill = strings.game.questionPill(session.currentIndex, session.questionCount);
  const subtitle = question.music && question.ask ? `${pill} · ${hostValidation.blindTest[question.ask]}` : pill;

  function decide(part: 'main' | 'artist', key: string, accepted: boolean) {
    onChange({ ...decisions, [part]: { ...decisions[part], [key]: accepted } });
  }

  function toggleHidden(key: string) {
    onChange({ ...decisions, hidden: { ...decisions.hidden, [key]: !decisions.hidden?.[key] } });
  }

  return (
    <View style={styles.container}>
      <TransitionSteps active={1} labels={hostValidation.steps} />
      <View style={styles.question}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      <View style={styles.expected}>
        <Text style={styles.expectedLabel}>{hostValidation.expected}</Text>
        <Text style={styles.expectedTitle}>{expected.title}</Text>
        {expected.artist !== undefined && <Text style={styles.expectedArtist}>{expected.artist}</Text>}
        {expected.variants.length > 0 && (
          <Text style={styles.variants}>{hostValidation.alsoAccepted(expected.variants.map(capitalized))}</Text>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{hostValidation.received}</Text>
        <Text style={styles.listCount}>{hostValidation.receivedCount(answeredCount, totalPlayers)}</Text>
      </View>
      {groups.length === 0 ? (
        <Text style={[textStyles.muted, styles.centered]}>{hostValidation.noAnswer}</Text>
      ) : (
        groups.map((group) => (
          <ReviewGroupCard
            key={group.key}
            group={group}
            players={session.players}
            onMain={(accepted) => decide('main', group.main.key, accepted)}
            onArtist={(accepted) => group.artist && decide('artist', group.artist.key, accepted)}
            onToggleHidden={() => toggleHidden(group.key)}
          />
        ))
      )}
      {groups.length > 0 && <Text style={[styles.hint, styles.centered]}>{hostValidation.eyeHint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  question: {
    gap: Spacing.one,
  },
  subtitle: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  questionText: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
  expected: {
    gap: 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.link,
  },
  expectedLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  expectedTitle: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 22,
  },
  expectedArtist: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 17,
  },
  variants: {
    marginTop: Spacing.one,
    color: AppColors.ink,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listCount: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  centered: {
    textAlign: 'center',
  },
});
