import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import {
  areSettingsCompatible,
  AVAILABLE_OPTIONS,
  canEnableOption,
  difficultyLevel,
  isValidQuizId,
  withAnswerMode,
  type GameOption,
} from '@shared/quizCatalog';
import { parseQuizSummary } from '@shared/quizValidation';
import type { AnswerMode, SessionSettings } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { OptionToggle } from '@/components/host/OptionToggle';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useLiveValue } from '@/hooks/useLiveValue';
import { createGame, NoFreeRoomCodeError } from '@/lib/createGame';
import { saveHostedGameCode } from '@/lib/hostedGameStorage';
import { warnIgnoredEntries } from '@/lib/devLog';
import { toErrorMessage } from '@/lib/errors';

const MODE_CHOICES: Choice<AnswerMode>[] = (['choice', 'free'] as const).map((mode) => ({
  value: mode,
  label: strings.quizSetup.answerModes[mode],
}));

const OPTIONS: readonly GameOption[] = ['speedBonus', 'control', 'teams'];

// Fiche d'un quiz et réglages de la partie.
export default function QuizSetupScreen() {
  const { quizId = '' } = useLocalSearchParams<{ quizId: string }>();

  return (
    <Screen>
      {/* Identifiant vérifié avant toute lecture dans la base. */}
      {isValidQuizId(quizId) ? <QuizSetup quizId={quizId} /> : <QuizNotFound />}
    </Screen>
  );
}

function QuizNotFound() {
  return (
    <>
      <Text style={textStyles.error}>{strings.quizSetup.notFound}</Text>
      <BigButton label={strings.quizSetup.backToCatalog} variant="secondary" onPress={() => router.replace('/')} />
    </>
  );
}

// Raison affichée à côté d'une option qu'on ne peut pas activer, sinon undefined.
function disabledReason(settings: SessionSettings, option: GameOption): string | undefined {
  if (!AVAILABLE_OPTIONS.includes(option)) return strings.quizSetup.comingSoon;
  if (!settings[option] && !canEnableOption(settings, option)) return strings.quizSetup.incompatible;
  return undefined;
}

function QuizSetup({ quizId }: { quizId: string }) {
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

  async function create() {
    if (!areSettingsCompatible(settings)) return;
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

  if (quiz.kind === 'loading') return <Text style={textStyles.body}>{strings.quizSetup.loading}</Text>;
  if (quiz.kind === 'error') {
    return <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${quiz.detail}`}</Text>;
  }
  if (summary === null) return <QuizNotFound />;

  const level = strings.catalog.difficultyLevels[difficultyLevel(summary.difficulty)];

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.theme}>{summary.theme}</Text>
        <Text style={textStyles.title}>{summary.title}</Text>
        <Text style={[textStyles.muted, styles.centered]}>
          {strings.catalog.difficulty(level, summary.difficulty)} ·{' '}
          {strings.catalog.details(summary.questionCount, summary.estimatedMinutes)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={textStyles.label}>{strings.quizSetup.answerModeLabel}</Text>
        <ChoiceChips
          choices={MODE_CHOICES}
          selected={settings.answerMode}
          onSelect={(mode) => setSettings(withAnswerMode(settings, mode))}
        />
        <Text style={textStyles.muted}>{strings.quizSetup.answerModeHints[settings.answerMode]}</Text>
      </View>

      <View style={styles.section}>
        <Text style={textStyles.label}>{strings.quizSetup.optionsLabel}</Text>
        {OPTIONS.map((option) => (
          <OptionToggle
            key={option}
            title={strings.quizSetup.options[option].title}
            hint={strings.quizSetup.options[option].hint}
            value={settings[option]}
            disabledReason={disabledReason(settings, option)}
            onChange={(value) => setSettings({ ...settings, [option]: value })}
          />
        ))}
      </View>

      {createError && <Text style={textStyles.error}>{createError}</Text>}
      <BigButton
        label={isCreating ? strings.quizSetup.creating : strings.quizSetup.createButton}
        onPress={create}
        disabled={isCreating}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  theme: {
    color: AppColors.accent,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
  },
});
