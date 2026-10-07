import { QUESTIONS_PER_GAME } from '@shared/constants';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { parseQuizSummary } from '@shared/quizValidation';
import type { QuizSummary } from '@shared/types';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';

// Titre du quiz (ou du jeu) et sa méta. Fiche absente ou mal formée : rien n'est affiché (le salon reste
// utilisable). Dessine-moi : fiche locale (pas de quiz dans la base).
export function LobbyHeader({ quizId }: { quizId: string }) {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  const summary = useMemo(() => {
    if (quizId === DRAW_QUIZ_ID) return DRAW_QUIZ_SUMMARY;
    return quiz.kind === 'ready' ? parseQuizSummary(quiz.value) : null;
  }, [quiz, quizId]);
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
        {quiz.gameType === 'draw'
          ? strings.hostLobby.roundsMeta(quiz.questionCount, quiz.estimatedMinutes)
          : strings.hostLobby.quizMeta(Math.min(quiz.questionCount, QUESTIONS_PER_GAME), quiz.estimatedMinutes)}
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
