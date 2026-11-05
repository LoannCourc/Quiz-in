import { countUpValue } from '@shared/countUp';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Text, type StyleProp, type TextStyle } from 'react-native';

// Animations des écrans de jeu : Animated de React Native avec le pilote natif (transform et opacity seulement, aucune
// image calculée en JavaScript sur le téléphone), qui marche aussi sur le site des joueurs. Tout est coupé avec le
// réglage « réduire les animations » du téléphone (prefers-reduced-motion sur le web).
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function useReduceMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    let isActive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (isActive) setIsReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduced);
    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);
  return isReduced;
}

interface EntranceOptions {
  delayMs?: number;
  durationMs: number;
  isAnimated: boolean;
  easing?: (value: number) => number;
}

// Valeur de 0 à 1, jouée une fois au montage ; aussitôt à 1 sans animation.
export function useEntrance({ delayMs = 0, durationMs, isAnimated, easing = Easing.out(Easing.cubic) }: EntranceOptions): Animated.Value {
  const [value] = useState(() => new Animated.Value(isAnimated ? 0 : 1));
  useEffect(() => {
    if (!isAnimated) {
      value.stopAnimation();
      value.setValue(1);
      return;
    }
    const animation = Animated.timing(value, { toValue: 1, delay: delayMs, duration: durationMs, easing, useNativeDriver: USE_NATIVE_DRIVER });
    animation.start();
    return () => animation.stop();
  }, [value, isAnimated, delayMs, durationMs, easing]);
  return value;
}

interface LoopOptions {
  delayMs?: number;
  durationMs: number;
  isAnimated: boolean;
  // Silence après chaque tour (le temps de l'animation reste durationMs).
  restMs?: number;
}

// Valeur de 0 à 1 en boucle sans fin, arrêtée au démontage ; reste à 0 sans animation.
export function useLoop({ delayMs = 0, durationMs, isAnimated, restMs = 0 }: LoopOptions): Animated.Value {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!isAnimated) {
      value.stopAnimation();
      value.setValue(0);
      return;
    }
    const turn = Animated.timing(value, { toValue: 1, duration: durationMs, easing: Easing.linear, useNativeDriver: USE_NATIVE_DRIVER });
    const loop = Animated.loop(restMs > 0 ? Animated.sequence([turn, Animated.delay(restMs)]) : turn);
    const run = delayMs > 0 ? Animated.sequence([Animated.delay(delayMs), loop]) : loop;
    run.start();
    return () => run.stop();
  }, [value, isAnimated, delayMs, durationMs, restMs]);
  return value;
}

// Échelle d'un « pop » : 0,3 → 1,12 → 1.
export function popScale(value: Animated.Value): Animated.AnimatedInterpolation<number> {
  return value.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.3, 1.12, 1] });
}

const COUNT_FRAME_MS = 33;

interface CountUpTextProps {
  to: number;
  from?: number;
  delayMs?: number;
  durationMs: number;
  isAnimated: boolean;
  format: (value: number) => string;
  style?: StyleProp<TextStyle>;
}

// Nombre qui monte : seul ce texte se redessine, une trentaine de fois par seconde. La valeur finale reste celle
// annoncée au lecteur d'écran.
export function CountUpText({ to, from = 0, delayMs = 0, durationMs, isAnimated, format, style }: CountUpTextProps) {
  const [shown, setShown] = useState(from);
  useEffect(() => {
    if (!isAnimated) return;
    const startedAt = Date.now() + delayMs;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 0) return;
      setShown(countUpValue(from, to, elapsed, durationMs));
      if (elapsed >= durationMs) clearInterval(timer);
    }, COUNT_FRAME_MS);
    return () => clearInterval(timer);
  }, [from, to, delayMs, durationMs, isAnimated]);
  return (
    <Text style={style} accessibilityLabel={format(to)}>
      {format(isAnimated ? shown : to)}
    </Text>
  );
}
