import { breakablePieces, fittedMeasuredSize } from '@shared/labelFit';
import { useState } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

interface FittedTitleProps {
  text: string;
  // Style du texte, avec sa taille de police (fontSize) : la taille d'origine, réduite au besoin.
  style: TextStyle & { fontSize: number };
  maxLines: number;
  minSize: number;
  // Police du système : agrandissement au plus de ce facteur (absent : sans limite).
  maxFontScale?: number;
}

// Largeur laissée aux textes de mesure (bien plus que le titre le plus long).
const MEASURE_WIDTH = 1000;
// Marge sur la largeur de la colonne : Android 15+ mesure le texte un peu plus étroit qu'il n'est dessiné.
const WIDTH_SAFETY = 0.97;

// Titre jamais coupé par « … » : chaque morceau (mot, ou partie après un trait d'union) et le titre entier sont
// mesurés par des textes invisibles, puis la taille est réduite juste assez pour que le titre tienne sur
// maxLines lignes sans couper un morceau (minSize au moins ; en dessous, il passe à la ligne plutôt que d'être
// coupé). Même méthode que FittedLine.
export function FittedTitle({ text, style, maxLines, minSize, maxFontScale }: FittedTitleProps) {
  const pieces = breakablePieces(text);
  const [columnWidth, setColumnWidth] = useState(0);
  const [fullWidth, setFullWidth] = useState(0);
  const [pieceWidths, setPieceWidths] = useState<Record<number, number>>({});
  const measured = pieces.map((piece, index) => ({ width: pieceWidths[index] ?? 0, spaced: piece.spaced }));
  const isMeasured = fullWidth > 0 && measured.every((piece) => piece.width > 0);
  const spaces = pieces.filter((piece) => piece.spaced).length;
  const space = spaces > 0 ? Math.max(0, (fullWidth - measured.reduce((sum, piece) => sum + piece.width, 0)) / spaces) : 0;
  const size = isMeasured ? fittedMeasuredSize(measured, space, columnWidth * WIDTH_SAFETY, style.fontSize, maxLines, minSize) : style.fontSize;
  const measureStyle = [style, styles.measure];
  return (
    <View onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
      <Text style={[style, { fontSize: size }]} maxFontSizeMultiplier={maxFontScale}>
        {text}
      </Text>
      <View style={styles.measureBox} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden pointerEvents="none">
        <View style={styles.measureRow}>
          <Text style={measureStyle} maxFontSizeMultiplier={maxFontScale} onLayout={(event) => setFullWidth(event.nativeEvent.layout.width)}>
            {text}
          </Text>
          {pieces.map((piece, index) => (
            <Text
              key={`${index}-${piece.text}`}
              style={measureStyle}
              maxFontSizeMultiplier={maxFontScale}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                setPieceWidths((current) => (current[index] === width ? current : { ...current, [index]: width }));
              }}>
              {piece.text}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Boîte vide qui cache les textes de mesure sans gêner la mise en page.
  measureBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  measureRow: {
    width: MEASURE_WIDTH,
    alignItems: 'flex-start',
  },
  measure: {
    opacity: 0,
  },
});
