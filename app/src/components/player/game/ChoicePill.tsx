import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface ChoicePillProps {
  choice: number;
  text: string;
  // Contour blanc : réponse choisie par le joueur.
  isSelected?: boolean;
  // Grisée : une autre proposition a été choisie.
  isDimmed?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

// Pilule colorée A, B, C ou D avec pastille de lettre sombre (maquette mobile).
// La lettre accompagne toujours la couleur : l'information ne repose jamais sur la couleur seule.
export function ChoicePill({ choice, text, isSelected = false, isDimmed = false, disabled = false, onPress }: ChoicePillProps) {
  const letter = strings.game.choiceLetters[choice];
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
          { backgroundColor: AppColors.choices[choice] },
          pressed && styles.pressed,
          isDimmed && styles.dimmed,
        ]}>
        <View style={styles.letterDisc}>
          <Text style={styles.letter}>{letter}</Text>
        </View>
        <Text style={[styles.text, text.length > LONG_TEXT_LENGTH && styles.longText]}>{text}</Text>
      </Pressable>
    </View>
  );
}

const RING_GAP = 3;
// Au-delà, la proposition (60 caractères au plus) passe en taille réduite : les 4 pilules
// restent visibles sans défiler.
const LONG_TEXT_LENGTH = 30;

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
    width: AppSizes.choiceLetter,
    height: AppSizes.choiceLetter,
    borderRadius: AppSizes.choiceLetter / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  letter: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 24,
    lineHeight: Math.round(24 * DISPLAY_LINE_HEIGHT),
  },
  text: {
    flex: 1,
    color: AppColors.onChoice,
    fontFamily: AppFonts.black,
    fontSize: 22,
  },
  longText: {
    fontSize: 17,
  },
});
