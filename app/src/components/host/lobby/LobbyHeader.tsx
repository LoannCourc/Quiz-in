import { DEFAULT_SESSION_SETTINGS, QUESTIONS_PER_GAME } from '@shared/constants';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { gameQuestionCount, poolOf } from '@shared/questionPool';
import { estimateGameMinutes, playedQuizName } from '@shared/quizCatalog';
import { parseQuizSummary } from '@shared/quizValidation';
import type { QuizSummary, SessionSettings } from '@shared/types';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { FittedLine } from '@/components/ui/FittedLine';
import { useLiveValue } from '@/hooks/useLiveValue';
import { formatPlayedQuizName } from '@/lib/playedQuizName';

// Nom du jeu (QUIZ, BLIND TEST, BLUFF, DESSINE-MOI), titre du quiz fixe ou du blind test, et la méta. Fiche absente ou
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
  return <LobbyQuizTitle quiz={shown} settings={settings} />;
}

// Affichage seul, à partir d'une fiche déjà validée. Quiz fixe ou blind test : son titre et son niveau sous le
// nom du jeu (« Électro des années 80 · Moyen »).
export function LobbyQuizTitle({ quiz, settings = DEFAULT_SESSION_SETTINGS }: { quiz: QuizSummary; settings?: SessionSettings }) {
  const meta =
    quiz.gameType === 'draw'
      ? strings.hostLobby.roundsMeta(quiz.questionCount, quiz.estimatedMinutes)
      : strings.hostLobby.quizMeta(Math.min(quiz.questionCount, QUESTIONS_PER_GAME), quiz.estimatedMinutes);
  return <LobbyTitle title={strings.home.games[quiz.gameType].name} name={formatPlayedQuizName(playedQuizName(quiz, settings))} meta={meta} />;
}

// Méta et nom du quiz toujours sur une ligne (« environ 6 min » passait à la ligne à 320 de large) : taille
// réduite pour tenir dans la colonne.
function LobbyTitle({ title, name, meta }: { title: string; name?: string | null; meta: string }) {
  return (
    <View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {name && <FittedLine text={name} style={styles.name} minSize={NAME_MIN_SIZE} />}
      <FittedLine text={meta} style={styles.meta} minSize={META_MIN_SIZE} />
    </View>
  );
}

const TITLE_SIZE = 18;
const META_SIZE = 15;
const META_MIN_SIZE = 11;
const NAME_SIZE = 16;
const NAME_MIN_SIZE = 11;

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
    fontSize: META_SIZE,
  },
  name: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: NAME_SIZE,
  },
});
