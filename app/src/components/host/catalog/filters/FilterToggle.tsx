import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface FilterToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const KNOB = 24;
const KNOB_INSET = (TRACK_HEIGHT - KNOB) / 2;

// Interrupteur de la maquette QT1, dessiné (le Switch natif ne permet ni ces couleurs ni ce rond partout) :
// actif, piste or et rond encre à droite ; inactif, piste gris-violet et rond blanc à gauche. Toute la ligne
// se touche (48 de haut) ; le lecteur d'écran l'annonce comme un interrupteur, avec son état.
export function FilterToggle({ label, value, onChange }: FilterToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  label: {
    flexShrink: 1,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: AppColors.accent,
  },
  trackOff: {
    backgroundColor: AppColors.toggleOffTrack,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
  },
  knobOn: {
    alignSelf: 'flex-end',
    marginRight: KNOB_INSET,
    backgroundColor: AppColors.onAccent,
  },
  knobOff: {
    alignSelf: 'flex-start',
    marginLeft: KNOB_INSET,
    backgroundColor: AppColors.toggleOffKnob,
  },
});
