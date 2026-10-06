import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Série (spec 18) sur l'écran de résultat : badge flamme avec le nombre, puis « Série de 4 ! ». Sans son.
// Le badge arrive avec un petit rebond (transform seulement).
export function StreakNotice({ streak }: { streak: number }) {
  const [scale] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animation = Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: Platform.OS !== 'web' });
    animation.start();
    return () => animation.stop();
  }, [scale]);

  return (
    <View style={styles.row} accessible accessibilityLabel={strings.game.streak.badge(streak)}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <StreakFlame streak={streak} size={FLAME_SIZE} />
      </Animated.View>
      <Text style={styles.text}>{strings.game.streak.notice(streak)}</Text>
    </View>
  );
}

const FLAME_SIZE = 48;
const NOTICE_FONT_SIZE = 20;

// Flamme : deux gouttes (carré arrondi sauf un coin, tourné de 45° pour que la pointe monte), rose puis
// or, le nombre à l'encre dans la goutte or. Dessinée en View, comme sur la TV en CSS.
export function StreakFlame({ streak, size }: { streak: number; size: number }) {
  const outer = size * 0.72;
  const inner = size * 0.5;
  return (
    <View style={{ width: size * 0.86, height: size }}>
      <View style={[styles.drop, dropShape(outer), { backgroundColor: AppColors.streakOuter, bottom: size * 0.05, marginLeft: -outer / 2 }]} />
      <View style={[styles.drop, dropShape(inner), { backgroundColor: AppColors.streakInner, bottom: size * 0.12, marginLeft: -inner / 2 }]} />
      <Text
        style={[
          styles.count,
          { fontSize: size * (streak >= 10 ? 0.27 : 0.34), lineHeight: Math.round(size * 0.42), bottom: size * 0.14 },
        ]}>
        {streak}
      </Text>
    </View>
  );
}

function dropShape(side: number) {
  return { width: side, height: side, borderRadius: side / 2, borderTopRightRadius: 0 };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.two,
  },
  drop: {
    position: 'absolute',
    left: '50%',
    transform: [{ rotate: '-45deg' }],
  },
  count: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: AppColors.onStreak,
    fontFamily: AppFonts.display,
    textAlign: 'center',
  },
  text: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: NOTICE_FONT_SIZE,
    lineHeight: Math.round(NOTICE_FONT_SIZE * DISPLAY_LINE_HEIGHT),
  },
});
