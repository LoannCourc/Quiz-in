import type { HostControls as AvailableControls } from '@shared/hostEngine';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Barre pleine largeur en bas de l'écran, dans le pied d'écran (qui réserve sa place sous le
// contenu) : elle ouvre le panneau des contrôles de l'hôte.
export function HostControlsBar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
      <Text style={styles.barText}>{strings.hostControls.open}</Text>
    </Pressable>
  );
}

export interface HostActions {
  skip: () => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  replay: () => void;
  quit: () => void;
  showTv: () => void;
}

interface HostControlsPanelProps {
  controls: AvailableControls;
  actions: HostActions;
  // Faux sur le web : pas de Cast.
  canShowTv: boolean;
  onClose: () => void;
}

// Panneau du bas, par-dessus l'écran : Passer (libellé explicite), Pause / Reprendre, Terminer ;
// en fin de partie, Rejouer / Quitter ; Afficher sur la TV (reconnexion du Cast). Chaque action ferme le panneau. Appui en dehors :
// fermeture sans action.
export function HostControlsPanel({ controls, actions, canShowTv, onClose }: HostControlsPanelProps) {
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel={strings.hostControls.close} style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={[textStyles.label, styles.centered]}>{strings.hostControls.title}</Text>
        {controls.skip && (
          <BigButton
            label={
              controls.awaitingNext ? strings.hostControls.next[controls.awaitingNext] : strings.hostControls.skip[controls.skip]
            }
            onPress={run(actions.skip)}
          />
        )}
        {controls.canPause && <BigButton label={strings.hostControls.pause} variant="secondary" onPress={run(actions.pause)} />}
        {controls.canResume && <BigButton label={strings.hostControls.resume} onPress={run(actions.resume)} />}
        {controls.canEnd && <BigButton label={strings.hostControls.end} variant="secondary" onPress={run(actions.end)} />}
        {controls.canReplay && <BigButton label={strings.hostControls.replay} onPress={run(actions.replay)} />}
        {controls.canReplay && <BigButton label={strings.hostControls.quit} variant="secondary" onPress={run(actions.quit)} />}
        {canShowTv && <BigButton label={strings.cast.showButton} variant="secondary" onPress={run(actions.showTv)} />}
        <BigButton label={strings.hostControls.close} variant="secondary" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: AppSizes.hostBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.selection,
    backgroundColor: AppColors.inkSurface,
  },
  pressed: {
    opacity: 0.8,
  },
  barText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
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
