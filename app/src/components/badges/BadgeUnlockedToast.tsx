import type { BadgeId } from '@shared/badges';
import { SUSPENSE_DRUMROLL_MS } from '@shared/sound';
import type { PublicSession } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { badgeLabel } from '@/lib/badgeTexts';

const texts = strings.trophies;
// Badges nommés dans la notification ; au-delà : « et N de plus ».
const NAMED_MAX = 3;
const VISIBLE_MS = 6_000;
const FADE_MS = 250;
// Apparition après l'arrivée sur l'écran de fin (podium et confettis d'abord) ; Suspense : après le roulement de tambour.
const END_SCREEN_FIRST_MS = 1_500;

export function badgeToastDelayMs(session: Pick<PublicSession, 'settings'>): number {
  return END_SCREEN_FIRST_MS + (session.settings.suspense ? SUSPENSE_DRUMROLL_MS : 0);
}

interface BadgeUnlockedToastProps {
  badges: readonly BadgeId[];
  // Attente avant l'apparition (écran de fin d'abord : roulement de tambour du Suspense, confettis).
  delayMs: number;
  onDismiss: () => void;
}

// Notification provisoire (avant les maquettes) : carte en haut de l'écran de fin, qui ne bloque rien (seule la
// carte reçoit les touchers ; un toucher la ferme), disparaît seule. Fondu coupé si « réduire les animations ».
export function BadgeUnlockedToast({ badges, delayMs, onDismiss }: BadgeUnlockedToastProps) {
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [isShown, setIsShown] = useState(false);
  const hasBadges = badges.length > 0;
  // Dernière fonction reçue : les minuteries ne repartent pas à chaque rendu de l'écran de fin.
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!hasBadges) return;
    let isActive = true;
    const showTimer = setTimeout(() => {
      void AccessibilityInfo.isReduceMotionEnabled().then((isReduced) => {
        if (!isActive) return;
        setIsShown(true);
        Animated.timing(opacity, { toValue: 1, duration: isReduced ? 0 : FADE_MS, useNativeDriver: true }).start();
      });
    }, delayMs);
    const hideTimer = setTimeout(() => dismiss.current(), delayMs + VISIBLE_MS);
    return () => {
      isActive = false;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [hasBadges, delayMs, opacity]);

  if (!hasBadges || !isShown) return null;
  const named = badges.slice(0, NAMED_MAX).map(badgeLabel).join(' · ');
  const rest = badges.length - NAMED_MAX;
  const title = badges.length === 1 ? texts.unlockedOne : texts.unlockedMany(badges.length);
  const detail = rest > 0 ? `${named} ${texts.andMore(rest)}` : named;
  return (
    <Animated.View pointerEvents="box-none" style={[styles.layer, { top: insets.top + Spacing.two, opacity }]}>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${title} ${detail}`}
        accessibilityHint={texts.close}
        style={styles.card}>
        <Text style={styles.title}>🏆 {title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
  },
  card: {
    maxWidth: 480,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.hardInk,
  },
  title: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textAlign: 'center',
    ...TEXT_FIT_SAFETY,
  },
  detail: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.bold,
    fontSize: AppSizes.textBody,
    textAlign: 'center',
    ...TEXT_FIT_SAFETY,
  },
});
