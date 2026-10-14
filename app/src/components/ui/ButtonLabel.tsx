import { DISPLAY_CHAR_WIDTH, fittedLabelScale, TEXT_CHAR_WIDTH } from '@shared/labelFit';
import { useState } from 'react';
import { PixelRatio, Platform, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { AppFonts } from '@/constants/appTheme';

// Règle commune à TOUS les textes de bouton (hôte et joueurs) : toujours lisibles en entier, quels que
// soient la taille de police et la taille d'affichage du téléphone.
// - Deux lignes au plus ; le bouton grandit en hauteur (jamais de hauteur fixe autour de ce texte).
// - Si le texte ne tient toujours pas : police réduite jusqu'à 70 %. Android : par le système
//   (adjustsFontSizeToFit). iOS : calculée ici (shared/labelFit.ts) d'après la largeur mesurée, police et
//   hauteur de ligne réduites ensemble ; le système réduisait les lettres sans réduire la boîte, et dessinait
//   le texte en haut d'une pastille trop haute (« REPRENDRE LA PARTIE 746N » sur iPhone 14).
// - Police du système plafonnée à 140 % (au-delà, les boutons ne tiendraient plus à l'écran).
// - Android 15+ (Pixel 10…) : React Native mesure le texte sur la largeur « théorique » des lettres mais
//   le coupe sur leur largeur réelle, plus grande pour une police épaisse (Bowlby One) ; un texte ajusté
//   au pixel perd alors son dernier mot (« VOIR LE » au lieu de « VOIR LE CLASSEMENT »). Parade : le texte
//   prend toute la largeur du bouton (stretch), et garde une marge proportionnelle à sa police.
//   À retirer quand React Native publiera son correctif (PR #57117).
// - Bouton avec icône (rangée) : inRow. Le texte prend la largeur laissée par l'icône (flex), centré en
//   largeur par textAlign et en hauteur par la rangée (alignItems: 'center'). Jamais alignSelf: 'stretch'
//   dans une rangée : il étirerait le texte en HAUTEUR et le collerait en haut du bouton.
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
  // Dans une rangée (icône + texte) : partage la largeur de la rangée au lieu de s'étirer.
  inRow?: boolean;
  // Lignes au plus (2 par défaut ; 1 pour un bouton de hauteur fixe).
  maxLines?: number;
}

export function ButtonLabel({ children, style, stretch = true, inRow = false, maxLines = BUTTON_LABEL_MAX_LINES }: ButtonLabelProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = flat.fontSize ?? DEFAULT_FONT_SIZE;
  const margin = Math.max(2, Math.round(fontSize * OVERHANG_RATIO));
  // Gauche et droite explicites : elles l'emportent sur une marge du style (TEXT_FIT_SAFETY compris).
  const slack = Platform.OS === 'android' ? { paddingLeft: margin, paddingRight: margin } : null;
  const iosFit = useIosFit(children, flat, maxLines, stretch || inRow);
  return (
    <Text
      numberOfLines={maxLines}
      adjustsFontSizeToFit={Platform.OS !== 'ios'}
      minimumFontScale={BUTTON_LABEL_MIN_SCALE}
      maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}
      onLayout={iosFit.onLayout}
      style={[styles.label, inRow ? styles.inRow : stretch && styles.stretch, style, slack, iosFit.style]}>
      {children}
    </Text>
  );
}

// iOS : taille calculée d'après la largeur du texte (mesurée par onLayout ; texte étiré seulement : un texte
// qui épouse son contenu n'a pas de largeur propre). Police et hauteur de ligne réduites ensemble : la boîte
// garde exactement la hauteur de ses lignes, le bouton la centre.
function useIosFit(text: string, flat: TextStyle, maxLines: number, hasOwnWidth: boolean) {
  const [width, setWidth] = useState(0);
  if (Platform.OS !== 'ios' || !hasOwnWidth) return { onLayout: undefined, style: null };
  const fontSize = flat.fontSize ?? DEFAULT_FONT_SIZE;
  const rendered = fontSize * Math.min(PixelRatio.getFontScale(), BUTTON_LABEL_MAX_FONT_SCALE);
  const charRatio = flat.fontFamily === AppFonts.display ? DISPLAY_CHAR_WIDTH : TEXT_CHAR_WIDTH;
  const scale = fittedLabelScale(text, width, rendered, maxLines, charRatio);
  const onLayout = (event: { nativeEvent: { layout: { width: number } } }) => setWidth(Math.round(event.nativeEvent.layout.width));
  if (scale === 1) return { onLayout, style: null };
  return { onLayout, style: { fontSize: fontSize * scale, ...(flat.lineHeight !== undefined && { lineHeight: flat.lineHeight * scale }) } };
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
  inRow: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});
