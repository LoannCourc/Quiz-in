import { useState, type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { GRID, questionMark } from './iconShapes';

interface QuestionMarkIconProps {
  size: number;
  color: string;
  shadowColor?: string;
  shadowOffset?: number;
}

// Composant SVG chargé à la demande, jamais au démarrage (module natif récent : un build plus ancien qui
// ne l'a pas doit quand même s'ouvrir). null : module absent.
let svgMark: ComponentType<QuestionMarkIconProps> | null | undefined;

function loadSvgMark(): ComponentType<QuestionMarkIconProps> | null {
  if (svgMark === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargement paresseux : un module natif absent ne doit pas empêcher l'app de s'ouvrir
      svgMark = (require('./QuestionMarkSvg') as typeof import('./QuestionMarkSvg')).QuestionMarkSvg;
    } catch (error) {
      if (__DEV__) console.warn('[icônes] Module SVG absent de ce build : « ? » dessiné en formes', error);
      svgMark = null;
    }
  }
  return svgMark;
}

// Le « ? » de Quiz'in (Culture générale, thème inconnu, tuile Quiz de l'accueil) : un seul composant pour
// tous les écrans. Courbe en SVG (jamais de glyphe de police : métriques différentes sur iOS) ; build sans
// react-native-svg : repli lisible en formes (iconShapes).
export function QuestionMarkIcon({ size, color, shadowColor, shadowOffset = 0 }: QuestionMarkIconProps) {
  const [SvgMark] = useState(loadSvgMark);
  const safeSize = Math.max(0, size);
  if (SvgMark) return <SvgMark size={safeSize} color={color} shadowColor={shadowColor} shadowOffset={shadowOffset} />;
  const k = safeSize / GRID;
  return (
    <View style={{ width: safeSize, height: safeSize + (shadowColor ? shadowOffset : 0) }}>
      {shadowColor && <View style={[StyleSheet.absoluteFill, { top: shadowOffset }]}>{questionMark({ k, color: shadowColor })}</View>}
      <View style={StyleSheet.absoluteFill}>{questionMark({ k, color })}</View>
    </View>
  );
}
