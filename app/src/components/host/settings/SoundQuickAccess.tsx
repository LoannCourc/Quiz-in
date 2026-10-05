import type { SoundSettings } from '@shared/types';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { SettingsIcon } from './SettingsIcon';
import { SoundSettingsSection } from './SoundSettingsSection';

interface SoundQuickAccessProps {
  sound: SoundSettings;
  onChange: (sound: SoundSettings) => void;
}

// Salon : ligne compacte « Son · Musique, effets · 60 › » ; un appui ouvre une petite feuille
// avec les mêmes réglages (couper la musique sans recréer la partie).
export function SoundQuickAccess({ sound, onChange }: SoundQuickAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { sound: texts } = strings;
  const summary = texts.summary(sound.music, sound.effects, sound.volume);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${texts.sectionLabel} : ${summary}`}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <SettingsIcon name="speaker" color={AppColors.link} />
        <Text style={styles.title}>{texts.quickTitle}</Text>
        <Text style={styles.summary} numberOfLines={1}>
          {summary}
        </Text>
        <SettingsIcon name="chevron" color={AppColors.link} />
      </Pressable>
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.quizSetup.settingsDone}
            style={styles.backdrop}
            onPress={() => setIsOpen(false)}
          />
          <View style={styles.sheet}>
            <SoundSettingsSection sound={sound} onChange={onChange} />
            <BigButton label={strings.quizSetup.settingsDone} onPress={() => setIsOpen(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  summary: {
    flex: 1,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
    textAlign: 'right',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: AppColors.backdrop,
  },
  sheet: {
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
});
