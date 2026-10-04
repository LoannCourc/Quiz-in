import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { areSettingsCompatible, isValidQuizId } from '@shared/quizCatalog';
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
import { useLiveValue } from '@/hooks/useLiveValue';
import { createGame, NoFreeRoomCodeError } from '@/lib/createGame';
import { warnIgnoredEntries } from '@/lib/devLog';
import { toErrorMessage } from '@/lib/errors';
import { saveHostedGameCode } from '@/lib/hostedGameStorage';

// Fiche d'un quiz : « Choisir ce quiz » crée la partie (réglages par défaut, modifiables dans la feuille
// « Réglages ») et ouvre le salon.
export default function QuizRoute() {
  const { quizId = '' } = useLocalSearchParams<{ quizId: string }>();
  // Identifiant vérifié avant toute lecture dans la base.
  return isValidQuizId(quizId) ? <QuizScreen quizId={quizId} /> : <QuizNotFound />;
}

function QuizNotFound() {
  return (
    <Screen>
      <Text style={textStyles.error}>{strings.quizSetup.notFound}</Text>
      <BigButton label={strings.quizSetup.backToCatalog} variant="secondary" onPress={() => router.replace('/')} />
    </Screen>
  );
}

function QuizScreen({ quizId }: { quizId: string }) {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  // Fiche absente ou mal formée : null, traitée comme introuvable.
  const summary = useMemo(() => {
    if (quiz.kind !== 'ready') return null;
    const parsed = parseQuizSummary(quiz.value);
    warnIgnoredEntries('Fiche du quiz', parsed === null && quiz.value !== null ? 1 : 0);
    return parsed;
  }, [quiz]);
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const isBlindTestEnabled = useBlindTestEnabled();
  // Blind test avec l'interrupteur coupé : fiche visible (lien direct), mais pas de partie.
  const unavailableReason =
    summary?.gameType === 'blindTest' && !isBlindTestEnabled ? strings.quizSetup.blindTestUnavailable : undefined;

  async function create() {
    if (!areSettingsCompatible(settings) || unavailableReason) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const code = await createGame(quizId, settings);
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
      onChoose={create}
      isCreating={isCreating}
      error={createError}
      unavailableReason={unavailableReason}
    />
  );
}
