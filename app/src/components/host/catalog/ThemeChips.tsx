import { isThemeSelected, type ThemeSelection } from '@shared/catalogRows';
import { themeIconOf } from '@shared/themeIcons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemeIcon } from '@/components/ui/ThemeIcon';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface ThemeChipsProps {
  themes: string[];
  selection: ThemeSelection;
  // Appui sur une puce ; null : « Tout » (toggleTheme, shared/catalogRows.ts).
  onToggle: (theme: string | null) => void;
  // Sur plusieurs lignes au lieu d'une ligne qui défile (feuille des filtres du Quiz).
  wrap?: boolean;
}

// Puces de thème du catalogue, sur une ligne qui défile horizontalement (ou sur plusieurs lignes) : pastille ronde à la couleur
// du thème avec son icône (maquette I2), puis le libellé ; « Tout » sans pastille. Plusieurs thèmes peuvent
// être choisis (Quiz : questions tirées dans leur union).
export function ThemeChips({ themes, selection, onToggle, wrap = false }: ThemeChipsProps) {
  const choices: { value: string | null; label: string }[] = [
    { value: null, label: strings.catalog.allThemes },
    ...themes.map((theme) => ({ value: theme, label: theme })),
  ];
  const chips = choices.map((choice) => {
    const isSelected = isThemeSelected(selection, choice.value);
    return (
      <Pressable
        key={choice.label}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        onPress={() => onToggle(choice.value)}
        style={[styles.chip, choice.value !== null && styles.chipWithIcon, isSelected && styles.selectedChip]}>
        {choice.value !== null && <ThemeDisc theme={choice.value} />}
        <Text style={[styles.label, isSelected && styles.selectedLabel]}>{choice.label}</Text>
      </Pressable>
    );
  });
  if (wrap) return <View style={styles.wrap}>{chips}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      {chips}
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
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
