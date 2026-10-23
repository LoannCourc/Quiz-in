import type { BadgeId } from '@shared/badges';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { byImportance, type BadgeInfo } from '@/lib/badgeTexts';

import { TrophyArt } from './BadgeArt';
import { UltimateTrophyView } from './BadgeVisuals';

const texts = strings.trophies;
const VISIBLE_MS = 6_000;
const ENTER_MS = 250;
const ENTER_OFFSET = -24;
const CARD_TROPHY_WIDTH = 34;
const CELEBRATION_TROPHY_WIDTH = 120;
function openBadges() {
  router.push('/badges');
}

interface BadgeUnlockedToastProps {
  badges: readonly BadgeId[];
  // Attente avant l'apparition (0 : tout de suite).
  delayMs: number;
  onDismiss: () => void;
}

// Badges débloqués (maquette G2) : un badge ultime (troisième palier) ouvre d'abord la fenêtre de célébration ;
// les autres (ou ceux qui restent après « Continuer ») arrivent dans une carte en haut de l'écran, qui ne
// bloque rien, mène à « Mes badges » au toucher et disparaît seule après 6 s.
export function BadgeUnlockedToast({ badges, delayMs, onDismiss }: BadgeUnlockedToastProps) {
  const [isDue, setIsDue] = useState(delayMs === 0);
  const [isCelebrationClosed, setIsCelebrationClosed] = useState(false);
  const hasBadges = badges.length > 0;
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!hasBadges || delayMs === 0) return;
    const timer = setTimeout(() => setIsDue(true), delayMs);
    return () => clearTimeout(timer);
  }, [hasBadges, delayMs]);

  if (!hasBadges || !isDue) return null;
  const ordered = byImportance(badges);
  const ultimate = ordered[0].ultimate ? ordered[0] : null;
  if (ultimate && !isCelebrationClosed) {
    return (
      <Celebration
        badge={ultimate}
        onContinue={() => (ordered.length > 1 ? setIsCelebrationClosed(true) : dismiss.current())}
        onSeeBadges={() => {
          dismiss.current();
          openBadges();
        }}
      />
    );
  }
  const rest = ultimate ? ordered.slice(1) : ordered;
  return rest.length > 0 ? <NoticeCard badges={rest} onDismiss={() => dismiss.current()} /> : null;
}

// Carte « Nouveau badge » : entre depuis le haut (fondu, 250 ms ; immobile si « réduire les animations »).
function NoticeCard({ badges, onDismiss }: { badges: readonly BadgeInfo[]; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));
  const close = useRef(onDismiss);
  useEffect(() => {
    close.current = onDismiss;
  });

  useEffect(() => {
    let isActive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((isReduced) => {
      if (isActive) Animated.timing(progress, { toValue: 1, duration: isReduced ? 0 : ENTER_MS, useNativeDriver: true }).start();
    });
    const timer = setTimeout(() => close.current(), VISIBLE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [progress]);

  const [first] = badges;
  const kicker = badges.length === 1 ? texts.newBadge : texts.newBadges(badges.length);
  const subtitle = badges.length > 1 ? `${first.goal}${texts.andMore(badges.length - 1)}` : first.goal;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [ENTER_OFFSET, 0] });
  return (
    <Animated.View style={[styles.layer, { top: insets.top + Spacing.two, opacity: progress, transform: [{ translateY }] }]}>
      <Pressable
        onPress={() => {
          onDismiss();
          openBadges();
        }}
        accessibilityRole="button"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${kicker}. ${first.title}. ${subtitle}`}
        accessibilityHint={texts.openBadges}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <TrophyArt tier={first.shape} emblem={first.emblem} isUnlocked width={CARD_TROPHY_WIDTH} />
        <View style={styles.cardTexts}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {first.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <SettingsIcon name="chevron" color={AppColors.onBadge} />
      </Pressable>
    </Animated.View>
  );
}

interface CelebrationProps {
  badge: BadgeInfo;
  onContinue: () => void;
  onSeeBadges: () => void;
}

// Fenêtre « Badge ultime débloqué » (maquette G2) : le trophée entre (0,6 → 1, léger rebond), puis brille.
function Celebration({ badge, onContinue, onSeeBadges }: CelebrationProps) {
  return (
    <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <View style={styles.celebration} accessibilityViewIsModal>
          <Text style={styles.celebrationKicker}>{texts.ultimateKicker}</Text>
          <UltimateTrophyView emblem={badge.emblem} width={CELEBRATION_TROPHY_WIDTH} active withEntrance />
          <Text style={styles.celebrationTitle} accessibilityRole="header">
            {badge.ultimate?.title}
          </Text>
          <Text style={styles.celebrationTagline}>{badge.ultimate?.tagline}</Text>
          <Pressable accessibilityRole="button" onPress={onSeeBadges} style={({ pressed }) => [styles.seeBadges, pressed && styles.pressed]}>
            <Text style={styles.seeBadgesLabel}>{texts.seeBadges}</Text>
          </Pressable>
          <Text accessibilityRole="button" onPress={onContinue} style={styles.continue}>
            {texts.continue}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const CELEBRATION_TITLE_SIZE = 24;

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.badgeNotice,
    boxShadow: AppShadows.hard,
  },
  pressed: {
    opacity: 0.85,
  },
  cardTexts: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    color: AppColors.onBadge,
    fontFamily: AppFonts.black,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    ...TEXT_FIT_SAFETY,
  },
  cardTitle: {
    color: AppColors.onBadge,
    fontFamily: AppFonts.black,
    fontSize: 18,
    ...TEXT_FIT_SAFETY,
  },
  cardSubtitle: {
    color: AppColors.onBadge,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: AppColors.backdrop,
  },
  celebration: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: AppSizes.radiusCard,
    borderWidth: 3,
    borderColor: AppColors.badgeCelebrationBorder,
    backgroundColor: AppColors.badgeCelebrationPanel,
  },
  celebrationKicker: {
    color: AppColors.badgeCelebrationBorder,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  celebrationTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: CELEBRATION_TITLE_SIZE,
    lineHeight: Math.round(CELEBRATION_TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
  },
  celebrationTagline: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: AppSizes.textBody,
    textAlign: 'center',
  },
  seeBadges: {
    alignSelf: 'stretch',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.badgeNotice,
  },
  seeBadgesLabel: {
    color: AppColors.onBadge,
    fontFamily: AppFonts.black,
    fontSize: 17,
    textAlign: 'center',
    ...TEXT_FIT_SAFETY,
  },
  continue: {
    paddingVertical: Spacing.two,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
});
