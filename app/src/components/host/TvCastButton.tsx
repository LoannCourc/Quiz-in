import { StyleSheet } from 'react-native';
import { CastButton } from 'react-native-google-cast';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';

// Icône Cast native : ouvre la liste des TV et montre l'état de connexion. Elle doit être à
// l'écran pour que « Afficher sur la TV » (showCastDialog) fonctionne sur Android.
export function TvCastButton() {
  return <CastButton style={styles.button} tintColor={AppColors.text} accessibilityLabel={strings.cast.iconLabel} />;
}

const styles = StyleSheet.create({
  button: {
    width: AppSizes.castIconSize,
    height: AppSizes.castIconSize,
  },
});
