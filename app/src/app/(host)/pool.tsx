import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { filterByGameType } from '@shared/catalogRows';
import { areSettingsCompatible, settingsForGameType } from '@shared/quizCatalog';
import { availableQuestionCounts, BLUFF_QUESTION_COUNTS, poolQuestionTotal, poolQuizzes, withPool, type QuestionPool } from '@shared/questionPool';
import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import { themeGameChoice } from '@shared/themeCatalog';
import type { QuizSummary, SessionSettings } from '@shared/types';
import { isValidRoomCode } from '@shared/roomCode';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { ThemeGameScreen } from '@/components/host/catalog/themes/ThemeGameScreen';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';
import { useSoundPreferences } from '@/hooks/useSoundPreferences';
import { useStartGame } from '@/hooks/useStartGame';
import { databaseQuestionSource } from '@/lib/themeGameDraw';

interface MixGame {
  pool: QuestionPool;
  questionCount: number;
  quizzes: QuizEntry[];
  summary: QuizSummary;
}

// Bluff, « Mon mélange » : quiz choisis (identifiants séparés par « , ») et nombre de questions possible ;
// null si rien de jouable.
function mixGame(entries: QuizEntry[], quizIdsParam: string, countParam: string | undefined): MixGame | null {
  const bluffIds = new Set(filterByGameType(entries, 'bluff').map((entry) => entry.id));
  const quizIds = quizIdsParam.split(',').filter((id) => bluffIds.has(id));
  if (quizIds.length === 0) return null;
  const pool: QuestionPool = { kind: 'mix', quizIds };
  const quizzes = poolQuizzes(entries, pool, 'bluff');
  const total = poolQuestionTotal(quizzes);
  const questionCount = Number(countParam);
  if (quizzes.length === 0 || !availableQuestionCounts(BLUFF_QUESTION_COUNTS, total).includes(questionCount)) return null;
  const summary: QuizSummary = {
    title: quizzes.length === 1 ? quizzes[0].title : strings.hostLobby.mixTitle(quizzes.length),
    theme: quizzes[0].theme,
    gameType: 'bluff',
    language: 'fr',
    difficulty: quizzes.reduce((sum, quiz) => sum + quiz.difficulty, 0) / quizzes.length,
    difficultyLabel: '',
    questionCount,
    estimatedMinutes: 0,
    description: strings.catalog.mixGame.description(questionCount, total),
    audience: 'all',
    poster: quizzes[0].poster,
    addedAt: '',
  };
  return { pool, questionCount, quizzes, summary };
}

// Fiche d'une partie tirée dans un ensemble : thèmes du Quiz (maquette QN1-F, ?themes=Histoire|Sport&count=20 :
// tirage sur la fiche) ou « Mon mélange » du Bluff (?quizIds=a,b&count=15 : tirage au salon).
export default function PoolGameRoute() {
  const { themes, quizIds, count, room } = useLocalSearchParams<{ themes?: string; quizIds?: string; count?: string; room?: string }>();
  const catalog = useLiveValue<unknown>('quizzes');
  const entries = useMemo(() => (catalog.kind === 'ready' ? parseQuizCatalog(catalog.value).valid : []), [catalog]);
  const roomCode = room && isValidRoomCode(room) ? room : undefined;
  if (catalog.kind === 'loading') {
    return (
      <Screen>
        <Text style={textStyles.body}>{strings.quizSetup.loading}</Text>
      </Screen>
    );
  }
  const choice = themes ? themeGameChoice(entries, themes.split('|'), Number(count)) : null;
  if (choice) return <ThemeGameRoute entries={entries} themes={choice.themes} count={choice.count} room={roomCode} />;
  const mix = quizIds ? mixGame(entries, quizIds, count) : null;
  if (mix) return <MixGameScreen game={mix} room={roomCode} />;
  return (
    <Screen>
      <Text style={textStyles.error}>{strings.catalog.themesGame.unavailable}</Text>
      <BigButton label={strings.quizSetup.backToCatalog} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

function ThemeGameRoute({ entries, themes, count, room }: { entries: QuizEntry[]; themes: string[]; count: number; room?: string }) {
  const starter = useStartGame(room);
  return (
    <ThemeGameScreen
      entries={entries}
      themes={themes}
      count={count}
      source={databaseQuestionSource}
      start={(quizId, settings, sound, questionRefs) => void starter.start(quizId, settings, sound, questionRefs)}
      isCreating={starter.isStarting}
      error={starter.error}
      errorReference={starter.errorReference}
    />
  );
}

// Bluff, Mon mélange : même fiche qu'un quiz (réglages du Bluff imposés), questions tirées au salon.
function MixGameScreen({ game, room }: { game: MixGame; room?: string }) {
  const [chosenSettings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  // Bluff : mode bluff imposé, sans Contrôle ni Rapidité (spec 16).
  const settings = withPool(settingsForGameType(chosenSettings, 'bluff'), game.pool, game.questionCount);
  const [sound, setSound] = useSoundPreferences();
  const starter = useStartGame(room);

  function choose() {
    if (!areSettingsCompatible(settings)) return;
    // quizId : le premier quiz du mélange (type du jeu pour la TV et les joueurs ; les questions viennent du tirage).
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
      errorReference={starter.errorReference}
    />
  );
}
