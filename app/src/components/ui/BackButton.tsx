import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { AppColors } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const SIZE = 44;

// Retour par défaut : l'écran précédent, sinon l'accueil (lien direct, app relancée). Au salon et pendant une
// partie en cours, l'écran de l'hôte intercepte ce retour et demande confirmation (useLeaveGuard).
export function goBackOrHome(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Flèche retour ronde en haut à gauche (style de « Rejoindre une partie ») : 44 points, zone de toucher
// élargie, pour ceux qui n'utilisent pas le geste ou le bouton retour du téléphone.
export function BackButton({ onPress = goBackOrHome, label = strings.back }: { onPress?: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={Spacing.two} onPress={onPress} style={styles.button}>
      <View style={styles.icon}>
        <SettingsIcon name="chevron" color={AppColors.text} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
  },
  // Le chevron du réglage pointe vers la droite : retourné pour « retour ».
  icon: {
    transform: [{ rotate: '180deg' }],
  },
});
