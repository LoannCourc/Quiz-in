import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { catalogThemes, filterByGameType } from '@shared/catalogRows';
import { areSettingsCompatible, settingsForGameType } from '@shared/quizCatalog';
import { availableQuestionCounts, poolQuestionTotal, poolQuizzes, QUIZ_QUESTION_COUNTS, withPool } from '@shared/questionPool';
import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import type { QuizSummary, SessionSettings } from '@shared/types';
import { isValidRoomCode } from '@shared/roomCode';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';
import { useSoundPreferences } from '@/hooks/useSoundPreferences';
import { useStartGame } from '@/hooks/useStartGame';

// Thème générique (icône « ? ») quand plusieurs thèmes sont choisis.
const MIXED_THEMES_ICON_THEME = 'Culture générale';

interface ThemesGame {
  themes: string[];
  questionCount: number;
  quizzes: QuizEntry[];
  summary: QuizSummary;
}

// Partie tirée dans des thèmes du Quiz, d'après le catalogue : null si les paramètres ne correspondent à rien
// de jouable (thème inconnu, nombre de questions impossible).
function themesGame(entries: QuizEntry[], themesParam: string | undefined, countParam: string | undefined): ThemesGame | null {
  const quizEntries = filterByGameType(entries, 'quiz');
  const allThemes = catalogThemes(quizEntries);
  const themes = (themesParam ?? '').split('|').filter((theme) => allThemes.includes(theme));
  const questionCount = Number(countParam);
  const quizzes = poolQuizzes(quizEntries, { kind: 'themes', themes }, 'quiz');
  const total = poolQuestionTotal(quizzes);
  if (themes.length === 0 || !availableQuestionCounts(QUIZ_QUESTION_COUNTS, total).includes(questionCount)) return null;
  const texts = strings.catalog.themesGame;
  const title = themes.length === allThemes.length ? texts.allThemes : themes.length <= 2 ? themes.join(' + ') : texts.themes(themes.length);
  const summary: QuizSummary = {
    title,
    theme: themes.length === 1 ? themes[0] : MIXED_THEMES_ICON_THEME,
    gameType: 'quiz',
    language: 'fr',
    difficulty: quizzes.reduce((sum, quiz) => sum + quiz.difficulty, 0) / quizzes.length,
    difficultyLabel: '',
    questionCount,
    estimatedMinutes: 0,
    description: texts.description(questionCount, total),
    audience: 'all',
    poster: quizzes[0].poster,
    addedAt: '',
  };
  return { themes, questionCount, quizzes, summary };
}

// Fiche d'une partie tirée dans un ou plusieurs thèmes (barre « Nombre de questions » du catalogue Quiz) :
// mêmes réglages et même « Choisir » qu'un quiz ; les questions sont tirées au salon (useGameQuestions).
export default function ThemesGameRoute() {
  const { themes, count, room } = useLocalSearchParams<{ themes?: string; count?: string; room?: string }>();
  const catalog = useLiveValue<unknown>('quizzes');
  const game = useMemo(() => (catalog.kind === 'ready' ? themesGame(parseQuizCatalog(catalog.value).valid, themes, count) : null), [catalog, themes, count]);
  if (catalog.kind === 'loading') {
    return (
      <Screen>
        <Text style={textStyles.body}>{strings.quizSetup.loading}</Text>
      </Screen>
    );
  }
  if (game === null) {
    return (
      <Screen>
        <Text style={textStyles.error}>{strings.catalog.themesGame.unavailable}</Text>
        <BigButton label={strings.quizSetup.backToCatalog} variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }
  return <ThemesGameScreen game={game} room={room && isValidRoomCode(room) ? room : undefined} />;
}

function ThemesGameScreen({ game, room }: { game: ThemesGame; room?: string }) {
  const [chosenSettings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const settings = withPool(settingsForGameType(chosenSettings, 'quiz'), { kind: 'themes', themes: game.themes }, game.questionCount);
  const [sound, setSound] = useSoundPreferences();
  const starter = useStartGame(room);

  function choose() {
    if (!areSettingsCompatible(settings)) return;
    // quizId : le premier quiz de l'ensemble (type du jeu pour la TV et les joueurs ; les questions viennent du tirage).
    void starter.start(game.quizzes[0].id, settings, sound);
  }

  return (
    <QuizDetails
      quiz={game.summary}
      settings={settings}
      onSettingsChange={setSettings}
      sound={sound}
      onSoundChange={setSound}
      onChoose={choose}
      isCreating={starter.isStarting}
      error={starter.error}
    />
  );
}
