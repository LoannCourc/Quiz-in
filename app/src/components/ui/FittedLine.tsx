import { useState } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

interface FittedLineProps {
  text: string;
  // Style du texte, avec sa taille de police (fontSize) : la taille d'origine, réduite au besoin.
  style: TextStyle & { fontSize: number };
  minSize: number;
  // Police du système : agrandissement au plus de ce facteur (la ligne doit rester sur une ligne).
  maxFontScale?: number;
}

// Largeur laissée au texte de mesure (bien plus que la ligne la plus longue).
const MEASURE_WIDTH = 1000;

// Texte sur une seule ligne, jamais coupé : sa largeur naturelle est mesurée par un texte invisible, puis la
// taille est réduite pour tenir dans la colonne (minSize au moins). Même méthode que la méta du salon.
export function FittedLine({ text, style, minSize, maxFontScale = 1.2 }: FittedLineProps) {
  const [columnWidth, setColumnWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const size = columnWidth > 0 && textWidth > columnWidth ? Math.max(minSize, Math.floor((style.fontSize * columnWidth) / textWidth)) : style.fontSize;
  return (
    <View onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
      <Text style={[style, { fontSize: size }]} numberOfLines={1} maxFontSizeMultiplier={maxFontScale}>
        {text}
      </Text>
      <View style={styles.measureBox} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden pointerEvents="none">
        <View style={styles.measureRow}>
          <Text style={[style, styles.measure]} maxFontSizeMultiplier={maxFontScale} onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}>
            {text}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Boîte vide qui cache le texte de mesure sans gêner la mise en page.
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
