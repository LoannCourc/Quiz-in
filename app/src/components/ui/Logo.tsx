import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

export type LogoSize = 'small' | 'medium' | 'large';

// Taille du mot, relief rose (8 px en grand) et contour encre, en points.
const LOGO_SIZES: Record<LogoSize, { fontSize: number; relief: number; outline: number }> = {
  small: { fontSize: 22, relief: 3, outline: 1.5 },
  medium: { fontSize: 34, relief: 5, outline: 2 },
  large: { fontSize: 56, relief: 8, outline: 3 },
};
// Bowlby One en capitales, sans accent : une hauteur de ligne serrée suffit.
const LOGO_LINE_HEIGHT = 1.2;
const DIAGONAL = Math.SQRT1_2;

interface Layer {
  dx: number;
  dy: number;
  color: string;
}

// Contour : huit copies décalées autour d'un point.
function outlineAround(y: number, outline: number, color: string): Layer[] {
  const d = outline * DIAGONAL;
  return [
    [outline, 0],
    [-outline, 0],
    [0, -outline],
    [0, outline],
    [d, d],
    [-d, d],
    [d, -d],
    [-d, -d],
  ].map(([dx, dy]) => ({ dx, dy: y + dy, color }));
}

// Du fond vers le dessus : contour du relief, relief rose (quatre copies vers le bas), contour de la face
// (sa ligne du bas sépare la face du relief), face jaune posée en dernier.
function logoLayers(relief: number, outline: number): Layer[] {
  const reliefSteps = [0.25, 0.5, 0.75, 1].map((part) => ({ dx: 0, dy: relief * part, color: AppColors.logoRelief }));
  return [
    ...outlineAround(relief, outline, AppColors.logoOutline),
    ...outlineAround(relief / 2, outline, AppColors.logoOutline),
    ...reliefSteps,
    ...outlineAround(0, outline, AppColors.logoOutline),
  ];
}

// Logo L5 : QUIZ'IN en Bowlby One, face jaune, relief rose vers le bas, contour encre. Taille fixe
// (insensible à la police du système) : c'est une image, toutes ses couches doivent rester alignées.
export function Logo({ size = 'medium', align = 'center' }: { size?: LogoSize; align?: 'center' | 'start' }) {
  const { fontSize, relief, outline } = LOGO_SIZES[size];
  const text = { fontSize, lineHeight: Math.round(fontSize * LOGO_LINE_HEIGHT) };
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={strings.appName}
      style={[align === 'center' ? styles.centered : styles.start, { paddingHorizontal: outline, paddingTop: outline, paddingBottom: relief + outline }]}>
      {logoLayers(relief, outline).map((layer, index) => (
        <Text
          key={index}
          aria-hidden
          allowFontScaling={false}
          numberOfLines={1}
          style={[styles.word, text, styles.layer, { left: outline + layer.dx, top: outline + layer.dy, color: layer.color }]}>
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
