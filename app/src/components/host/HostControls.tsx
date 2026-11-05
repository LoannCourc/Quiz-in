import type { HideableBluff } from '@shared/bluff';
import type { HostControls as AvailableControls } from '@shared/hostEngine';
import type { SoundSettings } from '@shared/types';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { SoundSettingsSection } from '@/components/host/settings/SoundSettingsSection';
import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Barre pleine largeur en bas de l'écran, dans le pied d'écran (qui réserve sa place sous le
// contenu) : elle ouvre le panneau des contrôles de l'hôte.
// compact : l'hôte dessine, la barre laisse la place au dessin.
export function HostControlsBar({ onPress, isCompact = false }: { onPress: () => void; isCompact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.bar, isCompact && styles.barCompact, pressed && styles.pressed]}>
      <ButtonLabel style={[styles.barText, isCompact && styles.barTextCompact]}>{strings.hostControls.open}</ButtonLabel>
    </Pressable>
  );
}

export interface HostActions {
  skip: () => void;
  pause: () => void;
  resume: () => void;
  end: () => void;
  changeGame: () => void;
  quit: () => void;
  showTv: () => void;
  cancelDraw: () => void;
}

interface HostControlsPanelProps {
  controls: AvailableControls;
  actions: HostActions;
  // Faux sur le web : pas de Cast.
  canShowTv: boolean;
  // Son de la TV, réglable à tout moment (le panneau reste ouvert).
  sound: SoundSettings;
  onSoundChange: (sound: SoundSettings) => void;
  // Bluff, vote et révélation : bluffs que l'hôte peut masquer, sans leurs auteurs (le panneau reste ouvert).
  hideableBluffs?: HideableBluff[];
  onToggleBluff?: (choiceIndex: number, hidden: boolean) => void;
  onClose: () => void;
}

// Panneau du bas, par-dessus l'écran : Passer (libellé explicite), Pause / Reprendre, Terminer ;
// en fin de partie, Changer de jeu / Quitter ; Afficher sur la TV (reconnexion du Cast) ; son de la TV. Chaque action ferme le
// panneau, sauf les réglages du son. Appui en dehors : fermeture sans action. Le contenu défile sur un petit écran.
export function HostControlsPanel(props: HostControlsPanelProps) {
  const { controls, actions, canShowTv, sound, onSoundChange, hideableBluffs = [], onToggleBluff, onClose } = props;
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel={strings.hostControls.close} style={styles.backdrop} onPress={onClose} />
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        <Text style={[textStyles.label, styles.centered]}>{strings.hostControls.title}</Text>
        {controls.skip && (
          <BigButton
            label={
              controls.awaitingNext ? strings.hostControls.next[controls.awaitingNext] : strings.hostControls.skip[controls.skip]
            }
            onPress={run(actions.skip)}
          />
        )}
        {controls.canCancelDraw && (
          <BigButton label={strings.hostControls.cancelDraw} variant="secondary" onPress={run(actions.cancelDraw)} />
        )}
        {controls.canPause && <BigButton label={strings.hostControls.pause} variant="secondary" onPress={run(actions.pause)} />}
        {controls.canResume && <BigButton label={strings.hostControls.resume} onPress={run(actions.resume)} />}
        {controls.canEnd && <BigButton label={strings.hostControls.end} variant="secondary" onPress={run(actions.end)} />}
        {controls.canChangeGame && <BigButton label={strings.hostControls.changeGame} onPress={run(actions.changeGame)} />}
        {controls.canChangeGame && <BigButton label={strings.hostControls.quit} variant="secondary" onPress={run(actions.quit)} />}
        {canShowTv && <BigButton label={strings.cast.showButton} variant="secondary" onPress={run(actions.showTv)} />}
        {hideableBluffs.length > 0 && onToggleBluff && <HideBluffSection bluffs={hideableBluffs} onToggle={onToggleBluff} />}
        <SoundSettingsSection sound={sound} onChange={onSoundChange} />
        <BigButton label={strings.hostControls.close} variant="secondary" onPress={onClose} />
      </ScrollView>
    </View>
  );
}

// Accès discret, replié par défaut : seulement si un bluff pose problème. Le texte, jamais qui l'a écrit.
function HideBluffSection({ bluffs, onToggle }: { bluffs: HideableBluff[]; onToggle: (choiceIndex: number, hidden: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const texts = strings.hostControls.hideBluff;
  return (
    <View style={styles.hideBluffs}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setIsOpen((open) => !open)} hitSlop={8}>
        <Text style={[textStyles.muted, styles.centered, styles.hideBluffsLink]}>{isOpen ? texts.close : texts.open}</Text>
      </Pressable>
      {isOpen && <Text style={textStyles.muted}>{texts.hint}</Text>}
      {isOpen &&
        bluffs.map((bluff) => (
          <View key={bluff.choiceIndex} style={styles.hideBluff}>
            <Text style={[styles.hideBluffText, bluff.hidden && styles.hideBluffHidden]}>{bluff.text}</Text>
            <BigButton
              label={bluff.hidden ? texts.show : texts.hide}
              variant="secondary"
              size="compact"
              onPress={() => onToggle(bluff.choiceIndex, !bluff.hidden)}
            />
          </View>
        ))}
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
  barCompact: {
    minHeight: AppSizes.hostBarCompactHeight,
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
  barTextCompact: {
    fontSize: 14,
  },
  hideBluffs: {
    gap: Spacing.two,
  },
  hideBluffsLink: {
    textDecorationLine: 'underline',
  },
  hideBluff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  hideBluffText: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
  // Masqué : barré chez l'hôte (lui seul le voit encore).
  hideBluffHidden: {
    color: AppColors.textMuted,
    textDecorationLine: 'line-through',
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
    flexGrow: 0,
    maxHeight: '92%',
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  sheetContent: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
});
