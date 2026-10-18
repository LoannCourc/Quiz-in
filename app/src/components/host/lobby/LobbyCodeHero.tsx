import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Salon sans TV connectée (maquette « Salon de l'hôte (nouveau) ») : « CODE DE LA PARTIE », puis le code en
// très grand. Le QR code et le lien des joueurs sont dans la feuille « Inviter » (à droite de « Joueurs »).
export function LobbyCodeHero({ code }: { code: string }) {
  // Écran court (320 × 568…) : code un peu moins grand, la grille des joueurs reste à l'écran.
  const isShortScreen = useWindowDimensions().height < SHORT_SCREEN_HEIGHT;
  return (
    <View style={styles.hero}>
      <Text style={styles.label}>{strings.hostLobby.codeLabel}</Text>
      <RoomCode code={code} size={isShortScreen ? 'short' : 'hero'} />
    </View>
  );
}

// Code de la partie en lettres d'affiche, ombre dure rose adouci (salon, feuille « Inviter »).
export function RoomCode({ code, size }: { code: string; size: 'hero' | 'short' | 'sheet' }) {
  return (
    <Text style={[styles.code, size === 'short' && styles.shortCode, size === 'sheet' && styles.sheetCode]} accessibilityLabel={strings.hostLobby.codeAccessibility(code)}>
      {code}
    </Text>
  );
}

const SHORT_SCREEN_HEIGHT = 640;
const SHORT_CODE = 48;
const SHEET_CODE = 44;

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  label: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  code: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.lobbyHeroCode,
    lineHeight: Math.round(AppSizes.lobbyHeroCode * DISPLAY_LINE_HEIGHT),
    letterSpacing: 6,
    textAlign: 'center',
    textShadowColor: AppColors.highlight,
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 0,
  },
  shortCode: {
    fontSize: SHORT_CODE,
    lineHeight: Math.round(SHORT_CODE * DISPLAY_LINE_HEIGHT),
    textShadowOffset: { width: 0, height: 4 },
  },
  sheetCode: {
    fontSize: SHEET_CODE,
    lineHeight: Math.round(SHEET_CODE * DISPLAY_LINE_HEIGHT),
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 3 },
  },
});
