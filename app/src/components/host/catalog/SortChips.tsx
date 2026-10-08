import { CATALOG_SORTS, type CatalogSortId } from '@shared/catalogRows';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface SortChipsProps {
  // null : aucun tri, les rangées du catalogue.
  selected: CatalogSortId | null;
  onSelect: (sort: CatalogSortId | null) => void;
}

// Tris du catalogue (lot E), sur une ligne qui défile comme les thèmes : « Trier » puis Nouveautés, Pas
// encore faits, Plus faciles, A à Z. Un appui sur le tri choisi le retire (retour aux rangées).
export function SortChips({ selected, onSelect }: SortChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      <Text style={styles.caption}>{strings.catalog.sortLabel}</Text>
      {CATALOG_SORTS.map((sort) => {
        const isSelected = sort === selected;
        return (
          <Pressable
            key={sort}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(isSelected ? null : sort)}
            style={[styles.chip, isSelected && styles.selectedChip]}>
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{strings.catalog.sorts[sort]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const SORT_CHIP_HEIGHT = 34;

const styles = StyleSheet.create({
  // flexGrow 0 : sur le web, une ScrollView horizontale s'étire sinon en hauteur.
  scroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  row: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  caption: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chip: {
    height: SORT_CHIP_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.surface,
  },
  selectedChip: {
    backgroundColor: AppColors.chipSelected,
  },
  label: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  selectedLabel: {
    color: AppColors.onChipSelected,
  },
});
