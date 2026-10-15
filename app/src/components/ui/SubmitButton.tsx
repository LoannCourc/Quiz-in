import { Pressable, StyleSheet } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

import { ButtonLabel } from './ButtonLabel';

const LABEL_SIZE = 18;
const COMPACT_HEIGHT = 44;
const COMPACT_LABEL_SIZE = 16;

interface SubmitButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  // Plus bas (44) et texte en 16 : barre compacte « Nombre de questions » (maquette Q1).
  compact?: boolean;
  // Sur une ligne, texte réduit au besoin (« CONTINUER · 20 QUESTIONS » des écrans du Quiz).
  singleLine?: boolean;
}

// Bouton d'envoi des réponses écrites (maquette S1 : Quiz et Blind test en saisie libre, Bluff, Dessine-moi) :
// pilule or de 58 points, ombre encre décalée de 5. Désactivé : comme BigButton (pilule translucide).
// Posé en bas de la colonne : Screen le garde au-dessus du clavier (useKeyboardInset).
export function SubmitButton({ label, onPress, disabled = false, compact = false, singleLine = false }: SubmitButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, compact && styles.compact, pressed && styles.pressed, disabled && styles.disabled]}>
      <ButtonLabel maxLines={singleLine ? 1 : undefined} style={[styles.label, compact && styles.compactLabel, singleLine && styles.singleLineLabel, disabled && styles.disabledLabel]}>
        {label}
      </ButtonLabel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: AppSizes.submitHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.submit,
  },
  compact: {
    minHeight: COMPACT_HEIGHT,
  },
  compactLabel: {
    fontSize: COMPACT_LABEL_SIZE,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    boxShadow: AppShadows.submitPressed,
  },
  disabled: {
    backgroundColor: AppColors.surface,
    boxShadow: 'none',
  },
  label: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: LABEL_SIZE,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Sans espacement des lettres : le calcul de la taille sur une ligne (ButtonLabel) n'en tient pas compte.
  singleLineLabel: {
    letterSpacing: 0,
  },
  disabledLabel: {
    color: AppColors.textMuted,
  },
});
