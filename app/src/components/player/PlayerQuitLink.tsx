import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { confirmAction } from '@/lib/confirm';

const texts = strings.game.quit;

// Lien discret « Quitter la partie » du joueur, dans l'appli seulement (sur le site des joueurs, l'onglet
// se ferme) : après confirmation, retour à l'accueil. Le joueur reste inscrit et revient avec le code.
// `showOnWeb` : démo dans le navigateur seulement.
export function PlayerQuitLink({ code, showOnWeb = false }: { code: string; showOnWeb?: boolean }) {
  if (Platform.OS === 'web' && !showOnWeb) return null;

  function quit() {
    confirmAction({ title: texts.title, message: texts.message(code), confirm: texts.confirm, cancel: texts.cancel }, () => router.dismissTo('/'));
  }

  return (
    <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={quit} style={styles.button}>
      <Text style={styles.link}>{texts.link}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
