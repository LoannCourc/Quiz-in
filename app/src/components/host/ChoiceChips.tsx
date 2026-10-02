import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

export interface Choice<T> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T> {
  choices: readonly Choice<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

// Rangée de boutons à choix unique : filtres du catalogue, mode de réponse.
export function ChoiceChips<T>({ choices, selected, onSelect }: ChoiceChipsProps<T>) {
  return (
    <View style={styles.row}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  selectedChip: {
    backgroundColor: AppColors.accent,
  },
  label: {
    color: AppColors.text,
    fontSize: AppSizes.textBody,
    fontWeight: '700',
  },
  selectedLabel: {
    color: AppColors.onAccent,
  },
});
