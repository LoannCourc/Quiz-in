import { boundedFontSize } from '@shared/fontSize';
import { optionsTextSize, type OptionsTextSize } from '@shared/optionsText';
import { trackOptionParts } from '@shared/trackOption';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { BUTTON_LABEL_MAX_FONT_SCALE } from '@/components/ui/ButtonLabel';

// Tailles de pastille et de texte : « medium » partout (maquette) ; sur l'écran de question,
// la taille suit la hauteur disponible pour chaque pilule (voir pillSizeForHeight).
export type PillSize = 'large' | 'medium' | 'small';

const SIZES: Record<PillSize, { letter: number; letterFont: number; text: Record<OptionsTextSize, number> }> = {
  large: { letter: 68, letterFont: 30, text: { normal: 27, long: 20, veryLong: 17 } },
  medium: { letter: AppSizes.choiceLetter, letterFont: 24, text: { normal: 22, long: 17, veryLong: 15 } },
  small: { letter: 46, letterFont: 20, text: { normal: 19, long: 15, veryLong: 13 } },
};

// Taille du texte commune à toutes les propositions d'une question, d'après la plus longue
// (80 caractères au plus) : jamais de réduction proposition par proposition. Blind test : d'après les titres
// (l'artiste, plus petit, va dessous).
export function choiceTextSize(options: readonly string[]): OptionsTextSize {
  const parts = options.map(trackOptionParts);
  const size = optionsTextSize(
    parts.map((part) => part.title),
    { normalMax: 30, longMax: 60 },
  );
  // L'artiste ajoute une ligne à chaque pilule : un cran plus petit, pour que les quatre tiennent sans défiler.
  return size === 'normal' && parts.some((part) => part.artist !== null) ? 'long' : size;
}

// Part de la taille du titre donnée à l'artiste, sous le titre (blind test).
const ARTIST_SCALE = 0.72;

// Taille la plus grande qui laisse tenir une proposition de 80 caractères (4 lignes) dans une
// pilule de cette hauteur.
export function pillSizeForHeight(height: number): PillSize {
  if (height >= 108) return 'large';
  if (height >= 86) return 'medium';
  return 'small';
}

interface ChoicePillProps {
  choice: number;
  text: string;
  // Contour blanc : réponse choisie par le joueur.
  isSelected?: boolean;
  // Grisée : une autre proposition a été choisie.
  isDimmed?: boolean;
  disabled?: boolean;
  size?: PillSize;
  // Taille du texte, la même pour toutes les propositions de la question (choiceTextSize).
  textSize?: OptionsTextSize;
  // Remplissage : hauteur minimale de la pilule, sa part de la hauteur disponible (72 à 116 px) ; elle
  // grandit au-delà si son texte le demande (jamais de texte rogné : l'écran défile alors).
  fillHeight?: number;
  onPress?: () => void;
}

// Pilule colorée A, B, C ou D avec pastille de lettre sombre (maquette mobile).
// La lettre accompagne toujours la couleur : l'information ne repose jamais sur la couleur seule.
export function ChoicePill({
  choice,
  text,
  isSelected = false,
  isDimmed = false,
  disabled = false,
  size = 'medium',
  textSize = 'normal',
  fillHeight,
  onPress,
}: ChoicePillProps) {
  const letter = strings.game.choiceLetters[choice];
  const { letter: letterSize, letterFont, text: textFonts } = SIZES[size];
  const fontSize = textFonts[textSize];
  // Blind test « Titre – Artiste » : titre en gros, artiste en plus petit dessous.
  const { title, artist } = trackOptionParts(text);
  return (
    // Anneau extérieur toujours présent (transparent sinon) : la sélection ne décale rien.
    <View style={[styles.selectionRing, isSelected && styles.selected]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${letter} : ${text}`}
        accessibilityState={{ disabled, selected: isSelected }}
        disabled={disabled || !onPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          fillHeight !== undefined && { minHeight: fillHeight },
          { backgroundColor: AppColors.choices[choice] },
          pressed && styles.pressed,
          isDimmed && styles.dimmed,
        ]}>
        <View style={[styles.letterDisc, { width: letterSize, height: letterSize, borderRadius: letterSize / 2 }]}>
          <Text style={[styles.letter, { fontSize: letterFont, lineHeight: Math.round(letterFont * DISPLAY_LINE_HEIGHT) }]}>
            {letter}
          </Text>
        </View>
        <View style={styles.texts}>
          <Text style={[styles.text, { fontSize }]} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
            {title}
          </Text>
          {artist !== null && (
            <Text style={[styles.artist, { fontSize: boundedFontSize(Math.round(fontSize * ARTIST_SCALE), fontSize) }]} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
              {artist}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const RING_GAP = 3;

const styles = StyleSheet.create({
  selectionRing: {
    padding: RING_GAP,
    borderRadius: AppSizes.radiusPill + RING_GAP * 2,
    borderWidth: AppSizes.selectionWidth,
    borderColor: 'transparent',
    margin: -(RING_GAP + AppSizes.selectionWidth),
  },
  selected: {
    borderColor: AppColors.selection,
  },
  pill: {
    minHeight: AppSizes.choiceHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    boxShadow: AppShadows.hard,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  dimmed: {
    opacity: 0.4,
  },
  letterDisc: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  letter: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
  },
  texts: {
    flex: 1,
  },
  text: {
    color: AppColors.onChoice,
    fontFamily: AppFonts.black,
  },
  artist: {
    color: AppColors.onChoice,
    fontFamily: AppFonts.bold,
  },
});
