import { AVATARS } from '@shared/avatars';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { gradientStyle } from '@/components/ui/gradient';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
  // row : une seule ligne qui défile horizontalement, dégradé à droite (« Je joue aussi » de l'hôte,
  // maquette R4) ; fadeColor : couleur du fond sous la ligne, vers laquelle le dégradé s'efface.
  layout?: 'grid' | 'row';
  fadeColor?: string;
}

// Pastilles blanches ; l'avatar choisi est cerclé d'or et grossi (pas seulement une couleur). Même jeu
// d'avatars et même rendu pour les joueurs et pour l'hôte qui joue.
export function AvatarPicker({ selected, onSelect, layout = 'grid', fadeColor = AppColors.background }: AvatarPickerProps) {
  const cells = AVATARS.map((avatar) => {
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
  });
  if (layout === 'grid') return <View style={styles.grid}>{cells}</View>;
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.row}>
        {cells}
      </ScrollView>
      <View pointerEvents="none" style={[styles.fade, gradientStyle(`linear-gradient(90deg, transparent, ${fadeColor})`)]} />
    </View>
  );
}

const FADE_WIDTH = 40;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  // Marges : l'avatar choisi est grossi (scale) ; il ne doit pas être rogné par la ligne.
  row: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingRight: FADE_WIDTH,
  },
  fade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: FADE_WIDTH,
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
