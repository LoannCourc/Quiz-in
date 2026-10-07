import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { joinUrl } from '@/lib/createGame';

interface LobbyCodeHeroProps {
  code: string;
  // Bloc QR code, lien et partage (JoinWithoutTv) ouvert sous le bouton de la TV.
  isQrOpen: boolean;
  onToggleQr: () => void;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

// Salon sans TV connectée (maquette N2, « le code d'abord ») : « CODE DE LA PARTIE », le code en très
// grand (ombre dure rose adouci), puis deux petits boutons : « QR code » (ouvre le QR et le lien) et
// « Copier le lien ».
export function LobbyCodeHero({ code, isQrOpen, onToggleQr }: LobbyCodeHeroProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const texts = strings.hostLobby;
  // Écran court (320 × 568…) : code un peu moins grand, la grille des joueurs reste à l'écran.
  const isShortScreen = useWindowDimensions().height < SHORT_SCREEN_HEIGHT;

  async function copy() {
    try {
      await Clipboard.setStringAsync(joinUrl(code));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <View style={styles.hero}>
      <Text style={styles.label}>{texts.codeLabel}</Text>
      <Text style={[styles.code, isShortScreen && styles.shortCode]} accessibilityLabel={texts.codeAccessibility(code)}>
        {code}
      </Text>
      <View style={styles.pills}>
        <OutlinePill label={isQrOpen ? texts.hideQr : texts.qrButton} onPress={onToggleQr} isPressedState={isQrOpen} />
        <OutlinePill label={copyStatus === 'copied' ? texts.copied : texts.copyButton} onPress={copy} />
      </View>
      {copyStatus === 'failed' && <Text style={styles.error}>{texts.copyFailed}</Text>}
    </View>
  );
}

function OutlinePill({ label, onPress, isPressedState = false }: { label: string; onPress: () => void; isPressedState?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: isPressedState }}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
      <ButtonLabel stretch={false} style={styles.pillLabel}>{label}</ButtonLabel>
    </Pressable>
  );
}

const SHORT_SCREEN_HEIGHT = 640;
const SHORT_CODE = 48;

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
  pills: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  // Pilule qui épouse son texte (maquette N2) ; les deux restent centrées sous le code.
  pill: {
    flexShrink: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  pressed: {
    opacity: 0.7,
  },
  pillLabel: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
});
