import { PRIVACY_URL } from '@shared/constants';
import { isValidRoomCode } from '@shared/roomCode';
import { Link, Redirect, router, useLocalSearchParams } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { HomeView } from '@/components/host/home/HomeView';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useDrawEnabled } from '@/hooks/useDrawEnabled';
import { useResumableGame } from '@/hooks/useResumableGame';
import { isPublishedWeb } from '@/lib/platform';

// Accueil de l'hôte (choix du jeu). Sur le site des joueurs (web publié), redirige vers la saisie du code.
export default function HomeRoute() {
  return isPublishedWeb ? <Redirect href="/join" /> : <HomeScreen />;
}

// room : Changer de jeu, le jeu choisi remplacera celui de cette partie (pas de nouveau salon).
function openGame(game: GameType, room: string | undefined) {
  router.push({ pathname: '/catalog/[gameType]', params: room ? { gameType: game, room } : { gameType: game } });
}

// Page du site des joueurs, ouverte dans le navigateur du téléphone.
function openPrivacy() {
  Linking.openURL(PRIVACY_URL).catch((error: unknown) => {
    if (__DEV__) console.warn('[accueil] Page de confidentialité non ouverte', error);
  });
}

function HomeScreen() {
  const params = useLocalSearchParams<{ room?: string }>();
  const room = params.room && isValidRoomCode(params.room) ? params.room : undefined;
  const resumableCode = useResumableGame();
  const isBlindTestEnabled = useBlindTestEnabled();
  const isDrawEnabled = useDrawEnabled();
  const resumeButton = resumableCode && (
    <BigButton
      label={strings.catalog.resumeGame(resumableCode)}
      size="compact"
      singleLine
      onPress={() => router.push({ pathname: '/host/[code]', params: { code: resumableCode } })}
    />
  );

  return (
    <Screen>
      <HomeView
        onOpenGame={(game) => openGame(game, room)}
        onJoinWithCode={room ? undefined : () => router.push('/join')}
        banner={room ? <RoomBanner code={room} /> : resumeButton}
        isBlindTestEnabled={isBlindTestEnabled === true}
        isDrawEnabled={isDrawEnabled !== false}
      />

      <View style={styles.footerLinks}>
        <Link href="/about" style={styles.footerLink}>
          {strings.about.link}
        </Link>
        <Text accessibilityRole="link" onPress={openPrivacy} style={styles.footerLink}>
          {strings.about.privacyShortLink}
        </Text>
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

// Changer de jeu : rappel du salon gardé ouvert, et retour à la partie sans rien changer.
function RoomBanner({ code }: { code: string }) {
  return (
    <View style={styles.roomBanner}>
      <Text style={[textStyles.body, styles.roomText]}>{strings.home.roomBanner(code)}</Text>
      <BigButton label={strings.home.roomCancel} variant="secondary" size="compact" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  roomBanner: {
    gap: Spacing.two,
  },
  roomText: {
    textAlign: 'center',
  },
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
