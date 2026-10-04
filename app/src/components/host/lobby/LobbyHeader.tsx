import { QUESTIONS_PER_GAME } from '@shared/constants';
import { parseQuizSummary } from '@shared/quizValidation';
import type { QuizSummary } from '@shared/types';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';

// Titre du quiz et sa méta. Fiche absente ou mal formée : rien n'est affiché (le salon reste utilisable).
export function LobbyHeader({ quizId }: { quizId: string }) {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  const summary = useMemo(() => (quiz.kind === 'ready' ? parseQuizSummary(quiz.value) : null), [quiz]);
  return summary && <LobbyQuizTitle quiz={summary} />;
}

// Affichage seul, à partir d'une fiche déjà validée.
export function LobbyQuizTitle({ quiz }: { quiz: QuizSummary }) {
  return (
    <View>
      <Text style={styles.title} numberOfLines={2}>
        {quiz.title}
      </Text>
      <Text style={styles.meta}>
        {strings.hostLobby.quizMeta(Math.min(quiz.questionCount, QUESTIONS_PER_GAME), quiz.estimatedMinutes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  meta: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
});
