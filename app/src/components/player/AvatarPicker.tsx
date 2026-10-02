import { AVATARS } from '@shared/avatars';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

// Pastilles blanches ; l'avatar choisi est cerclé d'or et grossi (pas seulement une couleur).
export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <View style={styles.grid}>
      {AVATARS.map((avatar) => {
        const isSelected = avatar === selected;
        return (
          <Pressable
            key={avatar}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(avatar)}
            style={[styles.cell, isSelected && styles.selectedCell]}>
            <Text style={styles.emoji}>{avatar}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  cell: {
    width: AppSizes.avatarCell,
    height: AppSizes.avatarCell,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: AppSizes.avatarCell / 2,
    borderWidth: AppSizes.selectionWidth,
    borderColor: 'transparent',
    backgroundColor: AppColors.card,
    opacity: 0.85,
  },
  selectedCell: {
    borderColor: AppColors.accent,
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  emoji: {
    fontSize: 28,
  },
});
