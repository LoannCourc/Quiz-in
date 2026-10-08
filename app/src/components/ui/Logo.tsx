import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

export type LogoSize = 'small' | 'medium' | 'large';

// Taille du mot, relief rose (8 px en grand) et ombre encre sous le relief, en points.
const LOGO_SIZES: Record<LogoSize, { fontSize: number; relief: number; shadow: number }> = {
  small: { fontSize: 22, relief: 3, shadow: 2 },
  medium: { fontSize: 34, relief: 5, shadow: 2 },
  large: { fontSize: 56, relief: 8, shadow: 3 },
};
// Bowlby One en capitales, sans accent : une hauteur de ligne serrée suffit.
const LOGO_LINE_HEIGHT = 1.2;

interface Layer {
  dy: number;
  color: string;
}

// Du fond vers le dessus : ombre encre sous le relief, relief rose (une copie par point vers le bas), puis
// la face or, posée en dernier. Aucun contour autour des lettres (maquette L5).
function logoLayers(relief: number, shadow: number): Layer[] {
  const reliefSteps = Array.from({ length: relief }, (_, index) => ({ dy: relief - index, color: AppColors.logoRelief }));
  return [{ dy: relief + shadow, color: AppColors.logoShadow }, ...reliefSteps];
}

// Logo L5 : QUIZ'IN en Bowlby One, face or, relief rose vers le bas, ombre encre sous le relief. Taille fixe
// (insensible à la police du système) : c'est une image, toutes ses couches doivent rester alignées.
export function Logo({ size = 'medium', align = 'center' }: { size?: LogoSize; align?: 'center' | 'start' }) {
  const { fontSize, relief, shadow } = LOGO_SIZES[size];
  const text = { fontSize, lineHeight: Math.round(fontSize * LOGO_LINE_HEIGHT) };
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={strings.appName}
      style={[align === 'center' ? styles.centered : styles.start, { paddingBottom: relief + shadow }]}>
      {logoLayers(relief, shadow).map((layer, index) => (
        <Text
          key={index}
          aria-hidden
          allowFontScaling={false}
          numberOfLines={1}
          style={[styles.word, text, styles.layer, { left: 0, top: layer.dy, color: layer.color }]}>
          {strings.appName}
        </Text>
      ))}
      <Text aria-hidden allowFontScaling={false} numberOfLines={1} style={[styles.word, text, styles.face]}>
        {strings.appName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignSelf: 'center',
  },
  start: {
    alignSelf: 'flex-start',
  },
  word: {
    fontFamily: AppFonts.display,
    textTransform: 'uppercase',
  },
  layer: {
    position: 'absolute',
  },
  face: {
    color: AppColors.logoFace,
  },
});
