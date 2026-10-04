import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface LobbyCodeCardProps {
  code: string;
  // Sur une ligne, plus petit : quand le bloc « Rejoindre sans TV » est ouvert (le QR et le lien
  // contiennent déjà le code), pour laisser la place à la liste des joueurs.
  compact?: boolean;
}

// Carte « Code de la partie » : le code en très grand, ombre dure rose.
export function LobbyCodeCard({ code, compact = false }: LobbyCodeCardProps) {
  return (
    <View
      style={[styles.card, compact && styles.compactCard]}
      accessible
      accessibilityLabel={strings.hostLobby.codeAccessibility(code)}>
      <Text style={styles.label}>{strings.hostLobby.codeLabel}</Text>
      <Text style={[styles.code, compact && styles.compactCode]}>{code}</Text>
    </View>
  );
}

const COMPACT_CODE = 30;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  compactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  label: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  code: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.lobbyCode,
    lineHeight: Math.round(AppSizes.lobbyCode * DISPLAY_LINE_HEIGHT),
    letterSpacing: 6,
    textShadowColor: AppColors.highlight,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  compactCode: {
    fontSize: COMPACT_CODE,
    lineHeight: Math.round(COMPACT_CODE * DISPLAY_LINE_HEIGHT),
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 2 },
  },
});
