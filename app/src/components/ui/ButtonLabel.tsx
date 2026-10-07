import { Platform, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

// Règle commune à TOUS les textes de bouton (hôte et joueurs) : toujours lisibles en entier, quels que
// soient la taille de police et la taille d'affichage du téléphone.
// - Deux lignes au plus ; le bouton grandit en hauteur (jamais de hauteur fixe autour de ce texte).
// - Si le texte ne tient toujours pas : police réduite automatiquement jusqu'à 70 % (Android et iOS).
// - Police du système plafonnée à 140 % (au-delà, les boutons ne tiendraient plus à l'écran).
// - Android 15+ (Pixel 10…) : React Native mesure le texte sur la largeur « théorique » des lettres mais
//   le coupe sur leur largeur réelle, plus grande pour une police épaisse (Bowlby One) ; un texte ajusté
//   au pixel perd alors son dernier mot (« VOIR LE » au lieu de « VOIR LE CLASSEMENT »). Parade : le texte
//   prend toute la largeur du bouton (stretch), et garde une marge proportionnelle à sa police.
//   À retirer quand React Native publiera son correctif (PR #57117).
export const BUTTON_LABEL_MAX_LINES = 2;
export const BUTTON_LABEL_MIN_SCALE = 0.7;
export const BUTTON_LABEL_MAX_FONT_SCALE = 1.4;
// Marge de chaque côté, en part de la taille de police (Android seulement).
const OVERHANG_RATIO = 0.12;
const DEFAULT_FONT_SIZE = 16;

interface ButtonLabelProps {
  children: string;
  style?: StyleProp<TextStyle>;
  // false : le texte épouse son contenu (pastille centrée sans largeur propre) ; la marge reste.
  stretch?: boolean;
}

export function ButtonLabel({ children, style, stretch = true }: ButtonLabelProps) {
  const fontSize = StyleSheet.flatten(style)?.fontSize ?? DEFAULT_FONT_SIZE;
  const margin = Math.max(2, Math.round(fontSize * OVERHANG_RATIO));
  // Gauche et droite explicites : elles l'emportent sur une marge du style (TEXT_FIT_SAFETY compris).
  const slack = Platform.OS === 'android' ? { paddingLeft: margin, paddingRight: margin } : null;
  return (
    <Text
      numberOfLines={BUTTON_LABEL_MAX_LINES}
      adjustsFontSizeToFit
      minimumFontScale={BUTTON_LABEL_MIN_SCALE}
      maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}
      style={[styles.label, stretch && styles.stretch, style, slack]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
});
