import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Tailles de pastille et de texte : « medium » partout (maquette) ; sur l'écran de question,
// la taille suit la hauteur disponible pour chaque pilule (voir pillSizeForHeight).
export type PillSize = 'large' | 'medium' | 'small';

const SIZES: Record<PillSize, { letter: number; letterFont: number; text: number; longText: number }> = {
  large: { letter: 68, letterFont: 30, text: 27, longText: 20 },
  medium: { letter: AppSizes.choiceLetter, letterFont: 24, text: 22, longText: 17 },
  small: { letter: 46, letterFont: 20, text: 19, longText: 15 },
};

// Au-delà, la proposition (60 caractères au plus) passe en taille réduite.
const LONG_TEXT_LENGTH = 30;

// Taille la plus grande qui laisse tenir une proposition de 60 caractères (3 lignes) dans une
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
  // Remplissage : la pilule prend sa part de la hauteur disponible (72 à 116 px).
  fill?: boolean;
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
  fill = false,
  onPress,
}: ChoicePillProps) {
  const letter = strings.game.choiceLetters[choice];
  const { letter: letterSize, letterFont, text: textSize, longText } = SIZES[size];
  const fontSize = text.length > LONG_TEXT_LENGTH ? longText : textSize;
  return (
    // Anneau extérieur toujours présent (transparent sinon) : la sélection ne décale rien.
    <View style={[styles.selectionRing, isSelected && styles.selected, fill && styles.fillRing]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${letter} : ${text}`}
        accessibilityState={{ disabled, selected: isSelected }}
        disabled={disabled || !onPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          fill && styles.fillPill,
          { backgroundColor: AppColors.choices[choice] },
          pressed && styles.pressed,
          isDimmed && styles.dimmed,
        ]}>
        <View style={[styles.letterDisc, { width: letterSize, height: letterSize, borderRadius: letterSize / 2 }]}>
          <Text style={[styles.letter, { fontSize: letterFont, lineHeight: Math.round(letterFont * DISPLAY_LINE_HEIGHT) }]}>
            {letter}
          </Text>
        </View>
        <Text style={[styles.text, { fontSize }]}>{text}</Text>
      </Pressable>
    </View>
  );
}

const RING_GAP = 3;
const RING_EXTRA = (RING_GAP + AppSizes.selectionWidth) * 2;

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
  // Remplissage : part égale de la hauteur, sans dépasser le plafond (anneau compris).
  fillRing: {
    flex: 1,
    minHeight: AppSizes.choiceHeightMin + RING_EXTRA,
    maxHeight: AppSizes.choiceHeightLarge + RING_EXTRA,
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
  fillPill: {
    flex: 1,
    minHeight: AppSizes.choiceHeightMin,
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
  text: {
    flex: 1,
    color: AppColors.onChoice,
    fontFamily: AppFonts.black,
  },
});
