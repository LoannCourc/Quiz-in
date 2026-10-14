import {
  availableGenres,
  availableLevels,
  filterBlindTests,
  type BlindTestFacet,
} from '@shared/blindTestCatalog';
import { CATALOG_SORTS, sortCatalog, type CatalogSortId } from '@shared/catalogRows';
import type { QuizEntry } from '@shared/quizValidation';
import type { BlindTestGenre, DifficultyLevel } from '@shared/types';
import { useEffect, useState } from 'react';
import { BackHandler, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ChoiceRow } from '@/components/ui/ChoiceRow';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { BlindTestRow, facetTitle, FilterChip, ROW_HEIGHT } from './BlindTestParts';

const texts = strings.catalog.blindTest;

type OpenSheet = 'genre' | 'level' | 'sort' | null;

interface BlindTestListProps {
  entries: QuizEntry[];
  facet: BlindTestFacet;
  played: ReadonlySet<string>;
  onOpenQuiz: (quizId: string) => void;
  onBack: () => void;
}

function toggled<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

// Liste d'une tuile (maquette BT5), déjà filtrée : titre de la tuile, filtres en plus en pastilles (actifs en
// or avec ✕, à ouvrir avec « ▾ »), tri, « 7 sur 22 blind tests », puis la liste, rendue au fil du défilement
// (FlatList, lignes de hauteur fixe) pour rester fluide avec plus de 100 blind tests.
export function BlindTestList({ entries, facet, played, onOpenQuiz, onBack }: BlindTestListProps) {
  const [genres, setGenres] = useState<BlindTestGenre[]>([]);
  const [levels, setLevels] = useState<DifficultyLevel[]>([]);
  const [sort, setSort] = useState<CatalogSortId | null>(null);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const inFacet = filterBlindTests(entries, { facet, genres: [], levels: [] });
  const filtered = filterBlindTests(entries, { facet, genres, levels });
  const shown = sort ? sortCatalog(filtered, sort, played) : filtered;
  const genreChoices = facet.tab === 'genre' ? [] : availableGenres(entries, facet);
  const levelChoices = facet.tab === 'level' ? [] : availableLevels(entries, facet);

  // Bouton retour d'Android : retour aux tuiles, pas à l'accueil.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  const genresLabel = genres.map((genre) => texts.genres[genre]).join(' + ');
  const levelsLabel = levels.map((level) => strings.catalog.difficultyLevels[level]).join(' + ');

  return (
    <Screen scrollable={false}>
      <View style={styles.column}>
        <View style={styles.header}>
          <BackButton onPress={onBack} />
          <Text style={styles.title} numberOfLines={1}>
            {facetTitle(facet)}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
          {levels.length > 0 && (
            <FilterChip label={`${levelsLabel} ✕`} isActive onPress={() => setLevels([])} accessibilityLabel={texts.removeFilter(levelsLabel)} />
          )}
          {genres.length > 0 && (
            <FilterChip label={`${genresLabel} ✕`} isActive onPress={() => setGenres([])} accessibilityLabel={texts.removeFilter(genresLabel)} />
          )}
          {genreChoices.length > 1 && <FilterChip label={`${texts.genreFilter} ▾`} isActive={false} onPress={() => setSheet('genre')} />}
          {levelChoices.length > 1 && <FilterChip label={`${texts.levelFilter} ▾`} isActive={false} onPress={() => setSheet('level')} />}
          <FilterChip label={sort ? strings.catalog.sorts[sort] : texts.sort} isActive={sort !== null} onPress={() => setSheet('sort')} />
        </ScrollView>
        <Text style={styles.count}>{texts.ofTotal(shown.length, inFacet.length)}</Text>
        <FlatList
          data={shown}
          keyExtractor={(quiz) => quiz.id}
          renderItem={({ item }) => <BlindTestRow quiz={item} onPress={() => onOpenQuiz(item.id)} />}
          getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
          initialNumToRender={10}
          ListEmptyComponent={<Text style={textStyles.body}>{texts.noResult}</Text>}
          style={styles.fill}
        />
      </View>

      <BottomSheet isOpen={sheet === 'genre'} onClose={() => setSheet(null)} title={texts.genreFilter}>
        {genreChoices.map((genre) => (
          <ChoiceRow key={genre} label={texts.genres[genre]} isSelected={genres.includes(genre)} onPress={() => setGenres((current) => toggled(current, genre))} />
        ))}
      </BottomSheet>
      <BottomSheet isOpen={sheet === 'level'} onClose={() => setSheet(null)} title={texts.levelFilter}>
        {levelChoices.map((level) => (
          <ChoiceRow
            key={level}
            label={strings.catalog.difficultyLevels[level]}
            isSelected={levels.includes(level)}
            onPress={() => setLevels((current) => toggled(current, level))}
          />
        ))}
      </BottomSheet>
      <BottomSheet isOpen={sheet === 'sort'} onClose={() => setSheet(null)} title={texts.sort}>
        {CATALOG_SORTS.map((choice) => (
          <ChoiceRow key={choice} label={strings.catalog.sorts[choice]} isSelected={sort === choice} onPress={() => setSort((current) => (current === choice ? null : choice))} />
        ))}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    gap: Spacing.three,
  },
  fill: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: {
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  // flexGrow 0 : sur le web, une ScrollView horizontale s'étire sinon en hauteur.
  chipsScroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  chips: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  count: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
});
