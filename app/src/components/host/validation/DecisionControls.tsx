import { Pressable, StyleSheet, View } from 'react-native';

import { MarkIcon } from '@/components/ui/MarkIcon';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

// Interrupteur ✓ / ✕ d'une réponse (ou d'une partie en « both ») : moitié verte si acceptée, rose si
// refusée. Le signe accompagne toujours la couleur.
export function DecisionToggle({ accepted, onChange, label }: { accepted: boolean; onChange: (accepted: boolean) => void; label: string }) {
  const { accept, refuse } = strings.hostValidation;
  return (
    <View style={styles.toggle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${accept}`}
        accessibilityState={{ selected: accepted }}
        onPress={() => onChange(true)}
        style={[styles.half, accepted && styles.acceptOn]}>
        <MarkIcon kind="check" size={18} color={accepted ? AppColors.ink : AppColors.textMuted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${refuse}`}
        accessibilityState={{ selected: !accepted }}
        onPress={() => onChange(false)}
        style={[styles.half, !accepted && styles.refuseOn]}>
        <MarkIcon kind="cross" size={18} color={accepted ? AppColors.textMuted : AppColors.ink} />
      </Pressable>
    </View>
  );
}

// Œil : appui pour masquer (œil barré, rose) ou afficher la réponse sur la TV. Désactivé pour une
// réponse filtrée (mot interdit), toujours masquée.
export function EyeToggle({ hidden, onToggle, disabled }: { hidden: boolean; onToggle: () => void; disabled: boolean }) {
  const { hide, show, filtered } = strings.hostValidation;
  const color = hidden ? AppColors.highlight : AppColors.textMuted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={disabled ? filtered : hidden ? show : hide}
      accessibilityState={{ disabled, selected: hidden }}
      disabled={disabled}
      onPress={onToggle}
      hitSlop={8}
      style={styles.eyeButton}>
      <View style={[styles.eye, { borderColor: color }]}>
        <View style={[styles.pupil, { backgroundColor: color }]} />
      </View>
      {hidden && <View style={[styles.slash, { backgroundColor: color }]} />}
    </Pressable>
  );
}

const TOGGLE_HEIGHT = 38;
const HALF_WIDTH = 40;

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    overflow: 'hidden',
  },
  half: {
    width: HALF_WIDTH,
    height: TOGGLE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptOn: {
    backgroundColor: AppColors.correct,
  },
  refuseOn: {
    backgroundColor: AppColors.choices[0],
  },
  eyeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    width: 24,
    height: 14,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slash: {
    position: 'absolute',
    width: 28,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-35deg' }],
  },
});
