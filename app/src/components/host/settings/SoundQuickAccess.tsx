import type { SoundSettings } from '@shared/types';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

import { SettingsIcon } from './SettingsIcon';
import { SoundSettingsSection } from './SoundSettingsSection';

interface SoundQuickAccessProps {
  sound: SoundSettings;
  onChange: (sound: SoundSettings) => void;
}

// Salon (maquette N2) : petit bouton rond plein « Son » en haut à droite ; un appui ouvre une feuille
// avec les réglages du son de la TV (couper la musique sans recréer la partie).
export function SoundQuickAccess({ sound, onChange }: SoundQuickAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { sound: texts } = strings;
  const summary = texts.summary(sound.music, sound.effects, sound.volume);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${texts.sectionLabel} : ${summary}`}
        hitSlop={4}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <SettingsIcon name="speaker" color={AppColors.text} />
      </Pressable>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <SoundSettingsSection sound={sound} onChange={onChange} />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: AppSizes.roundIconButton,
    height: AppSizes.roundIconButton,
    borderRadius: AppSizes.roundIconButton / 2,
    justifyContent: 'center',
    alignItems: 'center',
    // Bouton plein, fond semi-transparent (maquette N2).
    backgroundColor: AppColors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
