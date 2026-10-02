import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const URGENT_THRESHOLD_S = 5;

export interface PhaseTiming {
  phaseStartedAt: number;
  phaseEndsAt: number;
  // Décalage entre l'horloge du téléphone et celle du serveur (.info/serverTimeOffset).
  serverOffsetMs: number;
}

interface CountdownProps extends PhaseTiming {
  variant?: 'bar' | 'digits';
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

// Barre qui se vide sans rendu React : l'animation est confiée à la couche native (Android).
// Sur le web, le pilote natif n'existe pas : Animated met alors à jour le style directement.
function useDrainingProgress(timing: PhaseTiming): Animated.Value {
  const durationMs = Math.max(1, timing.phaseEndsAt - timing.phaseStartedAt);
  const [progress] = useState(() => new Animated.Value(remainingMs(timing) / durationMs));

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: remainingMs(timing),
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [progress, timing]);

  return progress;
}

// Nouvelle clé dès que la phase change ou que sa fin est recalculée (reprise après une pause) :
// le compte à rebours repart alors de zéro avec les nouvelles valeurs.
export function Countdown(props: CountdownProps) {
  return <TimedCountdown key={`${props.phaseStartedAt}-${props.phaseEndsAt}`} {...props} />;
}

function TimedCountdown({ variant = 'bar', ...timingProps }: CountdownProps) {
  // Objet stable : les effets ne redémarrent pas à chaque rendu du parent.
  const [timing] = useState<PhaseTiming>(timingProps);
  const seconds = useSecondsLeft(timing);
  const progress = useDrainingProgress(timing);
  const isUrgent = seconds <= URGENT_THRESHOLD_S;
  const color = isUrgent ? AppColors.wrong : AppColors.accent;

  if (variant === 'digits') {
    return (
      <Text style={[styles.digits, { color: AppColors.accent }]} accessibilityLabel={strings.game.secondsLeft(seconds)}>
        {seconds}
      </Text>
    );
  }

  return (
    <View style={styles.row} accessibilityLabel={strings.game.secondsLeft(seconds)}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color, transform: [{ scaleX: progress }] }]} />
      </View>
      <Text style={[styles.seconds, { color }]}>{seconds}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  track: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: AppColors.surface,
  },
  fill: {
    height: '100%',
    transformOrigin: 'left',
  },
  seconds: {
    minWidth: 48,
    textAlign: 'right',
    fontSize: AppSizes.textTitle,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  digits: {
    fontSize: AppSizes.textHuge * 2,
    fontWeight: '900',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
