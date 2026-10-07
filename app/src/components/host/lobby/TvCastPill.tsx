import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { TvCastButton } from '@/components/host/TvCastButton';
import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { CastGame } from '@/hooks/useCastGame';

// « Afficher sur la TV » (spec 4.1) : la pilule ouvre la liste des TV via showCastDialog, qui exige
// l'icône Cast native à l'écran : elle est donc dans la pilule. Une fois la TV connectée, la barre
// « TV connectée » (TvConnectedBar) remplace la pilule.
export function TvCastPill({ cast }: { cast: CastGame }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={cast.showTvPicker}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
      <TvCastButton />
      <ButtonLabel inRow style={styles.label}>{strings.cast.showButton}</ButtonLabel>
      {/* Vide de la largeur de l'icône, à droite : le texte reste centré dans la pilule. */}
      {HAS_CAST_ICON && <View style={styles.iconMirror} />}
    </Pressable>
  );
}

// Web : pas d'icône Cast (TvCastButton.web.tsx).
const HAS_CAST_ICON = Platform.OS !== 'web';

const styles = StyleSheet.create({
  pill: {
    minHeight: AppSizes.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.highlight,
    boxShadow: AppShadows.hard,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  iconMirror: {
    width: AppSizes.castIconSize,
  },
  label: {
    color: AppColors.onHighlight,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
});
