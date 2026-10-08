import { useState, type ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

import type { DrawingCanvasProps } from './drawingTypes';

// Zoom dans l'app (livraison C, étape 3) : pincement, boutons et mini-carte, comme sur le site des joueurs.
export const CANVAS_CAN_ZOOM = true;

// Canvas SVG (react-native-svg) chargé seulement quand l'hôte dessine, jamais au démarrage : un build de
// développement plus ancien, sans ce module natif, ouvre l'app normalement. null : module absent.
let svgCanvas: ComponentType<DrawingCanvasProps> | null | undefined;

function loadSvgCanvas(): ComponentType<DrawingCanvasProps> | null {
  if (svgCanvas === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargement paresseux : un module natif absent ne doit pas empêcher l'app de s'ouvrir
      svgCanvas = (require('./SvgDrawingCanvas') as typeof import('./SvgDrawingCanvas')).SvgDrawingCanvas;
    } catch (error) {
      if (__DEV__) console.warn('[dessin] Module SVG absent de ce build : pas de surface de dessin', error);
      svgCanvas = null;
    }
  }
  return svgCanvas;
}

// App de l'hôte qui joue : la surface de dessin SVG, ou un message clair si ce build ne la contient pas.
export function DrawingCanvas(props: DrawingCanvasProps) {
  // Chargé une fois, au premier affichage : toujours le même composant ensuite.
  const [SvgCanvas] = useState(loadSvgCanvas);
  if (SvgCanvas) return <SvgCanvas {...props} />;
  return (
    <View style={styles.missing}>
      <Text style={styles.missingText}>{strings.draw.canvasMissing}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: {
    width: '100%',
    aspectRatio: 4 / 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: AppSizes.radius / 2,
    backgroundColor: AppColors.surface,
  },
  missingText: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 15,
    textAlign: 'center',
  },
});
