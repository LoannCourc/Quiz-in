import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import { ScreenBackground } from '@/components/ui/Screen';
import { AppColors } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

// Durée minimale de la page de démarrage, puis fondu.
const LAUNCH_MIN_MS = 600;
const LAUNCH_FADE_MS = 300;
const Q_SIZE = 168;
// Le Q occupe ce carré de l'image de 1024 px (splash-icon.png, aussi l'écran de démarrage natif).
const Q_IMAGE = { size: 1024, cropX: 277, cropY: 277, cropSize: 466 };
const DOT_SIZE = 14;

// Le Q seul, recadré dans l'image de l'écran de démarrage natif.
function LaunchQ() {
  const scale = Q_SIZE / Q_IMAGE.cropSize;
  return (
    <View style={styles.qBox}>
      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={{
          width: Q_IMAGE.size * scale,
          height: Q_IMAGE.size * scale,
          marginLeft: -Q_IMAGE.cropX * scale,
          marginTop: -Q_IMAGE.cropY * scale,
        }}
      />
    </View>
  );
}

// Page de démarrage : dégradé, grand Q, logo et trois points de couleur. Le logo attend sa police.
export function LaunchView({ fontsReady = true }: { fontsReady?: boolean }) {
  return (
    <ScreenBackground>
      <View style={styles.center}>
        <LaunchQ />
        <View style={styles.logoSlot}>{fontsReady && <Logo size="large" />}</View>
        <View style={styles.dots}>
          {AppColors.launchDots.map((color) => (
            <View key={color} style={[styles.dot, { backgroundColor: color }]} />
          ))}
        </View>
      </View>
    </ScreenBackground>
  );
}

// Deuxième étape du démarrage (Android) : après l'écran natif (fond uni et Q), la page de démarrage
// reste au moins 0,6 s et jusqu'au chargement des polices, puis s'efface en fondu sur l'app.
// Pas sur le site des joueurs : il s'ouvre directement.
export function LaunchOverlay({ fontsReady }: { fontsReady: boolean }) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [isDone, setIsDone] = useState(Platform.OS === 'web');
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), LAUNCH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDone || !minElapsed || !fontsReady) return;
    Animated.timing(opacity, { toValue: 0, duration: LAUNCH_FADE_MS, useNativeDriver: true }).start(() => setIsDone(true));
  }, [isDone, minElapsed, fontsReady, opacity]);

  if (isDone) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]} onLayout={() => SplashScreen.hideAsync()}>
      <LaunchView fontsReady={fontsReady} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  qBox: {
    width: Q_SIZE,
    height: Q_SIZE,
    overflow: 'hidden',
  },
  // Hauteur du logo en grand réservée avant la police : rien ne bouge quand il apparaît.
  logoSlot: {
    minHeight: 78,
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
