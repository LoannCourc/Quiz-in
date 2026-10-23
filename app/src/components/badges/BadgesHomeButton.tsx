import { unseenCount } from '@shared/badges';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { loadBadges } from '@/lib/badgeStore';

import { BadgeEmblem } from './LazyBadges';

export const BADGES_HOME_BUTTON_SIZE = 48;
const ICON_SIZE = 24;

// Accueil (maquette G3) : trophée jaune dans l'en-tête ; pastille seulement s'il y a des badges débloqués
// pas encore vus (relue au retour sur l'accueil, effacée par l'ouverture de « Mes badges », qu'il ouvre).
export function BadgesHomeButton() {
  const [unseen, setUnseen] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      void loadBadges().then((parsed) => {
        if (isActive) setUnseen(unseenCount(parsed.state));
      });
      return () => {
        isActive = false;
      };
    }, []),
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.trophies.homeButton(unseen)}
      onPress={() => router.push('/badges')}
      hitSlop={6}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <BadgeEmblem name="parties-gagnees" size={ICON_SIZE} />
      {unseen > 0 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{unseen}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BADGES_HOME_BUTTON_SIZE,
    height: BADGES_HOME_BUTTON_SIZE,
    borderRadius: BADGES_HOME_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.badgeHomeButton,
  },
  pressed: {
    opacity: 0.8,
  },
  counter: {
    position: 'absolute',
    top: -8,
    right: -10,
    minWidth: 26,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: AppColors.onBadge,
    alignItems: 'center',
    backgroundColor: AppColors.badgeCounter,
  },
  counterText: {
    color: AppColors.onBadge,
    fontFamily: AppFonts.black,
    fontSize: 13,
    ...TEXT_FIT_SAFETY,
  },
});
