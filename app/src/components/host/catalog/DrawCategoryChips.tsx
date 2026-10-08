import { DRAW_CATEGORIES, drawCategoryId } from '@shared/drawWords';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface DrawCategoryChipsProps {
  // Identifiants choisis (drawCategoryId) ; vide : « Mélange ».
  selected: readonly string[];
  onChange: (selected: string[]) => void;
}

// Dessine-moi, catalogue : « Mélange » (toutes les catégories, par défaut) puis les 12 catégories de mots,
// à choisir une ou plusieurs. Puces sur plusieurs lignes : toutes visibles sans défiler, on voit d'un coup
// d'œil ce qui est choisi. Choisir « Mélange » efface le choix ; tout décocher y revient.
export function DrawCategoryChips({ selected, onChange }: DrawCategoryChipsProps) {
  const isMix = selected.length === 0;
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  }
  return (
    <View style={styles.wrap} accessibilityLabel={strings.catalog.drawCategories.label}>
      <Chip label={strings.catalog.drawCategories.mix} isSelected={isMix} onPress={() => onChange([])} />
      {DRAW_CATEGORIES.map((category) => {
        const id = drawCategoryId(category);
        return <Chip key={id} label={category} isSelected={selected.includes(id)} onPress={() => toggle(id)} />;
      })}
    </View>
  );
}

function Chip({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={[styles.chip, isSelected && styles.selectedChip]}>
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: AppSizes.chipHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  selectedChip: {
    borderColor: AppColors.chipSelected,
    backgroundColor: AppColors.chipSelected,
  },
  label: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  selectedLabel: {
    color: AppColors.onChipSelected,
  },
});
