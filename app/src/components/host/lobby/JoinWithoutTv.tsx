import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { joinUrl, receiverUrl } from '@/lib/createGame';

import { QrCode } from './QrCode';

// « quizin-play.web.app » puis « /join/CODE ».
function displayLines(url: string): [string, string] {
  const withoutScheme = url.replace(/^https:\/\//, '');
  const slash = withoutScheme.indexOf('/');
  return [withoutScheme.slice(0, slash), withoutScheme.slice(slash)];
}

type CopyStatus = 'idle' | 'joinCopied' | 'receiverCopied' | 'failed';

interface JoinWithoutTvProps {
  code: string;
  onHide: () => void;
}

// Bloc « Rejoindre sans TV » du salon, ouvert par « Je n'ai pas de TV » : lien des joueurs à copier
// ou partager, et en bas le lien de l'écran pour le plan B (navigateur d'un PC branché en HDMI).
// Mise en page compacte : la liste des joueurs doit rester visible en dessous sur un petit écran.
export function JoinWithoutTv({ code, onHide }: JoinWithoutTvProps) {
  const url = joinUrl(code);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  async function copy(text: string, done: CopyStatus) {
    try {
      await Clipboard.setStringAsync(text);
      setCopyStatus(done);
    } catch {
      setCopyStatus('failed');
    }
  }

  async function share() {
    try {
      await Share.share({ message: strings.hostLobby.noTv.shareMessage(url) });
    } catch {
      // Partage annulé ou indisponible (navigateur sans partage) : le lien reste copiable.
    }
  }

  return (
    <View style={styles.block}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{strings.hostLobby.noTv.title}</Text>
        <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={onHide}>
          <Text style={styles.link}>{strings.hostLobby.noTv.hide}</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <QrCode value={url} accessibilityLabel={strings.hostLobby.noTv.qrLabel(url)} />
        <View style={styles.side}>
          <View>
            <Text style={styles.linkLabel}>{strings.hostLobby.noTv.linkLabel}</Text>
            {/* Domaine et chemin sur deux lignes : le lien n'est jamais coupé au milieu du code. */}
            <Text selectable style={styles.url}>
              {displayLines(url).join('\n')}
            </Text>
          </View>
          <SmallPill
            label={copyStatus === 'joinCopied' ? strings.hostLobby.copied : strings.hostLobby.copyButton}
            color={AppColors.card}
            onPress={() => copy(url, 'joinCopied')}
          />
          <SmallPill label={strings.hostLobby.noTv.shareButton} color={AppColors.link} onPress={share} />
        </View>
      </View>
      {copyStatus === 'failed' && <Text style={styles.error}>{strings.hostLobby.copyFailed}</Text>}

      <Pressable accessibilityRole="button" hitSlop={Spacing.one} onPress={() => copy(receiverUrl(code), 'receiverCopied')}>
        <Text style={styles.planB}>
          {copyStatus === 'receiverCopied' ? strings.hostLobby.noTv.planBCopied : strings.hostLobby.noTv.planBLink}
        </Text>
      </Pressable>
    </View>
  );
}

interface SmallPillProps {
  label: string;
  color: string;
  onPress: () => void;
}

// Petite pilule à texte encre, sur fond clair (blanc ou cyan).
function SmallPill({ label, color, onPress }: SmallPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pill, { backgroundColor: color }, pressed && styles.pressed]}>
      <Text style={styles.pillLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.link,
    backgroundColor: AppColors.panel,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  link: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  side: {
    flex: 1,
    gap: Spacing.two,
  },
  linkLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  url: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
  pill: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    boxShadow: AppShadows.hard,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  pillLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
  planB: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
