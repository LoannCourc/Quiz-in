import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { isValidRoomCode } from '@shared/roomCode';
import { areSettingsCompatible, isValidQuizId, settingsForGameType } from '@shared/quizCatalog';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { drawCategoriesOf, drawCategoryId } from '@shared/drawWords';
import { parseQuizSummary } from '@shared/quizValidation';
import type { SessionSettings } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useDrawEnabled } from '@/hooks/useDrawEnabled';
import { useLiveValue } from '@/hooks/useLiveValue';
import { useSoundPreferences } from '@/hooks/useSoundPreferences';
import { useStartGame } from '@/hooks/useStartGame';
import { usePlayedQuizzes } from '@/hooks/usePlayedQuizzes';
import { warnIgnoredEntries } from '@/lib/devLog';

// Fiche d'un quiz : « Choisir ce quiz » crée la partie (réglages par défaut, modifiables dans la feuille
// « Réglages ») et ouvre le salon ; en mode salon (Changer de jeu), remplace le jeu de la partie (useStartGame).
// Dessine-moi : « animal,sport » (catalogue) → identifiants connus seulement ; absent : « Mélange ».
function categoriesParam(value: string | undefined): string[] {
  return drawCategoriesOf(value ? value.split(',') : []).map(drawCategoryId);
}

export default function QuizRoute() {
  const { quizId = '', categories, room } = useLocalSearchParams<{ quizId: string; categories?: string; room?: string }>();
  // Identifiant vérifié avant toute lecture dans la base.
  return isValidQuizId(quizId) ? (
    <QuizScreen quizId={quizId} drawCategories={categoriesParam(categories)} room={room && isValidRoomCode(room) ? room : undefined} />
  ) : (
    <QuizNotFound />
  );
}

function QuizNotFound() {
  return (
    <Screen>
      <Text style={textStyles.error}>{strings.quizSetup.notFound}</Text>
      <BigButton label={strings.quizSetup.backToCatalog} variant="secondary" onPress={() => router.replace('/')} />
    </Screen>
  );
}

// room : Changer de jeu, le quiz remplace celui de cette partie au lieu de créer un salon.
function QuizScreen({ quizId, drawCategories, room }: { quizId: string; drawCategories: string[]; room?: string }) {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  // Fiche absente ou mal formée : null, traitée comme introuvable.
  const summary = useMemo(() => {
    // Dessine-moi : fiche locale (pas de quiz dans la base).
    if (quizId === DRAW_QUIZ_ID) return DRAW_QUIZ_SUMMARY;
    if (quiz.kind !== 'ready') return null;
    const parsed = parseQuizSummary(quiz.value);
    warnIgnoredEntries('Fiche du quiz', parsed === null && quiz.value !== null ? 1 : 0);
    return parsed;
  }, [quiz, quizId]);
  // Dessine-moi : catégories choisies dans le catalogue, écrites avec les réglages de la partie.
  const [chosenSettings, setSettings] = useState<SessionSettings>(() =>
    quizId === DRAW_QUIZ_ID && drawCategories.length > 0 ? { ...DEFAULT_SESSION_SETTINGS, drawCategories } : DEFAULT_SESSION_SETTINGS,
  );
  // Bluff : mode bluff imposé, sans Contrôle ni Rapidité (spec 16).
  const settings = summary ? settingsForGameType(chosenSettings, summary.gameType) : chosenSettings;
  const starter = useStartGame(room);
  const isBlindTestEnabled = useBlindTestEnabled();
  const played = usePlayedQuizzes();
  const isDrawEnabled = useDrawEnabled();
  const [sound, setSound] = useSoundPreferences();
  // Jeu coupé à distance (blind test, Dessine-moi) : fiche visible (lien direct), mais pas de partie.
  const unavailableReason =
    summary?.gameType === 'blindTest' && isBlindTestEnabled !== true
      ? strings.quizSetup.blindTestUnavailable
      : summary?.gameType === 'draw' && isDrawEnabled === false
        ? strings.quizSetup.drawUnavailable
        : undefined;

  function choose() {
    if (!areSettingsCompatible(settings) || unavailableReason) return;
    void starter.start(quizId, settings, sound);
  }

  if (quiz.kind === 'loading') {
    return (
      <Screen>
        <Text style={textStyles.body}>{strings.quizSetup.loading}</Text>
      </Screen>
    );
  }
  if (quiz.kind === 'error') {
    return (
      <Screen>
        <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${quiz.detail}`}</Text>
      </Screen>
    );
  }
  if (summary === null) return <QuizNotFound />;

  return (
    <QuizDetails
      quiz={summary}
      settings={settings}
      onSettingsChange={setSettings}
      sound={sound}
      onSoundChange={setSound}
      onChoose={choose}
      isCreating={starter.isStarting}
      error={starter.error}
      errorReference={starter.errorReference}
      unavailableReason={unavailableReason}
      isPlayed={played.has(quizId)}
    />
  );
}
