import { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

import { URGENT_THRESHOLD_S, usePulse, useRemainingFraction, useSecondsLeft, type PhaseTiming } from './phaseTiming';

interface CountdownProps extends PhaseTiming {
  size?: number;
}

// Décompte plein écran (3-2-1). Nouvelle clé dès que la phase change ou que sa fin est
// recalculée (reprise après une pause) : le décompte repart avec les nouvelles valeurs.
export function Countdown(props: CountdownProps) {
  return <CountdownRing key={`${props.phaseStartedAt}-${props.phaseEndsAt}`} {...props} />;
}

// Anneau rose qui se vide dans le sens inverse des aiguilles d'une montre, chiffre au centre.
// Deux moitiés d'anneau, chacune dans une demi-boîte qui coupe ce qui dépasse, tournent pour
// découvrir l'arc rose : moitié droite pour les premiers 50 % restants, moitié gauche au-delà.
function CountdownRing({ size = AppSizes.ringSize, ...timingProps }: CountdownProps) {
  // Objet stable : les effets ne redémarrent pas à chaque rendu du parent.
  const [timing] = useState<PhaseTiming>(timingProps);
  const seconds = useSecondsLeft(timing);
  const fraction = useRemainingFraction(timing);
  const pulse = usePulse(seconds > 0 && seconds <= URGENT_THRESHOLD_S);

  // Les côtés colorés d'une bordure couvrent 90° chacun, centrés sur leur direction :
  // +45° aligne la demi-bordure colorée sur une moitié exacte du cercle.
  const rightRotate = fraction.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-135deg', '45deg', '45deg'] });
  const leftRotate = fraction.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-135deg', '-135deg', '45deg'] });

  const circle = { width: size, height: size, borderRadius: size / 2, borderWidth: AppSizes.ringWidth };
  const half = { width: size / 2, height: size };

  return (
    <View style={[styles.ring, { width: size, height: size }]} accessibilityLabel={strings.game.secondsLeft(seconds)}>
      <View style={[styles.track, circle]} />
      <View style={[styles.half, half, { left: size / 2 }]}>
        <Animated.View
          style={[styles.rightArc, circle, { left: -size / 2, transform: [{ rotate: rightRotate }] }]}
        />
      </View>
      <View style={[styles.half, half, { left: 0 }]}>
        <Animated.View style={[styles.leftArc, circle, { transform: [{ rotate: leftRotate }] }]} />
      </View>
      <View style={[styles.center, { inset: AppSizes.ringWidth, borderRadius: size / 2 }]}>
        <Animated.Text style={[styles.seconds, { fontSize: size * 0.4, transform: [{ scale: pulse }] }]}>
          {seconds}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignSelf: 'center',
  },
  track: {
    position: 'absolute',
    borderColor: AppColors.ringTrack,
  },
  half: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  rightArc: {
    position: 'absolute',
    top: 0,
    borderTopColor: AppColors.ring,
    borderRightColor: AppColors.ring,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  leftArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderBottomColor: AppColors.ring,
    borderLeftColor: AppColors.ring,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  seconds: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontVariant: ['tabular-nums'],
  },
});
