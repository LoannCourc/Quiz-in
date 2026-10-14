import { blindTestTiles, type BlindTestFacet, type BlindTestTab } from '@shared/blindTestCatalog';
import { filterByGameType, searchByTitle } from '@shared/catalogRows';
import type { QuizEntry } from '@shared/quizValidation';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LineIcon } from '@/components/host/catalog/LineIcon';
import { BackButton } from '@/components/ui/BackButton';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { BlindTestList } from './BlindTestList';
import { BlindTestRow, BlindTestTile, ROW_HEIGHT } from './BlindTestParts';

const texts = strings.catalog.blindTest;
const TABS: readonly BlindTestTab[] = ['genre', 'decade', 'level'];
const COLUMNS = 2;

interface BlindTestCatalogProps {
  entries: QuizEntry[];
  played: ReadonlySet<string>;
  onOpenQuiz: (quizId: string) => void;
  onBack: () => void;
}

// Catalogue du Blind test (maquette BT5) : onglets Genre / Années / Difficulté, recherche au-dessus des
// tuiles ; un appui sur une tuile ouvre la liste déjà filtrée (BlindTestList). Rien n'est lu en plus dans la
// base : tuiles, compteurs et filtres sont calculés sur les fiches (shared/blindTestCatalog.ts).
export function BlindTestCatalog({ entries: allEntries, played, onOpenQuiz, onBack }: BlindTestCatalogProps) {
  const entries = useMemo(() => filterByGameType(allEntries, 'blindTest'), [allEntries]);
  const [tab, setTab] = useState<BlindTestTab>('decade');
  const [query, setQuery] = useState('');
  const [openFacet, setOpenFacet] = useState<BlindTestFacet | null>(null);
  const [columnWidth, setColumnWidth] = useState(0);
  const tiles = useMemo(() => blindTestTiles(entries, tab, played), [entries, tab, played]);
  const results = useMemo(() => (query.trim() === '' ? null : searchByTitle(entries, query)), [entries, query]);
  const tileWidth = Math.floor((columnWidth - Spacing.three * (COLUMNS - 1)) / COLUMNS);

  if (openFacet) {
    return <BlindTestList entries={entries} facet={openFacet} played={played} onOpenQuiz={onOpenQuiz} onBack={() => setOpenFacet(null)} />;
  }

  return (
    <Screen scrollable={false}>
      <View style={styles.column} onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
        <View style={styles.header}>
          <BackButton onPress={onBack} label={strings.home.back} />
          <Text style={styles.brand} numberOfLines={1}>
            {texts.title}
          </Text>
        </View>
        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: value === tab }}
              onPress={() => setTab(value)}
              style={[styles.tab, value === tab && styles.tabSelected]}>
              <ButtonLabel style={[styles.tabLabel, value === tab && styles.tabLabelSelected]}>{texts.tabs[value]}</ButtonLabel>
            </Pressable>
          ))}
        </View>
        <View style={styles.search}>
          <LineIcon name="search" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={texts.searchPlaceholder}
            placeholderTextColor={AppColors.textMuted}
            accessibilityLabel={texts.searchPlaceholder}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
        {results ? (
          <FlatList
            data={results}
            keyExtractor={(quiz) => quiz.id}
            renderItem={({ item }) => <BlindTestRow quiz={item} onPress={() => onOpenQuiz(item.id)} />}
            getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
            ListEmptyComponent={<Text style={textStyles.body}>{strings.catalog.noSearchResult}</Text>}
            keyboardShouldPersistTaps="handled"
            style={styles.fill}
          />
        ) : (
          <FlatList
            data={tiles}
            numColumns={COLUMNS}
            key={tab}
            keyExtractor={(tile) => String(tile.facet.value)}
            columnWrapperStyle={styles.tileRow}
            contentContainerStyle={styles.tiles}
            renderItem={({ item, index }) => (
              <BlindTestTile
                {...item}
                accent={AppColors.blindTestTiles[index % AppColors.blindTestTiles.length]}
                width={tileWidth}
                onPress={() => setOpenFacet(item.facet)}
              />
            )}
            style={styles.fill}
          />
        )}
      </View>
    </Screen>
  );
}

const TAB_HEIGHT = 44;

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
  brand: {
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  tabs: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
  },
  tab: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppSizes.radiusPill,
  },
  tabSelected: {
    backgroundColor: AppColors.accent,
  },
  tabLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  tabLabelSelected: {
    color: AppColors.onAccent,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  tiles: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  tileRow: {
    gap: Spacing.three,
  },
});
