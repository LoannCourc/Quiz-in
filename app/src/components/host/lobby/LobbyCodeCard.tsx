import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { DetailsToggle } from './DetailsToggle';

interface LobbyCodeCardProps {
  code: string;
  // Code plus petit : quand le bloc « Rejoindre sans TV » est ouvert (le QR et le lien contiennent
  // déjà le code), pour laisser la place à la liste des joueurs.
  compact?: boolean;
  // « Réduire ▴ » : le bloc devient la ligne « Code B9CX · Détails ▾ » (CollapsedCodeBar).
  onCollapse: () => void;
}

// Carte « Code de la partie » : le libellé et « Réduire » sur une ligne, puis le code en très grand,
// ombre dure rose.
export function LobbyCodeCard({ code, compact = false, onCollapse }: LobbyCodeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{strings.hostLobby.codeLabel}</Text>
        <DetailsToggle label={strings.hostLobby.tvBar.collapse} isOpen onPress={onCollapse} />
      </View>
      <Text
        style={[styles.code, compact && styles.compactCode]}
        accessibilityLabel={strings.hostLobby.codeAccessibility(code)}>
        {code}
      </Text>
    </View>
  );
}

const COMPACT_CODE = 30;

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  // Sur un écran étroit ou avec une grande police, « Réduire » passe sous le libellé.
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
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
    textAlign: 'center',
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
