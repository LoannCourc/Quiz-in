import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import * as Clipboard from 'expo-clipboard';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { HowToIcon, type HowToIconName } from '@/components/host/lobby/HowToIcon';
import { BackButton, goBackOrHome } from '@/components/ui/BackButton';
import { ActionIcon } from '@/components/ui/ActionIcon';
import { ButtonLabel, BUTTON_LABEL_MAX_FONT_SCALE } from '@/components/ui/ButtonLabel';
import { Screen } from '@/components/ui/Screen';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { receiverUrl } from '@/lib/createGame';
import { isPublishedWeb } from '@/lib/platform';

const texts = strings.tvComputer;
const STEP_ICONS: readonly HowToIconName[] = ['monitor', 'fullscreen', 'phone'];

type CopyStatus = 'idle' | 'copied' | 'failed';

// « Sur un ordinateur » (maquette « Pas de TV · C », plan B sans Chromecast) : le lien de l'écran TV de
// CETTE partie (le récepteur avec ?code=, qui se connecte seul dans n'importe quel navigateur), « Copier »
// et « M'envoyer » (feuille de partage du téléphone), puis trois étapes à faire sur l'ordinateur.
export default function TvComputerRoute() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = normalizeRoomCode(params.code ?? '');
  if (isPublishedWeb || !isValidRoomCode(code)) return <Redirect href="/" />;
  return <TvComputerScreen code={code} />;
}

function TvComputerScreen({ code }: { code: string }) {
  const url = receiverUrl(code);
  const shown = url.replace(/^https:\/\//, '');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  async function copy() {
    try {
      await Clipboard.setStringAsync(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  async function send() {
    try {
      // Lien dans le message seulement : même texte sur iPhone et Android.
      await Share.share({ message: texts.shareMessage(url) });
    } catch {
      // Partage annulé ou indisponible : le lien reste copiable.
    }
  }

  return (
    <Screen
      footer={
        <Pressable accessibilityRole="button" hitSlop={Spacing.three} onPress={goBackOrHome} style={styles.doneButton}>
          <Text style={styles.done}>{texts.done}</Text>
        </Pressable>
      }>
      <View style={styles.titleRow}>
        <BackButton label={texts.back} />
        <Text style={styles.title} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
          {texts.title}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{texts.linkLabel}</Text>
        <View style={styles.linkBox}>
          {/* Lien sur une ou deux lignes, jamais coupé au milieu du code (en or). */}
          <Text selectable style={styles.url} accessibilityLabel={url}>
            {shown.slice(0, -code.length)}
            <Text style={styles.urlCode}>{code}</Text>
          </Text>
          <View style={styles.buttons}>
            <Pressable accessibilityRole="button" onPress={copy} style={({ pressed }) => [styles.button, styles.copy, pressed && styles.pressed]}>
              <ActionIcon name="copy" size={ACTION_ICON} color={AppColors.onHighlight} />
              <ButtonLabel inRow maxLines={1} style={styles.copyLabel}>{copyStatus === 'copied' ? texts.copied : texts.copy}</ButtonLabel>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={send} style={({ pressed }) => [styles.button, styles.send, pressed && styles.pressed]}>
              <ActionIcon name="share" size={ACTION_ICON} color={AppColors.link} />
              <ButtonLabel inRow maxLines={1} style={styles.sendLabel}>{texts.send}</ButtonLabel>
            </Pressable>
          </View>
          {copyStatus === 'failed' && <Text style={styles.error}>{strings.hostLobby.copyFailed}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{texts.stepsLabel}</Text>
        {texts.steps.map((step, index) => (
          <View key={step.lead} style={styles.step}>
            <View style={styles.stepIcon}>
              <HowToIcon name={STEP_ICONS[index]} size={STEP_ICON} color={AppColors.ink} />
            </View>
            <Text style={styles.stepText}>
              <Text style={styles.stepLead}>{step.lead}</Text>
              {step.text}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const TITLE_SIZE = 24;
const STEP_DISC = 44;
const STEP_ICON = 24;
const BUTTON_HEIGHT = 52;
const ACTION_ICON = 20;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
  },
  section: {
    gap: Spacing.two,
  },
  label: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  linkBox: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.link,
    backgroundColor: AppColors.panel,
  },
  url: {
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 17,
  },
  urlCode: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  // Icône et texte centrés ensemble dans la pilule.
  button: {
    flex: 1,
    minHeight: BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: AppSizes.radiusPill,
  },
  copy: {
    backgroundColor: AppColors.highlight,
    boxShadow: AppShadows.hard,
  },
  send: {
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  pressed: {
    opacity: 0.8,
  },
  copyLabel: {
    color: AppColors.onHighlight,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  sendLabel: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  stepIcon: {
    width: STEP_DISC,
    height: STEP_DISC,
    borderRadius: STEP_DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accent,
  },
  stepText: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 15,
  },
  stepLead: {
    fontFamily: AppFonts.black,
  },
  doneButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  done: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
