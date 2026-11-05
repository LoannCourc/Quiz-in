import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useEntrance, useLoop } from '@/components/ui/motion';
import { AppColors, AppSizes } from '@/constants/appTheme';

export interface CoinCenter {
  x: number;
  y: number;
}

const FULL_TURN_DEG = 360;

// Rayons de lumière : éventail de triangles, pointes au centre de la pièce, un tour en 18 s.
const RAY_COUNT = 10;
const RAY_LENGTH = 1100;
const RAY_HALF_WIDTH = 120;
const RAY_TURN_MS = 18_000;

export function CelebrationRays({ center }: { center: CoinCenter }) {
  const turn = useLoop({ durationMs: RAY_TURN_MS, isAnimated: true });
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${FULL_TURN_DEG}deg`] });
  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.origin, { left: center.x, top: center.y, transform: [{ rotate }] }]}>
        {Array.from({ length: RAY_COUNT }, (_, index) => (
          <View key={index} style={[styles.ray, { transform: [{ rotate: `${(index * FULL_TURN_DEG) / RAY_COUNT}deg` }] }]} />
        ))}
      </Animated.View>
    </View>
  );
}

// Éclat : 16 morceaux (ronds et carrés) vers 8 directions, depuis le centre de la pièce.
const BURST_MS = 1_400;
const BURST_DIRECTIONS = 8;
const BURST_NEAR = 0.62;
const BURST_PIECE = 11;

function BurstPiece({ index, progress, reach }: { index: number; progress: Animated.Value; reach: number }) {
  const angle = ((index % BURST_DIRECTIONS) / BURST_DIRECTIONS) * 2 * Math.PI + (index >= BURST_DIRECTIONS ? 0.2 : 0);
  const distance = index >= BURST_DIRECTIONS ? reach * BURST_NEAR : reach;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${index % 2 === 0 ? 300 : -300}deg`] });
  const opacity = progress.interpolate({ inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const isRound = index % 2 === 0;
  return (
    <Animated.View
      style={[
        styles.burstPiece,
        isRound && styles.round,
        { backgroundColor: AppColors.celebrationPieces[index % AppColors.celebrationPieces.length], opacity, transform: [{ translateX }, { translateY }, { rotate }] },
      ]}
    />
  );
}

// Confettis lents, en continu, en haut de l'écran.
const SLOW_PIECES = [
  { left: 8, delayMs: 0 },
  { left: 22, delayMs: 2_100 },
  { left: 37, delayMs: 900 },
  { left: 52, delayMs: 3_000 },
  { left: 66, delayMs: 1_500 },
  { left: 80, delayMs: 2_600 },
  { left: 92, delayMs: 500 },
] as const;
const SLOW_FALL_MS = 4_200;
const SLOW_FALL_DISTANCE = 240;

function SlowPiece({ left, delayMs, index }: { left: number; delayMs: number; index: number }) {
  const fall = useLoop({ delayMs, durationMs: SLOW_FALL_MS, isAnimated: true });
  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-20, SLOW_FALL_DISTANCE] });
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${index % 2 === 0 ? 220 : -220}deg`] });
  const opacity = fall.interpolate({ inputRange: [0, 0.1, 0.65, 1], outputRange: [0, 0.8, 0.8, 0] });
  return (
    <Animated.View
      style={[
        styles.slowPiece,
        { left: `${left}%`, backgroundColor: AppColors.celebrationPieces[index % AppColors.celebrationPieces.length], opacity, transform: [{ translateY }, { rotate }] },
      ]}
    />
  );
}

// Étoiles : 6 emplacements autour de la pièce, en décalé ; elles grossissent en tournant puis disparaissent.
const STAR_SPOTS = [
  { angle: -150, reach: 1.1, delayMs: 300, size: 18 },
  { angle: -35, reach: 1.15, delayMs: 800, size: 24 },
  { angle: 25, reach: 1.1, delayMs: 1_500, size: 14 },
  { angle: 150, reach: 1.15, delayMs: 1_100, size: 20 },
  { angle: 70, reach: 1.2, delayMs: 2_000, size: 12 },
  { angle: -95, reach: 1.25, delayMs: 1_700, size: 14 },
] as const;
const STAR_MS = 1_800;
const STAR_REST_MS = 900;

function Star({ angle, reach, delayMs, size, radius }: { angle: number; reach: number; delayMs: number; size: number; radius: number }) {
  const twinkle = useLoop({ delayMs, durationMs: STAR_MS, restMs: STAR_REST_MS, isAnimated: true });
  const scale = twinkle.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  const rotate = twinkle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '120deg'] });
  const radians = (angle * Math.PI) / 180;
  const side = size * 0.72;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: Math.cos(radians) * radius * reach,
        top: Math.sin(radians) * radius * reach,
        transform: [{ scale }, { rotate }],
      }}>
      {/* Étoile à quatre branches : deux losanges fins, dessinés (les polices du design n'ont pas ✦). */}
      <View style={[styles.starArm, { width: side, height: side, marginLeft: -side / 2, marginTop: -side / 2, transform: [{ scaleX: 0.28 }, { rotate: '45deg' }] }]} />
      <View style={[styles.starArm, { width: side, height: side, marginLeft: -side / 2, marginTop: -side / 2, transform: [{ scaleY: 0.28 }, { rotate: '45deg' }] }]} />
    </Animated.View>
  );
}

// Par-dessus l'écran, sans jamais bloquer une touche : éclat, confettis lents et étoiles.
export function CelebrationPieces({ center }: { center: CoinCenter }) {
  const { width } = useWindowDimensions();
  const burst = useEntrance({ delayMs: 250, durationMs: BURST_MS, isAnimated: true, easing: Easing.out(Easing.quad) });
  const radius = AppSizes.coinSize / 2;
  const reach = Math.min(width * 0.62, radius * 1.9);
  return (
    <View pointerEvents="none" style={styles.layer}>
      {SLOW_PIECES.map((piece, index) => (
        <SlowPiece key={index} {...piece} index={index} />
      ))}
      <View style={[styles.origin, { left: center.x, top: center.y }]}>
        {Array.from({ length: BURST_DIRECTIONS * 2 }, (_, index) => (
          <BurstPiece key={index} index={index} progress={burst} reach={reach} />
        ))}
        {STAR_SPOTS.map((spot, index) => (
          <Star key={index} {...spot} radius={radius} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  origin: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  ray: {
    position: 'absolute',
    left: -RAY_HALF_WIDTH,
    top: -RAY_LENGTH,
    width: 0,
    height: 0,
    borderLeftWidth: RAY_HALF_WIDTH,
    borderRightWidth: RAY_HALF_WIDTH,
    borderTopWidth: RAY_LENGTH,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: AppColors.celebrationRay,
    transformOrigin: '50% 100%',
  },
  burstPiece: {
    position: 'absolute',
    left: -BURST_PIECE / 2,
    top: -BURST_PIECE / 2,
    width: BURST_PIECE,
    height: BURST_PIECE,
    borderRadius: 2,
  },
  round: {
    borderRadius: BURST_PIECE / 2,
  },
  slowPiece: {
    position: 'absolute',
    top: 0,
    width: 9,
    height: 14,
    borderRadius: 2,
  },
  starArm: {
    position: 'absolute',
    backgroundColor: AppColors.celebrationStar,
  },
});
