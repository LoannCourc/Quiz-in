import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions } from 'react-native';

import { AppColors } from '@/constants/appTheme';

const FALL_DURATION_MS = 3_200;
const PIECE_WIDTH = 12;
const PIECE_HEIGHT = 24;

// 14 morceaux : position horizontale (%), départ décalé (part de la durée), tours effectués.
const PIECES = [
  { left: 4, start: 0, turns: 1.5 },
  { left: 11, start: 0.12, turns: -1 },
  { left: 18, start: 0.05, turns: 2 },
  { left: 26, start: 0.2, turns: -1.5 },
  { left: 33, start: 0.08, turns: 1 },
  { left: 41, start: 0.24, turns: -2 },
  { left: 48, start: 0.02, turns: 1.5 },
  { left: 55, start: 0.16, turns: -1 },
  { left: 62, start: 0.06, turns: 2 },
  { left: 70, start: 0.22, turns: -1.5 },
  { left: 77, start: 0.1, turns: 1 },
  { left: 84, start: 0.18, turns: -2 },
  { left: 90, start: 0.04, turns: 1.5 },
  { left: 95, start: 0.14, turns: -1 },
] as const;

// Une seule chute, une seule valeur animée de 0 à 1 par le pilote natif (Android) : chaque
// morceau en dérive sa descente, sa rotation et son opacité (transform et opacity seulement,
// aucun calcul JavaScript par image). Par-dessus le contenu, sans bloquer les touches.
// À monter une fois par événement (bonne réponse, fin de partie), avec une clé propre.
export function Confetti() {
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const fall = Animated.timing(progress, {
      toValue: 1,
      duration: FALL_DURATION_MS,
      easing: Easing.in(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    });
    fall.start();
    return () => fall.stop();
  }, [progress]);

  return (
    <Animated.View pointerEvents="none" style={styles.overlay}>
      {PIECES.map(({ left, start, turns }, index) => {
        const translateY = progress.interpolate({
          inputRange: [start, 1],
          outputRange: [-PIECE_HEIGHT * 2, height + PIECE_HEIGHT],
          extrapolate: 'clamp',
        });
        const rotate = progress.interpolate({
          inputRange: [start, 1],
          outputRange: ['0deg', `${turns * 360}deg`],
          extrapolate: 'clamp',
        });
        // Invisible avant son départ, puis s'efface en fin de chute.
        const opacity = progress.interpolate({
          inputRange: [0, start, start + 0.01, 0.85, 1],
          outputRange: [0, 0, 1, 1, 0],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.piece,
              {
                left: `${left}%`,
                backgroundColor: AppColors.confetti[index % AppColors.confetti.length],
                opacity,
                transform: [{ translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    width: PIECE_WIDTH,
    height: PIECE_HEIGHT,
    borderRadius: 3,
  },
});
