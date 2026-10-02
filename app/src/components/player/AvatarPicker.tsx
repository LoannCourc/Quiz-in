import { AVATARS } from '@shared/avatars';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
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
    width: PlayerSizes.avatarCell,
    height: PlayerSizes.avatarCell,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: PlayerSizes.radius,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: PlayerColors.surface,
  },
  selectedCell: {
    borderColor: PlayerColors.accent,
  },
  emoji: {
    fontSize: 28,
  },
});
