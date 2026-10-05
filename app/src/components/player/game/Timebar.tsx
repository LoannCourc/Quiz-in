import { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { URGENT_THRESHOLD_S, usePulse, useRemainingFraction, useSecondsLeft, type PhaseTiming } from './phaseTiming';

// Temps de jeu sur mobile : une seule ligne, le chiffre puis une barre fine qui se vide.
// Nouvelle clé dès que la phase change ou que sa fin est recalculée (reprise après une pause).
export function Timebar(props: PhaseTiming) {
  return <TimebarLine key={`${props.phaseStartedAt}-${props.phaseEndsAt}`} {...props} />;
}

// La barre rétrécit vers la gauche (scaleX animé nativement, sans rendu React par image) ;
// le chiffre ne change qu'une fois par seconde et pulse pendant les dernières secondes.
function TimebarLine(timingProps: PhaseTiming) {
  // Objet stable : les effets ne redémarrent pas à chaque rendu du parent.
  const [timing] = useState<PhaseTiming>(timingProps);
  const seconds = useSecondsLeft(timing);
  const fraction = useRemainingFraction(timing);
  const pulse = usePulse(seconds > 0 && seconds <= URGENT_THRESHOLD_S);

  return (
    <View style={styles.row} accessibilityLabel={strings.game.secondsLeft(seconds)}>
      <Animated.Text style={[styles.seconds, { transform: [{ scale: pulse }] }]}>{seconds}</Animated.Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { transform: [{ scaleX: fraction }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  seconds: {
    ...TEXT_FIT_SAFETY,
    minWidth: AppSizes.timebarDigits * 1.3,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.timebarDigits,
    lineHeight: Math.round(AppSizes.timebarDigits * DISPLAY_LINE_HEIGHT),
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: AppSizes.timebarHeight,
    borderRadius: AppSizes.timebarHeight / 2,
    overflow: 'hidden',
    backgroundColor: AppColors.timebarTrack,
  },
  fill: {
    height: '100%',
    borderRadius: AppSizes.timebarHeight / 2,
    backgroundColor: AppColors.ring,
    transformOrigin: 'left',
  },
});
