import { Platform, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { Logo } from '@/components/ui/Logo';
import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const TITLE_SIZE = 20;

// En-tête des écrans « Rejoindre une partie » (maquette J2, J3) : flèche de retour ronde dans l'appli
// seulement, puis le titre en or. Site des joueurs : le logo au-dessus, sans flèche (rien où revenir).
export function JoinTopBar() {
  const isApp = Platform.OS !== 'web';
  return (
    <View style={styles.block}>
      {!isApp && <Logo size="small" align="start" />}
      <View style={styles.row}>
        {isApp && (
          <BackButton label={strings.join.back} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {strings.join.topTitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: {
    ...TEXT_FIT_SAFETY,
    flexShrink: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
});
