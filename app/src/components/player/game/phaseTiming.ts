import { useEffect, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';

// Temps d'une phase, partagé par l'anneau (décompte 3-2-1) et la barre de temps (questions).
// Tout se calcule sur l'heure du serveur (phaseEndsAt et décalage d'horloge).

// Dernières secondes : le chiffre pulse (une demi-pulsation dure PULSE_HALF_MS).
export const URGENT_THRESHOLD_S = 5;
const PULSE_SCALE = 1.12;
const PULSE_HALF_MS = 250;

export interface PhaseTiming {
  phaseStartedAt: number;
  phaseEndsAt: number;
  // Décalage entre l'horloge du téléphone et celle du serveur (.info/serverTimeOffset).
  serverOffsetMs: number;
}

function remainingMs({ phaseEndsAt, serverOffsetMs }: PhaseTiming): number {
  return Math.max(0, phaseEndsAt - (Date.now() + serverOffsetMs));
}

// Secondes restantes. Un seul rendu par seconde : le prochain est programmé au moment exact
// où le chiffre change.
export function useSecondsLeft(timing: PhaseTiming): number {
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
export function useRemainingFraction(timing: PhaseTiming): Animated.Value {
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
export function usePulse(isActive: boolean): Animated.Value {
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
