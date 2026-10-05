import { themeIconOf } from '@shared/themeIcons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemeIcon } from '@/components/ui/ThemeIcon';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface ThemeChipsProps {
  themes: string[];
  // null : « Tout ».
  selected: string | null;
  onSelect: (theme: string | null) => void;
}

// Puces de thème du catalogue, sur une ligne qui défile horizontalement : pastille ronde à la couleur
// du thème avec son icône (maquette I2), puis le libellé ; « Tout » sans pastille.
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
            style={[styles.chip, choice.value !== null && styles.chipWithIcon, isSelected && styles.selectedChip]}>
            {choice.value !== null && <ThemeDisc theme={choice.value} />}
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{choice.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ThemeDisc({ theme }: { theme: string }) {
  const name = themeIconOf(theme);
  return (
    <View style={[styles.disc, { backgroundColor: AppColors.themeChips[name] }]}>
      <ThemeIcon name={name} size={ICON_SIZE} />
    </View>
  );
}

const ICON_SIZE = 18;
const DISC_SIZE = 28;

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  chipWithIcon: {
    paddingLeft: Spacing.one,
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
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
