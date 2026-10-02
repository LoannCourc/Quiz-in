import { AVATARS } from '@shared/avatars';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <View style={styles.grid}>
      {AVATARS.map((avatar) => (
        <Pressable
          key={avatar}
          accessibilityRole="radio"
          accessibilityState={{ selected: avatar === selected }}
          onPress={() => onSelect(avatar)}
          style={[styles.cell, avatar === selected && styles.selectedCell]}>
          <Text style={styles.emoji}>{avatar}</Text>
        </Pressable>
      ))}
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
    borderRadius: AppSizes.radius,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: AppColors.surface,
  },
  selectedCell: {
    borderColor: AppColors.accent,
  },
  emoji: {
    fontSize: 28,
  },
});
