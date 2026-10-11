import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { changeGameUpdate } from '@shared/hostEngine';
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
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { useSoundPreferences } from '@/hooks/useSoundPreferences';
import { usePlayedQuizzes } from '@/hooks/usePlayedQuizzes';
import { createGame, NoFreeRoomCodeError } from '@/lib/createGame';
import { warnIgnoredEntries } from '@/lib/devLog';
import { toErrorMessage } from '@/lib/errors';
import { applyHostAction } from '@/lib/hostGame';
import { saveHostedGameCode } from '@/lib/hostedGameStorage';

// Fiche d'un quiz : « Choisir ce quiz » crée la partie (réglages par défaut, modifiables dans la feuille
// « Réglages ») et ouvre le salon.
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
  const serverOffsetMs = useServerTimeOffset();
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
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
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

  async function create() {
    if (!areSettingsCompatible(settings) || unavailableReason) return;
    setIsCreating(true);
    setCreateError(null);
    if (room) {
      await changeGame(room);
      return;
    }
    try {
      const code = await createGame(quizId, settings, sound);
      // Mémorisé sur l'appareil : « Reprendre la partie » si l'app est relancée en pleine partie.
      await saveHostedGameCode(code);
      // replace : le retour arrière depuis le lobby ramène au catalogue, pas à cette fiche.
      router.replace({ pathname: '/host/[code]', params: { code } });
    } catch (error) {
      setCreateError(
        error instanceof NoFreeRoomCodeError
          ? strings.quizSetup.noFreeCode
          : `${strings.quizSetup.createFailed} ${toErrorMessage(error)}`,
      );
      setIsCreating(false);
    }
  }

  // Changer de jeu : le jeu choisi remplace le précédent dans le salon gardé ouvert, puis retour à son écran.
  async function changeGame(code: string) {
    try {
      const applied = await applyHostAction(code, (session, now) => changeGameUpdate(session, quizId, settings, now), Date.now() + serverOffsetMs);
      if (applied) {
        router.dismissTo({ pathname: '/host/[code]', params: { code } });
        return;
      }
      setCreateError(strings.quizSetup.changeGameFailed);
    } catch (error) {
      setCreateError(`${strings.quizSetup.changeGameFailed} ${toErrorMessage(error)}`);
    }
    setIsCreating(false);
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
      onChoose={create}
      isCreating={isCreating}
      error={createError}
      unavailableReason={unavailableReason}
      isPlayed={played.has(quizId)}
    />
  );
}
