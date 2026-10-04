import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface ThemeChipsProps {
  themes: string[];
  // null : « Tout ».
  selected: string | null;
  onSelect: (theme: string | null) => void;
}

// Puces de thème du catalogue, sur une ligne qui défile horizontalement.
export function ThemeChips({ themes, selected, onSelect }: ThemeChipsProps) {
  const choices: { value: string | null; label: string }[] = [
    { value: null, label: strings.catalog.allThemes },
    ...themes.map((theme) => ({ value: theme, label: theme })),
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      {choices.map((choice) => {
        const isSelected = choice.value === selected;
        return (
          <Pressable
            key={choice.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(choice.value)}
            style={[styles.chip, isSelected && styles.selectedChip]}>
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{choice.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // flexGrow 0 : sur le web, une ScrollView horizontale s'étire sinon en hauteur.
  scroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    height: AppSizes.chipHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  selectedChip: {
    borderColor: AppColors.chipSelected,
    backgroundColor: AppColors.chipSelected,
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  selectedLabel: {
    color: AppColors.onChipSelected,
  },
});
