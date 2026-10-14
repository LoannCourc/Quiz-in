import {
  catalogRows,
  catalogThemes,
  filterByGameType,
  filterByThemes,
  NO_THEME,
  searchByTitle,
  selectedThemes,
  toggleTheme,
  type ThemeSelection,
} from '@shared/catalogRows';
import { availableQuestionCounts, poolQuestionTotal, poolQuizzes, QUIZ_QUESTION_COUNTS } from '@shared/questionPool';
import { quizLevel } from '@shared/quizCatalog';
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
import { QuestionCountBar } from './QuestionCountBar';
import { QuizPoster } from './QuizPoster';
import { ThemeChips } from './ThemeChips';
import { ActiveFilters, FiltersButton } from './filters/CatalogFilterBar';
import { QuizFiltersSheet } from './filters/QuizFiltersSheet';

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
  // Quiz : thèmes choisis et nombre de questions (barre du bas), vers la fiche de la partie tirée.
  onContinueThemes?: (themes: string[], questionCount: number) => void;
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
// Quiz : dès qu'un thème est choisi (« Tout » compris), la barre « Nombre de questions » apparaît en bas ;
// les affiches restent des quiz de 10 questions (fiche, sans barre).
export function CatalogView({ entries: allEntries, gameType, onOpenQuiz, onBack, played, onContinueThemes }: CatalogViewProps) {
  const [themeSelection, setThemeSelection] = useState<ThemeSelection>(NO_THEME);
  const [questionCount, setQuestionCount] = useState(QUIZ_QUESTION_COUNTS[0]);
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
  const chosenThemes = selectedThemes(themeSelection, themes);
  const shown = filterByThemes(entries, chosenThemes);
  const isSearching = query.trim() !== '';
  const filtered = isFiltering(filters) ? filterQuizzes(shown, filters, played) : shown;
  const footer =
    onContinueThemes && chosenThemes.length > 0 ? (
      <ThemesCountBar
        entries={entries}
        themes={chosenThemes}
        value={questionCount}
        onChange={setQuestionCount}
        onContinue={(count) => onContinueThemes(chosenThemes, count)}
      />
    ) : undefined;

  return (
    <Screen footer={footer}>
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

        {entries.length > 0 && (
          <ThemeChips themes={themes} selection={themeSelection} onToggle={(theme) => setThemeSelection((current) => toggleTheme(current, theme))} />
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
          <Rows entries={shown} posterWidth={posterWidth} onOpenQuiz={onOpenQuiz} played={played} />
        )}
      </View>
      {isFiltersOpen && (
        <QuizFiltersSheet
          filters={filters}
          countFor={(draft) => (isFiltering(draft) ? filterQuizzes(shown, draft, played) : shown).length}
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

interface ThemesCountBarProps {
  entries: QuizEntry[];
  themes: string[];
  value: number;
  onChange: (count: number) => void;
  onContinue: (count: number) => void;
}

// Quiz : nombre de questions tirées dans les thèmes choisis ; options au-delà de leurs questions grisées.
// Choix devenu impossible (thème retiré) : le plus grand possible.
function ThemesCountBar({ entries, themes, value, onChange, onContinue }: ThemesCountBarProps) {
  const total = poolQuestionTotal(poolQuizzes(entries, { kind: 'themes', themes }, 'quiz'));
  const available = availableQuestionCounts(QUIZ_QUESTION_COUNTS, total);
  const count = available.includes(value) ? value : (available.at(-1) ?? value);
  return (
    <QuestionCountBar
      options={QUIZ_QUESTION_COUNTS}
      available={available}
      value={count}
      onChange={onChange}
      summary={strings.catalog.questionCount.themesSummary(total)}
      note={available.length < QUIZ_QUESTION_COUNTS.length ? strings.catalog.questionCount.themesTooSmall(themes.length, total) : undefined}
      onContinue={() => onContinue(count)}
      isContinueDisabled={available.length === 0}
    />
  );
}

interface RowsProps {
  entries: QuizEntry[];
  posterWidth: number;
  onOpenQuiz: (quizId: string) => void;
  played: ReadonlySet<string>;
}

function Rows({ entries, posterWidth, onOpenQuiz, played }: RowsProps) {
  const rows = catalogRows(entries, null);
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
