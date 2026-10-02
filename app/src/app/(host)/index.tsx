import { difficultyLevel } from '@shared/quizCatalog';
import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import type { DifficultyLevel } from '@shared/types';
import { Link, Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { QuizCard } from '@/components/host/QuizCard';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useLiveValue } from '@/hooks/useLiveValue';
import { warnIgnoredEntries } from '@/lib/devLog';
import { isPublishedWeb } from '@/lib/platform';

// Accueil de l'hôte. Sur le site des joueurs (web publié), redirige vers la saisie du code.
export default function HomeRoute() {
  return isPublishedWeb ? <Redirect href="/join" /> : <CatalogScreen />;
}

const LEVEL_CHOICES: Choice<DifficultyLevel | null>[] = [
  { value: null, label: strings.catalog.all },
  ...(['easy', 'medium', 'hard'] as const).map((level) => ({
    value: level,
    label: strings.catalog.difficultyLevels[level],
  })),
];

// Fiches valides triées par titre ; les entrées mal formées de la base sont ignorées.
function toEntries(quizzes: unknown): QuizEntry[] {
  const { valid, ignoredCount } = parseQuizCatalog(quizzes);
  warnIgnoredEntries('Catalogue', ignoredCount);
  return valid.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
}

function themeChoices(entries: QuizEntry[]): Choice<string | null>[] {
  const themes = [...new Set(entries.map((entry) => entry.theme))].sort((a, b) => a.localeCompare(b, 'fr'));
  return [{ value: null, label: strings.catalog.all }, ...themes.map((theme) => ({ value: theme, label: theme }))];
}

function CatalogScreen() {
  const catalog = useLiveValue<unknown>('quizzes');
  // Recalculé seulement quand la base change, pas à chaque changement de filtre.
  const entries = useMemo(() => (catalog.kind === 'ready' ? toEntries(catalog.value) : []), [catalog]);
  const [theme, setTheme] = useState<string | null>(null);
  const [level, setLevel] = useState<DifficultyLevel | null>(null);

  return (
    <Screen>
      <Text style={textStyles.title}>{strings.join.appName}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.catalog.title}</Text>

      {catalog.kind === 'loading' && <Text style={textStyles.body}>{strings.catalog.loading}</Text>}
      {catalog.kind === 'error' && (
        <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>
      )}
      {catalog.kind === 'ready' && (
        <CatalogList entries={entries} theme={theme} level={level} onTheme={setTheme} onLevel={setLevel} />
      )}

      <View style={styles.debugLinks}>
        <Link href="/debug/player" style={styles.debugLink}>
          {strings.catalog.playerDemoLink}
        </Link>
        <Link href="/debug/counter" style={styles.debugLink}>
          {strings.catalog.debugLink}
        </Link>
      </View>
    </Screen>
  );
}

interface CatalogListProps {
  entries: QuizEntry[];
  theme: string | null;
  level: DifficultyLevel | null;
  onTheme: (theme: string | null) => void;
  onLevel: (level: DifficultyLevel | null) => void;
}

function CatalogList({ entries, theme, level, onTheme, onLevel }: CatalogListProps) {
  if (entries.length === 0) return <Text style={textStyles.body}>{strings.catalog.emptyCatalog}</Text>;

  const visible = entries.filter(
    (entry) => (theme === null || entry.theme === theme) && (level === null || difficultyLevel(entry.difficulty) === level),
  );

  return (
    <>
      <View style={styles.filter}>
        <Text style={textStyles.muted}>{strings.catalog.themeFilter}</Text>
        <ChoiceChips choices={themeChoices(entries)} selected={theme} onSelect={onTheme} />
      </View>
      <View style={styles.filter}>
        <Text style={textStyles.muted}>{strings.catalog.difficultyFilter}</Text>
        <ChoiceChips choices={LEVEL_CHOICES} selected={level} onSelect={onLevel} />
      </View>

      {visible.length === 0 && <Text style={textStyles.body}>{strings.catalog.noMatch}</Text>}
      {visible.map((entry) => (
        <QuizCard
          key={entry.id}
          quiz={entry}
          onPress={() => router.push({ pathname: '/quiz/[quizId]', params: { quizId: entry.id } })}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  filter: {
    gap: Spacing.two,
  },
  debugLinks: {
    marginTop: 'auto',
  },
  debugLink: {
    paddingVertical: Spacing.three,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
