import { PLAYERS_SITE_URL } from '@shared/constants';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { joinUrl } from '@/lib/createGame';

import { RoomCode } from './LobbyCodeHero';
import { QrCode } from './QrCode';

interface InviteSheetProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

const texts = strings.hostLobby.invite;
const PLAYERS_HOST = PLAYERS_SITE_URL.replace(/^https:\/\//, '');
// QR code : au plus QR_MAX, et toujours la largeur de la feuille moins ses marges.
const QR_MAX = 236;
const SHEET_SIDE = 2 * Spacing.four;

// Feuille « Inviter des joueurs » (maquette « Bouton Inviter ») : QR code du lien des joueurs, le code, puis
// « Partager » (feuille de partage du téléphone, le lien dans le message) et « Copier le lien ».
export function InviteSheet({ code, isOpen, onClose }: InviteSheetProps) {
  const url = joinUrl(code);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const qrSize = Math.min(QR_MAX, useWindowDimensions().width - SHEET_SIDE);

  async function copy() {
    try {
      await Clipboard.setStringAsync(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  async function share() {
    try {
      // Lien dans le message seulement : même texte sur iPhone et Android.
      await Share.share({ message: texts.shareMessage(code, url) });
    } catch {
      // Partage annulé ou indisponible : le lien reste copiable.
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={texts.title}
      footer={
        <Pressable accessibilityRole="button" hitSlop={Spacing.three} onPress={onClose} style={styles.closeButton}>
          <Text style={styles.close}>{texts.close}</Text>
        </Pressable>
      }>
      <Text style={styles.intro}>{texts.intro}</Text>
      <View style={styles.qr}>
        <QrCode value={url} accessibilityLabel={texts.qrLabel(url)} maxSize={qrSize} />
      </View>
      <View>
        <Text style={styles.typeCode}>{texts.typeCode(PLAYERS_HOST)}</Text>
        <RoomCode code={code} size="sheet" />
      </View>
      <View style={styles.buttons}>
        <Pressable accessibilityRole="button" onPress={share} style={({ pressed }) => [styles.button, styles.share, pressed && styles.pressed]}>
          <ButtonLabel style={styles.shareLabel}>{texts.share}</ButtonLabel>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={copy} style={({ pressed }) => [styles.button, styles.copy, pressed && styles.pressed]}>
          <ButtonLabel style={styles.copyLabel}>{copyStatus === 'copied' ? strings.hostLobby.copied : texts.copy}</ButtonLabel>
        </Pressable>
      </View>
      {copyStatus === 'failed' && <Text style={styles.error}>{strings.hostLobby.copyFailed}</Text>}
    </BottomSheet>
  );
}

const BUTTON_HEIGHT = 52;

const styles = StyleSheet.create({
  intro: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 15,
  },
  qr: {
    alignItems: 'center',
  },
  typeCode: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    minHeight: BUTTON_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: AppSizes.radiusPill,
  },
  share: {
    backgroundColor: AppColors.highlight,
    boxShadow: AppShadows.hard,
  },
  copy: {
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  pressed: {
    opacity: 0.8,
  },
  shareLabel: {
    color: AppColors.onHighlight,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  copyLabel: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  close: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
