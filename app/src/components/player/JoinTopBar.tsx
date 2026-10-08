import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { Logo } from '@/components/ui/Logo';
import { AppColors, AppFonts, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const TITLE_SIZE = 20;
const BACK_SIZE = 44;

// Appli : retour à l'écran précédent, sinon à l'accueil de l'hôte.
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// En-tête des écrans « Rejoindre une partie » (maquette J2, J3) : flèche de retour ronde dans l'appli
// seulement, puis le titre en or. Site des joueurs : le logo au-dessus, sans flèche (rien où revenir).
export function JoinTopBar() {
  const isApp = Platform.OS !== 'web';
  return (
    <View style={styles.block}>
      {!isApp && <Logo size="small" align="start" />}
      <View style={styles.row}>
        {isApp && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.join.back}
            hitSlop={Spacing.one}
            onPress={goBack}
            style={styles.back}>
            <View style={styles.backIcon}>
              <SettingsIcon name="chevron" color={AppColors.text} />
            </View>
          </Pressable>
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
  back: {
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: BACK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
  },
  // Le chevron du réglage pointe vers la droite : retourné pour « retour ».
  backIcon: {
    transform: [{ rotate: '180deg' }],
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
