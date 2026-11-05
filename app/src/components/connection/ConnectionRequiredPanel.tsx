import { useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { useEntrance, useLoop, useReduceMotion } from '@/components/ui/motion';
import { AppColors, AppFonts, AppShadows, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const texts = strings.connection;
const CIRCLE_SIZE = 96;
const CIRCLE_BORDER = 6;
const ICON_SIZE = 56;

// Wi-Fi barré, dessiné : trois arcs (le haut de cercles), un point, et une barre de la couleur du cercle qui les coupe.
function NoWifiIcon() {
  return (
    <View style={styles.icon}>
      {[52, 34, 16].map((size) => (
        <View key={size} style={[styles.arc, { width: size, height: size, borderRadius: size / 2, left: (ICON_SIZE - size) / 2, top: 34 - size / 2 }]} />
      ))}
      <View style={styles.dot} />
      <View style={styles.cut} />
    </View>
  );
}

interface ConnectionRequiredPanelProps {
  // « Réessayer » : vrai si le réseau est revenu (le panneau se ferme alors tout seul).
  onRetry: () => Promise<boolean>;
  // Absent : lien masqué (site des joueurs).
  onOpenSettings?: () => void;
}

// Fenêtre par-dessus tout l'écran, qui reste visible, assombri, dessous. Rien n'est démonté : la partie reprend où elle
// en était dès que le réseau revient. Modal : passe au-dessus du clavier et des autres feuilles.
export function ConnectionRequiredPanel({ onRetry, onOpenSettings }: ConnectionRequiredPanelProps) {
  const isAnimated = !useReduceMotion();
  const [isChecking, setIsChecking] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const pop = useEntrance({ durationMs: 550, isAnimated, easing: Easing.linear });
  const sway = useLoop({ durationMs: 2_400, isAnimated });
  const scale = pop.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.6, 1.06, 1] });
  const rotate = sway.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: ['0deg', '4deg', '-4deg', '0deg'] });

  async function retry() {
    if (isChecking) return;
    setIsChecking(true);
    setHasFailed(false);
    const isBack = await onRetry();
    setIsChecking(false);
    setHasFailed(!isBack);
  }

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => undefined}>
      <View style={[styles.backdrop, WEB_BLUR]}>
        <Animated.View style={[styles.window, { opacity: pop, transform: [{ scale }] }]} accessibilityRole="alert">
          <Animated.View style={[styles.circle, { transform: [{ rotate }] }]}>
            <NoWifiIcon />
          </Animated.View>
          <Text style={styles.title}>{texts.title}</Text>
          <Text style={styles.text}>{texts.text}</Text>
          <BigButton label={texts.retry} onPress={() => void retry()} />
          <View style={styles.statusLine}>
            {isChecking && <ActivityIndicator color={AppColors.connectionInk} />}
            {hasFailed && !isChecking && <Text style={styles.failed}>{texts.stillOffline}</Text>}
          </View>
          {onOpenSettings && (
            <Pressable accessibilityRole="link" hitSlop={10} onPress={onOpenSettings}>
              <Text style={styles.link}>{texts.openSettings}</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// Léger flou de l'écran dessous : sur le web seulement (sur téléphone, il faudrait une dépendance native).
const WEB_BLUR = Platform.OS === 'web' ? ({ backdropFilter: 'blur(4px)' } as ViewStyle) : null;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: AppColors.connectionBackdrop,
  },
  window: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: CIRCLE_SIZE / 2 + Spacing.two,
    paddingBottom: Spacing.three,
    borderRadius: 36,
    backgroundColor: AppColors.card,
    boxShadow: AppShadows.hard,
  },
  circle: {
    position: 'absolute',
    alignSelf: 'center',
    top: -CIRCLE_SIZE / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: CIRCLE_BORDER,
    borderColor: AppColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.connectionCircle,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    overflow: 'hidden',
  },
  arc: {
    position: 'absolute',
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: AppColors.connectionInk,
  },
  dot: {
    position: 'absolute',
    left: ICON_SIZE / 2 - 5,
    top: 38,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.connectionInk,
  },
  cut: {
    position: 'absolute',
    left: ICON_SIZE / 2 - 3,
    top: -2,
    width: 6,
    height: ICON_SIZE + 4,
    borderRadius: 3,
    backgroundColor: AppColors.connectionCircle,
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    color: AppColors.connectionInk,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: Math.round(26 * DISPLAY_LINE_HEIGHT * 0.8),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  text: {
    marginBottom: Spacing.two,
    color: AppColors.connectionText,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textAlign: 'center',
  },
  statusLine: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failed: {
    color: AppColors.connectionFailed,
    fontFamily: AppFonts.black,
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: AppColors.connectionLink,
    fontFamily: AppFonts.black,
    fontSize: 15,
    textAlign: 'center',
  },
});
