import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

// Dernières secondes : le chiffre pulse (une demi-pulsation dure PULSE_HALF_MS).
const URGENT_THRESHOLD_S = 5;
const PULSE_SCALE = 1.12;
const PULSE_HALF_MS = 250;

export interface PhaseTiming {
  phaseStartedAt: number;
  phaseEndsAt: number;
  // Décalage entre l'horloge du téléphone et celle du serveur (.info/serverTimeOffset).
  serverOffsetMs: number;
}

interface CountdownProps extends PhaseTiming {
  size?: number;
}

function remainingMs({ phaseEndsAt, serverOffsetMs }: PhaseTiming): number {
  return Math.max(0, phaseEndsAt - (Date.now() + serverOffsetMs));
}

// Secondes restantes. Un seul rendu par seconde : le prochain est programmé au moment exact
// où le chiffre change.
function useSecondsLeft(timing: PhaseTiming): number {
  const [seconds, setSeconds] = useState(() => Math.ceil(remainingMs(timing) / 1000));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const ms = remainingMs(timing);
      if (ms <= 0) return;
      timeoutId = setTimeout(() => {
        setSeconds(Math.ceil(remainingMs(timing) / 1000));
        scheduleNext();
      }, (ms % 1000 || 1000) + 10);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [timing]);

  return seconds;
}

// Part restante de la phase, de 1 à 0, animée sans rendu React : sur Android, l'animation est
// confiée à la couche native ; sur le web, Animated met à jour le style directement.
function useRemainingFraction(timing: PhaseTiming): Animated.Value {
  const durationMs = Math.max(1, timing.phaseEndsAt - timing.phaseStartedAt);
  const [fraction] = useState(() => new Animated.Value(remainingMs(timing) / durationMs));

  useEffect(() => {
    const animation = Animated.timing(fraction, {
      toValue: 0,
      duration: remainingMs(timing),
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [fraction, timing]);

  return fraction;
}

// Pulsation du chiffre (1 → 1,12) pendant les dernières secondes, en boucle native : lancée une
// seule fois quand l'urgence commence, sans rendu React à chaque image. Aucun changement de couleur.
function usePulse(isActive: boolean): Animated.Value {
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!isActive) return;
    const step = (toValue: number) =>
      Animated.timing(scale, {
        toValue,
        duration: PULSE_HALF_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: Platform.OS !== 'web',
      });
    const loop = Animated.loop(Animated.sequence([step(PULSE_SCALE), step(1)]));
    loop.start();
    return () => loop.stop();
  }, [isActive, scale]);

  return scale;
}

// Nouvelle clé dès que la phase change ou que sa fin est recalculée (reprise après une pause) :
// le compte à rebours repart alors de zéro avec les nouvelles valeurs.
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
