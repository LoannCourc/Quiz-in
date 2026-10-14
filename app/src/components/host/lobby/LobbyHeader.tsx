import { QUESTIONS_PER_GAME } from '@shared/constants';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { gameQuestionCount, poolOf } from '@shared/questionPool';
import { estimateGameMinutes } from '@shared/quizCatalog';
import { parseQuizSummary } from '@shared/quizValidation';
import type { QuizSummary, SessionSettings } from '@shared/types';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';

// Titre du quiz (ou du jeu) et sa méta. Fiche absente ou mal formée : rien n'est affiché (le salon reste
// utilisable). Dessine-moi : fiche locale (pas de quiz dans la base).
// drawRounds : Dessine-moi, nombre de manches choisi dans les réglages (la durée suit).
// Partie tirée dans des thèmes (settings.themes) : les thèmes et le nombre de questions choisi.
export function LobbyHeader({ quizId, drawRounds, settings }: { quizId: string; drawRounds?: number; settings: SessionSettings }) {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  const summary = useMemo(() => {
    if (quizId === DRAW_QUIZ_ID) return DRAW_QUIZ_SUMMARY;
    return quiz.kind === 'ready' ? parseQuizSummary(quiz.value) : null;
  }, [quiz, quizId]);
  const pool = poolOf(settings);
  if (pool) {
    const count = gameQuestionCount(settings);
    const title = pool.kind === 'themes' ? themesTitle(pool.themes) : strings.hostLobby.mixTitle(pool.quizIds.length);
    return <LobbyTitle title={title} meta={strings.hostLobby.quizMeta(count, estimateGameMinutes(count, settings) ?? 0)} />;
  }
  if (!summary) return null;
  const shown =
    drawRounds && summary.gameType === 'draw'
      ? { ...summary, questionCount: drawRounds, estimatedMinutes: Math.round((summary.estimatedMinutes * drawRounds) / summary.questionCount) }
      : summary;
  return <LobbyQuizTitle quiz={shown} />;
}

function themesTitle(themes: readonly string[]): string {
  return themes.length <= 2 ? themes.join(' + ') : strings.catalog.themesGame.themes(themes.length);
}

// Affichage seul, à partir d'une fiche déjà validée.
export function LobbyQuizTitle({ quiz }: { quiz: QuizSummary }) {
  const meta =
    quiz.gameType === 'draw'
      ? strings.hostLobby.roundsMeta(quiz.questionCount, quiz.estimatedMinutes)
      : strings.hostLobby.quizMeta(Math.min(quiz.questionCount, QUESTIONS_PER_GAME), quiz.estimatedMinutes);
  return <LobbyTitle title={quiz.title} meta={meta} />;
}

function LobbyTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.meta}>{meta}</Text>
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
