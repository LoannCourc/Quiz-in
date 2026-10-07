import { Link, Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HomeView } from '@/components/host/home/HomeView';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { AppColors } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useResumableGame } from '@/hooks/useResumableGame';
import { isPublishedWeb } from '@/lib/platform';

// Accueil de l'hôte (choix du jeu). Sur le site des joueurs (web publié), redirige vers la saisie du code.
export default function HomeRoute() {
  return isPublishedWeb ? <Redirect href="/join" /> : <HomeScreen />;
}

function openGame(game: GameType) {
  router.push({ pathname: '/catalog/[gameType]', params: { gameType: game } });
}

function HomeScreen() {
  const resumableCode = useResumableGame();
  const isBlindTestEnabled = useBlindTestEnabled();
  const resumeButton = resumableCode && (
    <BigButton
      label={strings.catalog.resumeGame(resumableCode)}
      onPress={() => router.push({ pathname: '/host/[code]', params: { code: resumableCode } })}
    />
  );

  return (
    <Screen>
      <HomeView onOpenGame={openGame} banner={resumeButton} isBlindTestEnabled={isBlindTestEnabled} />

      <View style={styles.footerLinks}>
        <Link href="/about" style={styles.footerLink}>
          {strings.about.link}
        </Link>
        {/* Démos : en développement seulement (absentes de l'APK publié). */}
        {__DEV__ && (
          <>
          <Link href="/debug/catalog" style={styles.debugLink}>
            {strings.catalog.demoCatalogLink}
          </Link>
          <Link href="/debug/player" style={styles.debugLink}>
            {strings.catalog.playerDemoLink}
          </Link>
          <Link href="/debug/counter" style={styles.debugLink}>
            {strings.catalog.debugLink}
          </Link>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerLinks: {
    marginTop: 'auto',
  },
  footerLink: {
    paddingVertical: Spacing.three,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  debugLink: {
    paddingVertical: Spacing.three,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
