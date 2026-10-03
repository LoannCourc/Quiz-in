import type { HostControls as AvailableControls } from '@shared/hostEngine';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const BUTTON_SIZE = 56;

// Petit bouton rond et discret du pied d'écran : il ouvre le panneau des contrôles sans gêner
// les réponses (le pied d'écran réserve sa place sous le contenu).
export function HostControlsButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.hostControls.title}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.buttonText}>{strings.hostControls.open}</Text>
    </Pressable>
  );
}

export interface HostActions {
  skip: () => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
}

interface HostControlsPanelProps {
  controls: AvailableControls;
  actions: HostActions;
  onClose: () => void;
}

// Panneau du bas, par-dessus l'écran : Passer (libellé explicite), Pause / Reprendre, Terminer.
// Chaque action ferme le panneau. Appui en dehors : fermeture sans action.
export function HostControlsPanel({ controls, actions, onClose }: HostControlsPanelProps) {
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel={strings.hostControls.close} style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={[textStyles.label, styles.centered]}>{strings.hostControls.title}</Text>
        {controls.skip && <BigButton label={strings.hostControls.skip[controls.skip]} onPress={run(actions.skip)} />}
        {controls.canPause && <BigButton label={strings.hostControls.pause} variant="secondary" onPress={run(actions.pause)} />}
        {controls.canResume && <BigButton label={strings.hostControls.resume} onPress={run(actions.resume)} />}
        {controls.canEnd && <BigButton label={strings.hostControls.end} variant="secondary" onPress={run(actions.end)} />}
        <BigButton label={strings.hostControls.close} variant="secondary" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.surface,
    backgroundColor: AppColors.inkSurface,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: AppColors.backdrop,
  },
  sheet: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  centered: {
    textAlign: 'center',
  },
});
