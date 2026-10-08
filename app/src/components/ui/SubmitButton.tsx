import { Pressable, StyleSheet } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

import { ButtonLabel } from './ButtonLabel';

const LABEL_SIZE = 18;

interface SubmitButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

// Bouton d'envoi des réponses écrites (maquette S1 : Quiz et Blind test en saisie libre, Bluff, Dessine-moi) :
// pilule or de 58 points, ombre encre décalée de 5. Désactivé : comme BigButton (pilule translucide).
// Posé en bas de la colonne : Screen le garde au-dessus du clavier (useKeyboardInset).
export function SubmitButton({ label, onPress, disabled = false }: SubmitButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <ButtonLabel style={[styles.label, disabled && styles.disabledLabel]}>{label}</ButtonLabel>
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
  disabledLabel: {
    color: AppColors.textMuted,
  },
});
