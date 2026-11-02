import { Pressable, StyleSheet, View } from 'react-native';

import { AppColors, AppShadows } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

import { BADGES_HOME_BUTTON_SIZE } from './BadgesHomeButton';

const BORDER = 3;
const HEART_SIZE = 22;

// Accueil : cœur rose à gauche du trophée, même taille ; ouvre la fenêtre « Quiz'in te plaît ? ».
export function SupportHomeButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.trophies.support.homeButton}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <HeartIcon size={HEART_SIZE} color={AppColors.onSupport} />
    </Pressable>
  );
}

// Cœur plein dessiné avec des View : un carré tourné de 45° et deux disques sur ses côtés du haut.
function HeartIcon({ size, color }: { size: number; color: string }) {
  // Demi-diagonale du carré : le cœur fait (1 + √2) demi-diagonales de large.
  const half = size / (1 + Math.SQRT2);
  const side = half * Math.SQRT2;
  const centerX = size / 2;
  // Cœur haut de (1/2 + √2/2 + 1) demi-diagonales, centré dans la boîte.
  const height = half * (1.5 + Math.SQRT1_2);
  const centerY = (size - height) / 2 + half * (0.5 + Math.SQRT1_2);
  const piece = { position: 'absolute' as const, width: side, height: side, backgroundColor: color };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[piece, { left: centerX - side / 2, top: centerY - side / 2, transform: [{ rotate: '45deg' }] }]} />
      {[-1, 1].map((direction) => (
        <View
          key={direction}
          style={[piece, { borderRadius: side / 2, left: centerX + (direction * half) / 2 - side / 2, top: centerY - half / 2 - side / 2 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BADGES_HOME_BUTTON_SIZE,
    height: BADGES_HOME_BUTTON_SIZE,
    borderRadius: BADGES_HOME_BUTTON_SIZE / 2,
    borderWidth: BORDER,
    borderColor: AppColors.supportBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.support,
    boxShadow: AppShadows.submit,
  },
  pressed: {
    opacity: 0.8,
  },
});
