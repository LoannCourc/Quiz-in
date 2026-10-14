import { PRIVACY_URL } from '@shared/constants';
import { HOME_COMPACT_BELOW_HEIGHT, homeBlockGap, homeTileDensity } from '@shared/homeLayout';
import { isValidRoomCode } from '@shared/roomCode';
import { Link, Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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

  // Sans défilement (aucun bandeau en haut) : les tuiles prennent la hauteur restante, mesurée ; densité
  // d'après cette hauteur et la police du système. Rien ne tient lisiblement : défilement, jusqu'au prochain
  // changement de taille de fenêtre ou de police.
  const { height, fontScale } = useWindowDimensions();
  const sizeKey = `${height}|${fontScale}`;
  const [measured, setMeasured] = useState<{ sizeKey: string; gridHeight: number } | null>(null);
  const gridHeight = measured?.sizeKey === sizeKey ? measured.gridHeight : null;
  const density = gridHeight === null ? 'normal' : homeTileDensity(gridHeight, fontScale);
  const fit =
    !room && !resumableCode && density !== null
      ? { density, gap: homeBlockGap(height), isCompact: height < HOME_COMPACT_BELOW_HEIGHT, onGridHeight: (measuredHeight: number) => setMeasured({ sizeKey, gridHeight: measuredHeight }) }
      : undefined;

  return (
    <Screen scrollable={fit === undefined}>
      <HomeView
        onOpenGame={(game) => openGame(game, room)}
        onJoinWithCode={room ? undefined : () => router.push('/join')}
        banner={room ? <RoomBanner code={room} /> : resumeButton}
        isBlindTestEnabled={isBlindTestEnabled === true}
        isDrawEnabled={isDrawEnabled !== false}
        fit={fit}
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
  // À propos et Confidentialité sur une ligne (démos de développement : une seconde ligne).
  footerLinks: {
    marginTop: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.four,
  },
  footerLink: {
    paddingVertical: Spacing.two,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  debugLink: {
    paddingVertical: Spacing.two,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
