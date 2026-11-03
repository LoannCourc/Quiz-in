import type { BadgeId } from '@shared/badges';
import { PRIVACY_URL } from '@shared/constants';
import { HOME_COMPACT_BELOW_HEIGHT, homeBlockGap, homeTileDensity, type HomeTileDensity } from '@shared/homeLayout';
import { isValidRoomCode } from '@shared/roomCode';
import { Link, Redirect, router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BADGES_HOME_BUTTON_SIZE, BadgesHomeButton } from '@/components/badges/BadgesHomeButton';
import { BadgeNotice } from '@/components/badges/LazyBadges';
import { SupportAppDialog } from '@/components/badges/SupportAppDialog';
import { SupportHomeButton } from '@/components/badges/SupportHomeButton';
import { HomeView } from '@/components/host/home/HomeView';
import { BigButton } from '@/components/ui/BigButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useDrawEnabled } from '@/hooks/useDrawEnabled';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
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
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<BadgeId[]>([]);
  const [badgesReloadKey, setBadgesReloadKey] = useState(0);
  const resumeButton = resumableCode && (
    <BigButton
      label={strings.catalog.resumeGame(resumableCode)}
      size="compact"
      singleLine
      onPress={() => router.push({ pathname: '/host/[code]', params: { code: resumableCode } })}
    />
  );

  // Jamais de défilement (aussi avec « Reprendre la partie » ou le choix du prochain jeu, à la place du titre) :
  // les tuiles prennent la hauteur restante, mesurée ; densité d'après cette hauteur et la police du système,
  // jusqu'aux tuiles minimales (shared/homeLayout.ts). Les liens du bas restent toujours visibles.
  // Clavier ouvert sur un autre écran (/join, l'accueil reste monté dessous) : la place du clavier est
  // retirée de l'accueil aussi ; ces mesures-là sont ignorées (avant : l'accueil passait en défilement, tuiles
  // agrandies, et y restait au retour).
  const { height, fontScale } = useWindowDimensions();
  const isKeyboardOpen = useKeyboardInset() > 0;
  const sizeKey = `${height}|${fontScale}`;
  const [measured, setMeasured] = useState<{ sizeKey: string; density: HomeTileDensity } | null>(null);
  const density = measured?.sizeKey === sizeKey ? measured.density : 'normal';
  const fit = {
    density,
    gap: homeBlockGap(height),
    isCompact: height < HOME_COMPACT_BELOW_HEIGHT,
    onGridHeight: (gridHeight: number) => {
      const fitted = homeTileDensity(gridHeight, fontScale);
      if (fitted !== null && !isKeyboardOpen) setMeasured({ sizeKey, density: fitted });
    },
  };

  return (
    <View style={styles.fill}>
      <Screen scrollable={false}>
        <HomeView
          onOpenGame={(game) => openGame(game, room)}
          onJoinWithCode={room ? undefined : () => router.push('/join')}
          banner={room ? <RoomBanner code={room} /> : resumeButton}
          isBlindTestEnabled={isBlindTestEnabled === true}
          isDrawEnabled={isDrawEnabled !== false}
          fit={fit}
          headerAction={
            <View style={styles.headerButtons}>
              <SupportHomeButton onPress={() => setIsSupportOpen(true)} />
              {/* Badge débloqué ici : trophée remonté, sa pastille est relue. */}
              <BadgesHomeButton key={badgesReloadKey} />
            </View>
          }
        />

        <View style={styles.footerLinks}>
          <Link href="/about" style={styles.footerLink}>
            {strings.about.link}
          </Link>
          <Text accessibilityRole="link" onPress={openPrivacy} style={styles.footerLink}>
            {strings.about.privacyShortLink}
          </Text>
        </View>
        {/* Démos : en développement seulement (absentes de l'APK publié), en haut, à gauche du trophée des badges,
            hors de la mise en page : l'accueil a exactement la même disposition que dans le build publié. */}
        {__DEV__ && <DemosLink />}
      </Screen>
      <SupportAppDialog
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onUnlocked={(badges) => {
          setUnlocked(badges);
          setBadgesReloadKey((key) => key + 1);
        }}
      />
      <BadgeNotice badges={unlocked} delayMs={SUPPORT_NOTICE_DELAY_MS} onDismiss={() => setUnlocked([])} />
    </View>
  );
}

// Notification d'un badge débloqué depuis la fenêtre « Soutenir » : après la disparition de celle-ci.
const SUPPORT_NOTICE_DELAY_MS = 400;
const HEADER_BUTTONS_GAP = Spacing.two;

const DEMOS: readonly { href: Href; label: string }[] = [
  { href: '/debug/catalog', label: strings.catalog.demoCatalogLink },
  { href: '/debug/player', label: strings.catalog.playerDemoLink },
];

// « Démos » ouvre une feuille avec les démos de développement.
function DemosLink() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Text accessibilityRole="link" onPress={() => setIsOpen(true)} style={[styles.footerLink, styles.demosLink]}>
        {strings.catalog.demosLink}
      </Text>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={strings.catalog.demosTitle}>
        {DEMOS.map((demo) => (
          <BigButton
            key={demo.label}
            label={demo.label}
            variant="secondary"
            size="compact"
            onPress={() => {
              setIsOpen(false);
              router.push(demo.href);
            }}
          />
        ))}
      </BottomSheet>
    </>
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
  fill: {
    flex: 1,
  },
  // Cœur « Soutenir » puis trophée des badges.
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEADER_BUTTONS_GAP,
  },
  roomBanner: {
    gap: Spacing.two,
  },
  roomText: {
    textAlign: 'center',
  },
  // À propos et Confidentialité sur une ligne.
  footerLinks: {
    marginTop: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.four,
  },
  demosLink: {
    position: 'absolute',
    top: 0,
    right: 2 * BADGES_HOME_BUTTON_SIZE + HEADER_BUTTONS_GAP + Spacing.three,
  },
  footerLink: {
    paddingVertical: Spacing.two,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
