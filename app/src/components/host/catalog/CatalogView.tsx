import { catalogRows, catalogThemes, filterByGameType, searchByTitle, type CatalogRow } from '@shared/catalogRows';
import { QUIZ_QUESTION_COUNTS } from '@shared/questionPool';
import { quizLevel } from '@shared/quizCatalog';
import { featuredThemeOf, RECOMMENDED_QUESTION_COUNT, themeStats } from '@shared/themeCatalog';
import { activeFilterCount, filterQuizzes, isFiltering, NO_QUIZ_FILTERS, removeFilter, type QuizFilters } from '@shared/quizFilters';
import type { QuizEntry } from '@shared/quizValidation';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { LineIcon } from './LineIcon';
import { PosterRow } from './PosterRow';
import { QuizPoster } from './QuizPoster';
import { ActiveFilters, FiltersButton } from './filters/CatalogFilterBar';
import { QuizFiltersSheet } from './filters/QuizFiltersSheet';
import { ThemeHeroCard } from './themes/ThemeHeroCard';
import { ThemeRail } from './themes/ThemeRail';
import { ThemeSheet } from './themes/ThemeSheet';

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
  // Quiz (maquette QN1-A) : thème à la une et tuiles des thèmes. JOUER de la carte héro : fiche de la
  // partie tirée dans le thème ; une tuile : feuille du thème (nombre, mélange), puis la même fiche ;
  // « Tout voir » : grille des thèmes.
  themes?: {
    onPlay: (themes: string[], questionCount: number) => void;
    onSeeAll: () => void;
  };
}

// Largeur d'une affiche : trois par largeur de colonne, dans les bornes du thème.
function posterWidthFor(columnWidth: number): number {
  return Math.min(AppSizes.posterMaxWidth, Math.max(AppSizes.posterMinWidth, threeAcross(columnWidth)));
}

// Grille (recherche, tri) : toujours trois colonnes pleines, même sur un écran de 320 points.
function gridPosterWidthFor(columnWidth: number): number {
  return Math.min(AppSizes.posterMaxWidth, threeAcross(columnWidth));
}

// Tuiles du rail des thèmes : un peu plus de trois par largeur (la quatrième dépasse : la rangée défile),
// jamais assez étroites pour couper un nom de thème.
const THEME_TILE_MIN_WIDTH = 104;
const THEME_TILES_PER_SCREEN = 3.3;

function themeTileWidthFor(columnWidth: number): number {
  return Math.max(THEME_TILE_MIN_WIDTH, Math.floor((columnWidth - 2 * Spacing.two) / THEME_TILES_PER_SCREEN));
}

function threeAcross(columnWidth: number): number {
  return Math.floor((columnWidth - (POSTERS_PER_SCREEN - 1) * Spacing.three) / POSTERS_PER_SCREEN);
}

// Catalogue d'un jeu (maquette S2), ouvert depuis l'accueil, à partir de fiches déjà validées : base ou
// démo. En-tête : retour à l'accueil, nom du jeu, recherche et « Filtres » ; puis les rangées.
// Quiz (maquette QN1-A) : carte « Thème de la semaine », rail « Tous les thèmes », puis les rangées
// d'affiches (Nouveautés d'abord) ; une affiche reste un quiz fixe de 10 questions.
export function CatalogView({ entries: allEntries, gameType, onOpenQuiz, onBack, played, themes: themeActions }: CatalogViewProps) {
  // Tri et filtres (maquette QT1) : sans rien, les rangées ; sinon une grille dans l'ordre du tri.
  const [filters, setFilters] = useState<QuizFilters>(NO_QUIZ_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Largeur réelle de la colonne, mesurée à l'affichage (0 tant qu'elle n'est pas connue).
  const [columnWidth, setColumnWidth] = useState(0);
  const posterWidth = posterWidthFor(columnWidth);
  const gridPosterWidth = gridPosterWidthFor(columnWidth);
  const entries = useMemo(() => filterByGameType(allEntries, gameType), [allEntries, gameType]);
  const themes = useMemo(() => catalogThemes(entries), [entries]);
  const isSearching = query.trim() !== '';
  const filtered = isFiltering(filters) ? filterQuizzes(entries, filters, played) : entries;

  return (
    <Screen>
      <View style={styles.column} onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
        <View style={styles.header}>
          <BackButton onPress={onBack} label={strings.home.back} />
          <Text style={styles.brand} numberOfLines={1}>
            {strings.home.games[gameType].name}
          </Text>
        </View>
        {entries.length > 0 && (
          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <View style={styles.searchIcon} importantForAccessibility="no-hide-descendants">
                <LineIcon name="search" />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={strings.catalog.searchPlaceholder}
                placeholderTextColor={AppColors.textMuted}
                accessibilityLabel={strings.catalog.search}
                returnKeyType="search"
                style={styles.searchInput}
              />
              {isSearching && (
                <Pressable accessibilityRole="button" accessibilityLabel={strings.catalog.clearSearch} onPress={() => setQuery('')} style={styles.clearSearch}>
                  <LineIcon name="close" />
                </Pressable>
              )}
            </View>
            <FiltersButton count={activeFilterCount(filters)} onPress={() => setIsFiltersOpen(true)} />
          </View>
        )}
        {isFiltering(filters) && (
          <ActiveFilters
            filters={filters}
            shownCount={filtered.length}
            onRemove={(key) => setFilters((current) => removeFilter(current, key))}
            onClearAll={() => setFilters(NO_QUIZ_FILTERS)}
          />
        )}

        {entries.length === 0 ? (
          <Text style={textStyles.body}>{strings.catalog.emptyCatalog}</Text>
        ) : isSearching ? (
          <PosterGrid
            quizzes={searchByTitle(filtered, query)}
            emptyText={strings.catalog.noSearchResult}
            posterWidth={gridPosterWidth}
            onOpenQuiz={onOpenQuiz}
            played={played}
          />
        ) : isFiltering(filters) ? (
          <PosterGrid
            quizzes={filtered}
            emptyText={strings.catalog.filters.noMatch}
            posterWidth={gridPosterWidth}
            onOpenQuiz={onOpenQuiz}
            played={played}
          />
        ) : (
          <>
            {themeActions && (
              <ThemesBlock entries={entries} played={played} tileWidth={themeTileWidthFor(columnWidth)} actions={themeActions} />
            )}
            <Rows entries={entries} posterWidth={posterWidth} onOpenQuiz={onOpenQuiz} played={played} newFirst={themeActions !== undefined} />
          </>
        )}
      </View>
      {isFiltersOpen && (
        <QuizFiltersSheet
          filters={filters}
          themes={themes}
          countFor={(draft) => (isFiltering(draft) ? filterQuizzes(entries, draft, played) : entries).length}
          onApply={(draft) => {
            setFilters(draft);
            setIsFiltersOpen(false);
          }}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}
    </Screen>
  );
}

interface ThemesBlockProps {
  entries: QuizEntry[];
  played: ReadonlySet<string>;
  tileWidth: number;
  actions: NonNullable<CatalogViewProps['themes']>;
}

// Carte du thème à la une et rail des thèmes (maquette QN1-A). Nombre de questions de la carte : 20 par
// défaut ; s'il dépasse les questions du thème, le plus grand possible.
function ThemesBlock({ entries, played, tileWidth, actions }: ThemesBlockProps) {
  const [count, setCount] = useState(RECOMMENDED_QUESTION_COUNT);
  const [openTheme, setOpenTheme] = useState<string | null>(null);
  const stats = useMemo(() => themeStats(entries, played), [entries, played]);
  const featured = featuredThemeOf(entries, stats);
  if (!featured) return null;
  const possible = QUIZ_QUESTION_COUNTS.filter((option) => option <= featured.questionCount);
  const heroCount = possible.includes(count) ? count : (possible.at(-1) ?? count);
  return (
    <>
      <ThemeHeroCard theme={featured} count={heroCount} onCountChange={setCount} onPlay={() => actions.onPlay([featured.theme], heroCount)} />
      <ThemeRail themes={stats} tileWidth={tileWidth} onOpenTheme={setOpenTheme} onSeeAll={actions.onSeeAll} />
      <ThemeSheet
        theme={openTheme}
        themes={stats}
        onClose={() => setOpenTheme(null)}
        onContinue={(themes, questionCount) => {
          setOpenTheme(null);
          actions.onPlay(themes, questionCount);
        }}
      />
    </>
  );
}

interface RowsProps {
  entries: QuizEntry[];
  posterWidth: number;
  onOpenQuiz: (quizId: string) => void;
  played: ReadonlySet<string>;
  // Quiz (maquette QN1-A) : « Nouveautés » d'abord, sous le rail des thèmes.
  newFirst: boolean;
}

function byNewFirst(a: CatalogRow, b: CatalogRow): number {
  return (a.id === 'new' ? 0 : 1) - (b.id === 'new' ? 0 : 1);
}

function Rows({ entries, posterWidth, onOpenQuiz, played, newFirst }: RowsProps) {
  const all = catalogRows(entries, null);
  const rows = newFirst ? [...all].sort(byNewFirst) : all;
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
          level={quizLevel(quiz)}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchField: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.surface,
  },
  searchIcon: {
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    paddingHorizontal: Spacing.one,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  clearSearch: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
