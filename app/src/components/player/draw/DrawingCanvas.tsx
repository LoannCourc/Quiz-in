import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

import type { DrawingCanvasProps } from './drawingTypes';

// App de l'hôte (Android) : pas de surface de dessin sans nouveau module natif ; l'hôte qui joue ne
// dessine pas (décision D1). Le vrai canvas est DrawingCanvas.web.tsx (site des joueurs).
export function DrawingCanvas(_props: DrawingCanvasProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{strings.draw.nativeUnavailable}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    aspectRatio: 4 / 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  text: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 15,
  },
});
