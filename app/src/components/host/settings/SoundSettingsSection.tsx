import { SOUND_VOLUME_STEPS } from '@shared/sound';
import type { SoundSettings } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { SettingTile } from './SettingTile';

interface SoundSettingsSectionProps {
  sound: SoundSettings;
  onChange: (sound: SoundSettings) => void;
}

// Son de la TV (spec 17) : interrupteurs Musique et Effets, puis volume général en cinq crans.
// Même section dans la feuille des réglages (avant la partie) et dans le panneau de l'hôte (pendant).
export function SoundSettingsSection({ sound, onChange }: SoundSettingsSectionProps) {
  const { sound: texts } = strings;
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{texts.sectionLabel}</Text>
      <View style={styles.grid}>
        <SettingTile
          icon="music"
          title={texts.music.title}
          hint={texts.music.hint}
          state={sound.music ? 'active' : 'idle'}
          role="checkbox"
          onPress={() => onChange({ ...sound, music: !sound.music })}
        />
        <SettingTile
          icon="speaker"
          title={texts.effects.title}
          hint={texts.effects.hint}
          state={sound.effects ? 'active' : 'idle'}
          role="checkbox"
          onPress={() => onChange({ ...sound, effects: !sound.effects })}
        />
      </View>
      <VolumeBars volume={sound.volume} isMuted={!sound.music && !sound.effects} onChange={(volume) => onChange({ ...sound, volume })} />
    </View>
  );
}

interface VolumeBarsProps {
  volume: number;
  // Musique et effets coupés : le volume reste réglable, mais apparaît en retrait.
  isMuted: boolean;
  onChange: (volume: number) => void;
}

// Cinq barres de plus en plus hautes : un appui choisit le cran ; les lecteurs d'écran le règlent
// comme un curseur (monter, baisser).
function VolumeBars({ volume, isMuted, onChange }: VolumeBarsProps) {
  const index = Math.max(0, SOUND_VOLUME_STEPS.findIndex((step) => step >= volume));
  const stepTo = (next: number) => onChange(SOUND_VOLUME_STEPS[Math.max(0, Math.min(SOUND_VOLUME_STEPS.length - 1, next))]);
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={strings.sound.volumeA11y}
      accessibilityValue={{ min: 0, max: 100, now: volume, text: strings.sound.volumeValue(volume) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => stepTo(index + (event.nativeEvent.actionName === 'increment' ? 1 : -1))}
      style={[styles.volume, isMuted && styles.muted]}>
      <Text style={styles.volumeLabel}>{strings.sound.volumeLabel}</Text>
      <View style={styles.bars}>
        {SOUND_VOLUME_STEPS.map((step, stepIndex) => (
          <Pressable
            key={step}
            onPress={() => onChange(step)}
            hitSlop={{ top: 8, bottom: 8 }}
            importantForAccessibility="no"
            style={styles.barSlot}>
            <View
              style={[
                styles.bar,
                { height: BAR_MIN_HEIGHT + stepIndex * BAR_HEIGHT_STEP },
                stepIndex <= index ? styles.barOn : styles.barOff,
              ]}
            />
          </Pressable>
        ))}
      </View>
      <Text style={styles.volumeValue}>{volume}</Text>
    </View>
  );
}

const BAR_MIN_HEIGHT = 10;
const BAR_HEIGHT_STEP = 6;

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  label: {
    marginTop: Spacing.one,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  volume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.tileIdle,
  },
  muted: {
    opacity: 0.55,
  },
  volumeLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  barSlot: {
    height: BAR_MIN_HEIGHT + 4 * BAR_HEIGHT_STEP,
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  barOn: {
    backgroundColor: AppColors.accent,
  },
  barOff: {
    backgroundColor: AppColors.chipBorder,
  },
  volumeValue: {
    ...TEXT_FIT_SAFETY,
    minWidth: 32,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
    textAlign: 'right',
  },
});
