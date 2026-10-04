import { catalogRows, catalogThemes, filterByGameType, filterByTheme, searchByTitle } from '@shared/catalogRows';
import type { QuizEntry } from '@shared/quizValidation';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { GameTypeTabs, type PlayableGameType } from './GameTypeTabs';
import { LineIcon } from './LineIcon';
import { PosterRow } from './PosterRow';
import { QuizPoster } from './QuizPoster';
import { ThemeChips } from './ThemeChips';

const POSTERS_PER_SCREEN = 3;

interface CatalogViewProps {
  entries: QuizEntry[];
  onOpenQuiz: (quizId: string) => void;
  // Affiché sous l'en-tête (« Reprendre la partie »).
  banner?: ReactNode;
  // Interrupteur à distance : l'onglet Blind test et ses quiz n'apparaissent que s'il est ouvert.
  isBlindTestEnabled?: boolean;
}

// Largeur d'une affiche : trois par largeur de colonne, dans les bornes du thème.
function posterWidthFor(columnWidth: number): number {
  const fitted = Math.floor((columnWidth - (POSTERS_PER_SCREEN - 1) * Spacing.three) / POSTERS_PER_SCREEN);
  return Math.min(AppSizes.posterMaxWidth, Math.max(AppSizes.posterMinWidth, fitted));
}

// Catalogue de l'hôte (maquette S2), à partir de fiches déjà validées : base ou démo.
export function CatalogView({ entries: allEntries, onOpenQuiz, banner, isBlindTestEnabled = false }: CatalogViewProps) {
  const [gameType, setGameType] = useState<PlayableGameType>('quiz');
  const [theme, setTheme] = useState<string | null>(null);
  // null : recherche fermée.
  const [query, setQuery] = useState<string | null>(null);
  // Largeur réelle de la colonne, mesurée à l'affichage (0 tant qu'elle n'est pas connue).
  const [columnWidth, setColumnWidth] = useState(0);
  const posterWidth = posterWidthFor(columnWidth);
  // Interrupteur coupé en cours de route : retour aux quiz, les blind tests disparaissent.
  const visibleType = isBlindTestEnabled ? gameType : 'quiz';
  const entries = useMemo(() => filterByGameType(allEntries, visibleType), [allEntries, visibleType]);
  const themes = useMemo(() => catalogThemes(entries), [entries]);

  // Changer d'onglet repart de « Tout » : le thème choisi peut ne pas exister dans l'autre onglet.
  function selectGameType(type: PlayableGameType) {
    setGameType(type);
    setTheme(null);
  }
  const isSearching = query !== null && query.trim() !== '';

  return (
    <View style={styles.column} onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
      <View style={styles.header}>
        {query === null ? (
          <Text style={styles.brand}>{strings.join.appName}</Text>
        ) : (
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={strings.catalog.searchPlaceholder}
            placeholderTextColor={AppColors.textMuted}
            accessibilityLabel={strings.catalog.search}
            returnKeyType="search"
            style={styles.searchInput}
          />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={query === null ? strings.catalog.search : strings.catalog.closeSearch}
          hitSlop={Spacing.two}
          onPress={() => setQuery(query === null ? '' : null)}
          style={styles.iconButton}>
          <LineIcon name={query === null ? 'search' : 'close'} />
        </Pressable>
      </View>

      {banner}
      <GameTypeTabs selected={visibleType} onSelect={selectGameType} isBlindTestEnabled={isBlindTestEnabled} />
      {entries.length > 0 && <ThemeChips themes={themes} selected={theme} onSelect={setTheme} />}

      {entries.length === 0 ? (
        <Text style={textStyles.body}>{strings.catalog.emptyCatalog}</Text>
      ) : isSearching ? (
        <SearchResults
          quizzes={searchByTitle(filterByTheme(entries, theme), query)}
          posterWidth={posterWidth}
          onOpenQuiz={onOpenQuiz}
        />
      ) : (
        <Rows entries={entries} theme={theme} posterWidth={posterWidth} onOpenQuiz={onOpenQuiz} />
      )}
    </View>
  );
}

interface RowsProps {
  entries: QuizEntry[];
  theme: string | null;
  posterWidth: number;
  onOpenQuiz: (quizId: string) => void;
}

function Rows({ entries, theme, posterWidth, onOpenQuiz }: RowsProps) {
  const rows = catalogRows(entries, theme);
  if (rows.length === 0) return <Text style={textStyles.body}>{strings.catalog.noMatch}</Text>;
  return (
    <>
      {rows.map((row) => (
        <PosterRow
          key={row.id}
          title={strings.catalog.rows[row.id]}
          quizzes={row.quizzes}
          posterWidth={posterWidth}
          ranked={row.id === 'featured'}
          onOpenQuiz={onOpenQuiz}
        />
      ))}
    </>
  );
}

interface SearchResultsProps {
  quizzes: QuizEntry[];
  posterWidth: number;
  onOpenQuiz: (quizId: string) => void;
}

// Résultats en grille de trois colonnes.
function SearchResults({ quizzes, posterWidth, onOpenQuiz }: SearchResultsProps) {
  if (quizzes.length === 0) return <Text style={textStyles.body}>{strings.catalog.noSearchResult}</Text>;
  return (
    <View style={styles.grid}>
      {quizzes.map((quiz) => (
        <QuizPoster
          key={quiz.id}
          title={quiz.title}
          poster={quiz.poster}
          width={posterWidth}
          onPress={() => onOpenQuiz(quiz.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 48,
  },
  brand: {
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.card,
    color: AppColors.ink,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
