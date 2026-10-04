import { Pressable, StyleSheet, Text } from 'react-native';

import { TvCastButton } from '@/components/host/TvCastButton';
import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { CastGame } from '@/hooks/useCastGame';

// « Afficher sur la TV » (spec 4.1) : la pilule ouvre la liste des TV via showCastDialog, qui exige
// l'icône Cast native à l'écran : elle est donc dans la pilule. Une fois la TV connectée, la pilule
// passe au second plan (« TV connectée ») ; un appui rouvre la liste pour changer ou déconnecter.
export function TvCastPill({ cast }: { cast: CastGame }) {
  const isConnected = cast.isTvConnected;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={cast.showTvPicker}
      style={({ pressed }) => [styles.pill, isConnected ? styles.connected : styles.idle, pressed && styles.pressed]}>
      <TvCastButton />
      <Text style={styles.label}>{isConnected ? strings.cast.connectedButton : strings.cast.showButton}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: AppSizes.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    borderRadius: AppSizes.radiusPill,
    boxShadow: AppShadows.hard,
  },
  idle: {
    backgroundColor: AppColors.highlight,
  },
  connected: {
    backgroundColor: AppColors.surface,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
});
