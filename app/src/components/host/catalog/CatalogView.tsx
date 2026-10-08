import { catalogRows, catalogThemes, filterByGameType, filterByTheme, searchByTitle, sortCatalog, type CatalogSortId } from '@shared/catalogRows';
import type { QuizEntry } from '@shared/quizValidation';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';

import { LineIcon } from './LineIcon';
import { PosterRow } from './PosterRow';
import { QuizPoster } from './QuizPoster';
import { SortChips } from './SortChips';
import { ThemeChips } from './ThemeChips';

const POSTERS_PER_SCREEN = 3;

interface CatalogViewProps {
  entries: QuizEntry[];
  // Jeu choisi sur l'accueil : seules ses fiches sont montrées.
  gameType: GameType;
  onOpenQuiz: (quizId: string) => void;
  // Retour à l'accueil (choix du jeu).
  onBack: () => void;
  // Quiz déjà joués sur ce téléphone (lot E) : repère sur l'affiche, tri « Pas encore faits ».
  played: ReadonlySet<string>;
}

// Largeur d'une affiche : trois par largeur de colonne, dans les bornes du thème.
function posterWidthFor(columnWidth: number): number {
  return Math.min(AppSizes.posterMaxWidth, Math.max(AppSizes.posterMinWidth, threeAcross(columnWidth)));
}

// Grille (recherche, tri) : toujours trois colonnes pleines, même sur un écran de 320 points.
function gridPosterWidthFor(columnWidth: number): number {
  return Math.min(AppSizes.posterMaxWidth, threeAcross(columnWidth));
}

function threeAcross(columnWidth: number): number {
  return Math.floor((columnWidth - (POSTERS_PER_SCREEN - 1) * Spacing.three) / POSTERS_PER_SCREEN);
}

// Catalogue d'un jeu (maquette S2), ouvert depuis l'accueil, à partir de fiches déjà validées : base ou
// démo. En-tête : retour à l'accueil, nom du jeu, recherche ; puis le filtre des thèmes et les rangées.
export function CatalogView({ entries: allEntries, gameType, onOpenQuiz, onBack, played }: CatalogViewProps) {
  const [theme, setTheme] = useState<string | null>(null);
  // null : les rangées ; sinon une grille dans l'ordre du tri.
  const [sort, setSort] = useState<CatalogSortId | null>(null);
  // null : recherche fermée.
  const [query, setQuery] = useState<string | null>(null);
  // Largeur réelle de la colonne, mesurée à l'affichage (0 tant qu'elle n'est pas connue).
  const [columnWidth, setColumnWidth] = useState(0);
  const posterWidth = posterWidthFor(columnWidth);
  const gridPosterWidth = gridPosterWidthFor(columnWidth);
  const entries = useMemo(() => filterByGameType(allEntries, gameType), [allEntries, gameType]);
  const themes = useMemo(() => catalogThemes(entries), [entries]);
  const isSearching = query !== null && query.trim() !== '';

  return (
    <View style={styles.column} onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.home.back} hitSlop={Spacing.two} onPress={onBack} style={styles.iconButton}>
          <View style={styles.backIcon}>
            <SettingsIcon name="chevron" color={AppColors.text} />
          </View>
        </Pressable>
        {query === null ? (
          <Text style={styles.brand} numberOfLines={1}>
            {strings.home.games[gameType].name}
          </Text>
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

      {entries.length > 0 && <ThemeChips themes={themes} selected={theme} onSelect={setTheme} />}
      {entries.length > 0 && !isSearching && <SortChips selected={sort} onSelect={setSort} />}

      {entries.length === 0 ? (
        <Text style={textStyles.body}>{strings.catalog.emptyCatalog}</Text>
      ) : isSearching ? (
        <PosterGrid
          quizzes={searchByTitle(filterByTheme(entries, theme), query)}
          emptyText={strings.catalog.noSearchResult}
          posterWidth={gridPosterWidth}
          onOpenQuiz={onOpenQuiz}
          played={played}
        />
      ) : sort !== null ? (
        <PosterGrid
          quizzes={sortCatalog(filterByTheme(entries, theme), sort, played)}
          emptyText={sort === 'notPlayed' ? strings.catalog.allPlayed : strings.catalog.noMatch}
          posterWidth={gridPosterWidth}
          onOpenQuiz={onOpenQuiz}
          played={played}
        />
      ) : (
        <Rows entries={entries} theme={theme} posterWidth={posterWidth} onOpenQuiz={onOpenQuiz} played={played} />
      )}
    </View>
  );
}

interface RowsProps {
  entries: QuizEntry[];
  theme: string | null;
  posterWidth: number;
  onOpenQuiz: (quizId: string) => void;
  played: ReadonlySet<string>;
}

function Rows({ entries, theme, posterWidth, onOpenQuiz, played }: RowsProps) {
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
          played={played}
        />
      ))}
    </>
  );
}

interface PosterGridProps {
  quizzes: QuizEntry[];
  emptyText: string;
  posterWidth: number;
  onOpenQuiz: (quizId: string) => void;
  played: ReadonlySet<string>;
}

// Résultats d'une recherche ou d'un tri, en grille de trois colonnes.
function PosterGrid({ quizzes, emptyText, posterWidth, onOpenQuiz, played }: PosterGridProps) {
  if (quizzes.length === 0) return <Text style={textStyles.body}>{emptyText}</Text>;
  return (
    <View style={styles.grid}>
      {quizzes.map((quiz) => (
        <QuizPoster
          key={quiz.id}
          title={quiz.title}
          poster={quiz.poster}
          theme={quiz.theme}
          icon={quiz.icon}
          width={posterWidth}
          accessibilityLabel={played.has(quiz.id) ? strings.catalog.playedLabel(quiz.title) : quiz.title}
          onPress={() => onOpenQuiz(quiz.id)}
          isPlayed={played.has(quiz.id)}
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
  // Le chevron du réglage pointe vers la droite : retourné pour « retour ».
  backIcon: {
    transform: [{ rotate: '180deg' }],
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
