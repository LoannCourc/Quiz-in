import { difficultyLevel } from '@shared/quizCatalog';
import type { DifficultyLevel, QuizSummary } from '@shared/types';
import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { QuizCard } from '@/components/host/QuizCard';
import { PlayerScreen } from '@/components/player/PlayerScreen';
import { playerTextStyles } from '@/components/player/playerTextStyles';
import { PlayerColors } from '@/constants/playerTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useLiveValue } from '@/hooks/useLiveValue';
import { isPublishedWeb } from '@/lib/platform';

type CatalogEntry = QuizSummary & { id: string };

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

function toEntries(quizzes: Record<string, QuizSummary> | null): CatalogEntry[] {
  return Object.entries(quizzes ?? {})
    .map(([id, quiz]) => ({ id, ...quiz }))
    .sort((a, b) => a.title.localeCompare(b.title, 'fr'));
}

function themeChoices(entries: CatalogEntry[]): Choice<string | null>[] {
  const themes = [...new Set(entries.map((entry) => entry.theme))].sort((a, b) => a.localeCompare(b, 'fr'));
  return [{ value: null, label: strings.catalog.all }, ...themes.map((theme) => ({ value: theme, label: theme }))];
}

function CatalogScreen() {
  const catalog = useLiveValue<Record<string, QuizSummary>>('quizzes');
  const [theme, setTheme] = useState<string | null>(null);
  const [level, setLevel] = useState<DifficultyLevel | null>(null);

  return (
    <PlayerScreen>
      <Text style={playerTextStyles.title}>{strings.join.appName}</Text>
      <Text style={[playerTextStyles.label, styles.centered]}>{strings.catalog.title}</Text>

      {catalog.kind === 'loading' && <Text style={playerTextStyles.body}>{strings.catalog.loading}</Text>}
      {catalog.kind === 'error' && (
        <Text style={playerTextStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>
      )}
      {catalog.kind === 'ready' && (
        <CatalogList entries={toEntries(catalog.value)} theme={theme} level={level} onTheme={setTheme} onLevel={setLevel} />
      )}

      <Link href="/debug/counter" style={styles.debugLink}>
        {strings.catalog.debugLink}
      </Link>
    </PlayerScreen>
  );
}

interface CatalogListProps {
  entries: CatalogEntry[];
  theme: string | null;
  level: DifficultyLevel | null;
  onTheme: (theme: string | null) => void;
  onLevel: (level: DifficultyLevel | null) => void;
}

function CatalogList({ entries, theme, level, onTheme, onLevel }: CatalogListProps) {
  if (entries.length === 0) return <Text style={playerTextStyles.body}>{strings.catalog.emptyCatalog}</Text>;

  const visible = entries.filter(
    (entry) => (theme === null || entry.theme === theme) && (level === null || difficultyLevel(entry.difficulty) === level),
  );

  return (
    <>
      <View style={styles.filter}>
        <Text style={playerTextStyles.muted}>{strings.catalog.themeFilter}</Text>
        <ChoiceChips choices={themeChoices(entries)} selected={theme} onSelect={onTheme} />
      </View>
      <View style={styles.filter}>
        <Text style={playerTextStyles.muted}>{strings.catalog.difficultyFilter}</Text>
        <ChoiceChips choices={LEVEL_CHOICES} selected={level} onSelect={onLevel} />
      </View>

      {visible.length === 0 && <Text style={playerTextStyles.body}>{strings.catalog.noMatch}</Text>}
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
  debugLink: {
    marginTop: 'auto',
    paddingVertical: Spacing.three,
    color: PlayerColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
