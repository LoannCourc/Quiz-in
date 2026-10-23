import { useEffect, type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Rect, Stop, SvgXml } from 'react-native-svg';

import { GOLD_PARTS, goldBaseXml, TROPHY_VIEWBOX, trophyHeight, trophyXml } from '../BadgeArt';
import type { EmblemName } from '../badgeSvgSources';
import { ULTIMATE_MOTION, type IconMotion } from '../iconMotions';

// Animations des badges (Reanimated, sur le fil de l'interface) : chargé à la demande par lib/badgeMotion.ts,
// seulement dans l'écran « Mes badges » et la fenêtre de célébration. « Réduire les animations » du système :
// tout reste immobile. active faux (carte hors de l'écran, écran quitté, app en arrière-plan) : boucles arrêtées.

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const TWO_PI = Math.PI * 2;

// Étincelle : opacité 0 → 1 → 0 et échelle 0,3 → 1 → 0,3 sur une boucle.
function twinkle(progress: number) {
  'worklet';
  const wave = (1 - Math.cos(TWO_PI * progress)) / 2;
  return { opacity: wave, transform: [{ scale: 0.3 + 0.7 * wave }] };
}

// Boucle 0 → 1 (linéaire) tant qu'elle est active ; remise à 0 sinon.
function useLoop(durationMs: number, isRunning: boolean, delayMs = 0): SharedValue<number> {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (!isRunning) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(delayMs, withRepeat(withTiming(1, { duration: durationMs, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(progress);
  }, [progress, durationMs, isRunning, delayMs]);
  return progress;
}

const ORIGINS: Record<NonNullable<IconMotion['origin']>, ViewStyle['transformOrigin']> = {
  bottom: 'bottom',
  top: 'top',
  bottomLeft: 'left bottom',
};

// Icône de catégorie ou de badge unique qui bouge doucement (mouvements validés, iconMotions.ts).
export function MovingIcon({ motion, active, children }: { motion: IconMotion; active: boolean; children: ReactNode }) {
  const isReduced = useReducedMotion();
  const progress = useLoop(motion.durationMs, active && !isReduced);
  const { kind, amount } = motion;
  const style = useAnimatedStyle(() => {
    // wave : 0 → 1 → 0 en douceur ; swing : 0 → 1 → 0 → -1 → 0.
    const wave = (1 - Math.cos(TWO_PI * progress.value)) / 2;
    const swing = Math.sin(TWO_PI * progress.value);
    switch (kind) {
      case 'scale':
        return { transform: [{ scale: 1 + amount * wave }] };
      case 'rotate':
        return { transform: [{ rotate: `${amount * swing}deg` }] };
      case 'up':
        return { transform: [{ translateY: -amount * wave }] };
      case 'sideways':
        return { transform: [{ translateX: amount * swing }] };
      case 'diagonal':
        return { transform: [{ translateX: amount * wave }, { translateY: amount * wave }] };
      case 'flicker':
        return { transform: [{ scaleY: 1 + 0.1 * wave }, { rotate: `${amount * swing}deg` }] };
    }
  });
  return <Animated.View style={[motion.origin && { transformOrigin: ORIGINS[motion.origin] }, style]}>{children}</Animated.View>;
}

interface UltimateTrophyProps {
  emblem: EmblemName;
  width: number;
  active: boolean;
  // Fenêtre de célébration : entrée de 0,6 à 1 avec un léger rebond.
  withEntrance?: boolean;
}

// Trophée ultime : le dessin du pack sans ses éléments animés, puis par-dessus, dans le même viewBox, le reflet
// découpé à la forme de la coupe et les deux étincelles. L'étoile du dessus reste fixe (dans le dessin).
export function UltimateTrophy({ emblem, width, active, withEntrance = false }: UltimateTrophyProps) {
  const isReduced = useReducedMotion();
  const isRunning = active && !isReduced;
  const height = trophyHeight(width);
  const scale = width / TROPHY_VIEWBOX.width;

  const float = useLoop(ULTIMATE_MOTION.floatMs, isRunning);
  const sparkle = useLoop(ULTIMATE_MOTION.sparkleMs, isRunning);
  const shineX = useSharedValue<number>(GOLD_PARTS.shineFrom);
  const entrance = useSharedValue(withEntrance && !isReduced ? ULTIMATE_MOTION.entranceFrom : 1);

  useEffect(() => {
    if (!isRunning) {
      cancelAnimation(shineX);
      shineX.value = GOLD_PARTS.shineFrom;
      return;
    }
    const sweepMs = ULTIMATE_MOTION.shineCycleMs * ULTIMATE_MOTION.shineSweepShare;
    const pauseMs = ULTIMATE_MOTION.shineCycleMs - sweepMs;
    shineX.value = GOLD_PARTS.shineFrom;
    shineX.value = withRepeat(
      withSequence(
        withTiming(GOLD_PARTS.shineTo, { duration: sweepMs, easing: Easing.inOut(Easing.quad) }),
        withTiming(GOLD_PARTS.shineFrom, { duration: 0 }),
        withDelay(pauseMs, withTiming(GOLD_PARTS.shineFrom, { duration: 0 })),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(shineX);
  }, [isRunning, shineX]);

  useEffect(() => {
    if (!withEntrance || isReduced) return;
    entrance.value = withTiming(1, { duration: ULTIMATE_MOTION.entranceMs, easing: Easing.out(Easing.back(1.6)) });
  }, [withEntrance, isReduced, entrance]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -ULTIMATE_MOTION.floatPx * ((1 - Math.cos(TWO_PI * float.value)) / 2) }, { scale: entrance.value }],
  }));
  const shineProps = useAnimatedProps(() => ({ x: GOLD_PARTS.shine.x + shineX.value }));
  // Seconde étincelle décalée d'une demi-boucle (0,6 s).
  const firstSparkle = useAnimatedStyle(() => twinkle(sparkle.value));
  const secondSparkle = useAnimatedStyle(() => twinkle(sparkle.value + 0.5));
  const sparkleStyles = [firstSparkle, secondSparkle];

  // Immobile (réduire les animations, hors de l'écran) : le dessin complet du pack, reflet et étincelles compris.
  if (!isRunning) {
    return (
      <Animated.View style={[{ width, height }, bodyStyle]}>
        <SvgXml xml={trophyXml('gold', emblem)} width={width} height={height} />
      </Animated.View>
    );
  }

  const viewBox = `0 ${-6} ${TROPHY_VIEWBOX.width} ${TROPHY_VIEWBOX.height}`;
  const { shine } = GOLD_PARTS;
  return (
    <Animated.View style={[{ width, height }, bodyStyle]}>
      <SvgXml xml={goldBaseXml(emblem)} width={width} height={height} />
      <Svg style={StyleSheet.absoluteFill} width={width} height={height} viewBox={viewBox}>
        <Defs>
          <LinearGradient id="ultimate-shine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#fff" stopOpacity="0" />
            <Stop offset=".5" stopColor="#fff" stopOpacity=".85" />
            <Stop offset="1" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
          <ClipPath id="ultimate-cup">
            <Path d={GOLD_PARTS.cupClip} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#ultimate-cup)">
          <AnimatedRect animatedProps={shineProps} y={shine.y} width={shine.width} height={shine.height} fill="url(#ultimate-shine)" transform={`skewX(${shine.skewX})`} />
        </G>
      </Svg>
      {GOLD_PARTS.sparkles.map((sparklePart, index) => (
        <Animated.View
          key={sparklePart.path}
          style={[
            styles.sparkle,
            {
              left: sparklePart.box.x * scale,
              top: (sparklePart.box.y + 6) * scale,
              width: sparklePart.box.size * scale,
              height: sparklePart.box.size * scale,
            },
            sparkleStyles[index],
          ]}>
          <Svg width="100%" height="100%" viewBox={`${sparklePart.box.x} ${sparklePart.box.y} ${sparklePart.box.size} ${sparklePart.box.size}`}>
            <Path d={sparklePart.path} fill="#fff" />
          </Svg>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
