import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { catalogThemes, filterByGameType } from '@shared/catalogRows';
import { areSettingsCompatible, settingsForGameType } from '@shared/quizCatalog';
import {
  availableQuestionCounts,
  BLUFF_QUESTION_COUNTS,
  poolQuestionTotal,
  poolQuizzes,
  QUIZ_QUESTION_COUNTS,
  withPool,
  type QuestionPool,
} from '@shared/questionPool';
import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import type { QuizGameType, QuizSummary, SessionSettings } from '@shared/types';
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

// Thème générique (icône « ? ») quand l'ensemble mêle plusieurs thèmes.
const MIXED_THEMES_ICON_THEME = 'Culture générale';

interface PoolGame {
  pool: QuestionPool;
  gameType: QuizGameType;
  questionCount: number;
  quizzes: QuizEntry[];
  summary: QuizSummary;
}

interface PoolParams {
  // Quiz : thèmes séparés par « | ». Bluff (Mon mélange) : identifiants séparés par « , ».
  themes?: string;
  quizIds?: string;
  count?: string;
}

// Ensemble demandé, d'après le catalogue : thèmes du Quiz, ou quiz de Bluff du mélange. null si rien de
// jouable (thème ou quiz inconnu, nombre de questions impossible).
function poolOfParams(entries: QuizEntry[], params: PoolParams): { pool: QuestionPool; gameType: QuizGameType; titleOf: (quizzes: QuizEntry[]) => string } | null {
  if (params.quizIds) {
    const bluffIds = new Set(filterByGameType(entries, 'bluff').map((entry) => entry.id));
    const quizIds = params.quizIds.split(',').filter((id) => bluffIds.has(id));
    if (quizIds.length === 0) return null;
    return {
      pool: { kind: 'mix', quizIds },
      gameType: 'bluff',
      titleOf: (quizzes) => (quizzes.length === 1 ? quizzes[0].title : strings.hostLobby.mixTitle(quizzes.length)),
    };
  }
  const allThemes = catalogThemes(filterByGameType(entries, 'quiz'));
  const themes = (params.themes ?? '').split('|').filter((theme) => allThemes.includes(theme));
  if (themes.length === 0) return null;
  const texts = strings.catalog.themesGame;
  return {
    pool: { kind: 'themes', themes },
    gameType: 'quiz',
    titleOf: () => (themes.length === allThemes.length ? texts.allThemes : themes.length <= 2 ? themes.join(' + ') : texts.themes(themes.length)),
  };
}

function poolGame(entries: QuizEntry[], params: PoolParams): PoolGame | null {
  const found = poolOfParams(entries, params);
  if (!found) return null;
  const { pool, gameType, titleOf } = found;
  const quizzes = poolQuizzes(entries, pool, gameType);
  const total = poolQuestionTotal(quizzes);
  const questionCount = Number(params.count);
  const options = gameType === 'bluff' ? BLUFF_QUESTION_COUNTS : QUIZ_QUESTION_COUNTS;
  if (quizzes.length === 0 || !availableQuestionCounts(options, total).includes(questionCount)) return null;
  const themes = new Set(quizzes.map((quiz) => quiz.theme));
  const summary: QuizSummary = {
    title: titleOf(quizzes),
    theme: themes.size === 1 ? quizzes[0].theme : MIXED_THEMES_ICON_THEME,
    gameType,
    language: 'fr',
    difficulty: quizzes.reduce((sum, quiz) => sum + quiz.difficulty, 0) / quizzes.length,
    difficultyLabel: '',
    questionCount,
    estimatedMinutes: 0,
    description: (gameType === 'bluff' ? strings.catalog.mixGame.description : strings.catalog.themesGame.description)(questionCount, total),
    audience: 'all',
    poster: quizzes[0].poster,
    addedAt: '',
  };
  return { pool, gameType, questionCount, quizzes, summary };
}

// Fiche d'une partie tirée dans un ensemble : thèmes du Quiz (barre « Nombre de questions ») ou « Mon
// mélange » du Bluff. Mêmes réglages et même « Choisir » qu'un quiz ; les questions sont tirées au salon
// (useGameQuestions).
export default function PoolGameRoute() {
  const { themes, quizIds, count, room } = useLocalSearchParams<{ themes?: string; quizIds?: string; count?: string; room?: string }>();
  const catalog = useLiveValue<unknown>('quizzes');
  const game = useMemo(
    () => (catalog.kind === 'ready' ? poolGame(parseQuizCatalog(catalog.value).valid, { themes, quizIds, count }) : null),
    [catalog, themes, quizIds, count],
  );
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
  return <PoolGameScreen game={game} room={room && isValidRoomCode(room) ? room : undefined} />;
}

function PoolGameScreen({ game, room }: { game: PoolGame; room?: string }) {
  const [chosenSettings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  // Bluff : mode bluff imposé, sans Contrôle ni Rapidité (spec 16).
  const settings = withPool(settingsForGameType(chosenSettings, game.gameType), game.pool, game.questionCount);
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
