import { QUESTIONS_PER_GAME } from '@shared/constants';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { gameQuestionCount, poolOf } from '@shared/questionPool';
import { estimateGameMinutes } from '@shared/quizCatalog';
import { parseQuizSummary } from '@shared/quizValidation';
import type { QuizSummary, SessionSettings } from '@shared/types';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';

// Nom du jeu (QUIZ, BLIND TEST, BLUFF, DESSINE-MOI ; jamais le titre du quiz) et la méta. Fiche absente ou
// mal formée : rien n'est affiché (le salon reste utilisable). Dessine-moi : fiche locale (pas de quiz dans la
// base). drawRounds : Dessine-moi, nombre de manches choisi dans les réglages (la durée suit).
// Partie tirée dans des thèmes ou un mélange (settings.themes, settings.quizIds) : le nombre de questions choisi.
export function LobbyHeader({ quizId, drawRounds, settings }: { quizId: string; drawRounds?: number; settings: SessionSettings }) {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  const summary = useMemo(() => {
    if (quizId === DRAW_QUIZ_ID) return DRAW_QUIZ_SUMMARY;
    return quiz.kind === 'ready' ? parseQuizSummary(quiz.value) : null;
  }, [quiz, quizId]);
  const pool = poolOf(settings);
  if (pool) {
    const count = gameQuestionCount(settings);
    const gameType = pool.kind === 'themes' ? 'quiz' : 'bluff';
    return <LobbyTitle title={strings.home.games[gameType].name} meta={strings.hostLobby.quizMeta(count, estimateGameMinutes(count, settings) ?? 0)} />;
  }
  if (!summary) return null;
  const shown =
    drawRounds && summary.gameType === 'draw'
      ? { ...summary, questionCount: drawRounds, estimatedMinutes: Math.round((summary.estimatedMinutes * drawRounds) / summary.questionCount) }
      : summary;
  return <LobbyQuizTitle quiz={shown} />;
}

// Affichage seul, à partir d'une fiche déjà validée.
export function LobbyQuizTitle({ quiz }: { quiz: QuizSummary }) {
  const meta =
    quiz.gameType === 'draw'
      ? strings.hostLobby.roundsMeta(quiz.questionCount, quiz.estimatedMinutes)
      : strings.hostLobby.quizMeta(Math.min(quiz.questionCount, QUESTIONS_PER_GAME), quiz.estimatedMinutes);
  return <LobbyTitle title={strings.home.games[quiz.gameType].name} meta={meta} />;
}

function LobbyTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.meta}>{meta}</Text>
    </View>
  );
}

const TITLE_SIZE = 18;

const styles = StyleSheet.create({
  title: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  meta: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
});
