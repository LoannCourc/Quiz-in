import type { BadgeId } from '@shared/badges';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FittedLine } from '@/components/ui/FittedLine';
import { MarkIcon } from '@/components/ui/MarkIcon';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { rateApp, shareApp } from '@/lib/badgeActions';

import type { EmblemName } from './badgeSvgSources';
import { BadgeEmblem } from './LazyBadges';

const texts = strings.trophies.support;
const BORDER = 4;
const CARD_MAX_WIDTH = 400;
const TITLE_SIZE = 22;
const TITLE_MIN_SIZE = 16;
const CLOSE_SIZE = 32;
const DISC_SIZE = 44;
const ICON_SIZE = 22;

interface SupportAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Badges débloqués par Partager ou Noter (à montrer par l'écran, une fois la fenêtre fermée).
  onUnlocked: (badges: BadgeId[]) => void;
}

// Fenêtre « Quiz'in te plaît ? » de l'accueil : Partager et Noter, mêmes actions (et mêmes badges) que
// « Mes badges ». La fenêtre se ferme une fois l'action faite : sur iOS, la feuille de partage s'ouvre par-dessus
// elle et disparaîtrait avec elle. Fond, croix, « Plus tard » ou bouton retour d'Android : fermeture.
export function SupportAppDialog({ isOpen, onClose, onUnlocked }: SupportAppDialogProps) {
  const [isBusy, setIsBusy] = useState(false);
  const run = async (action: () => Promise<BadgeId[]>) => {
    if (isBusy) return;
    setIsBusy(true);
    const unlocked = await action();
    setIsBusy(false);
    onClose();
    if (unlocked.length > 0) onUnlocked(unlocked);
  };
  return (
    <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel={texts.close} style={styles.backdrop} onPress={onClose} />
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.titleRow}>
            <View style={styles.closeSpacer} />
            <View style={styles.titleColumn}>
              <FittedLine text={texts.title} style={styles.title} minSize={TITLE_MIN_SIZE} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={texts.close} onPress={onClose} hitSlop={Spacing.two} style={styles.close}>
              <MarkIcon kind="cross" size={14} color={AppColors.text} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>{texts.subtitle}</Text>
          <SupportAction
            label={texts.share}
            color={AppColors.supportShare}
            emblem="partager"
            iconColor={AppColors.supportShare}
            onPress={() => void run(shareApp)}
          />
          <SupportAction
            label={texts.rate}
            color={AppColors.supportRate}
            emblem="noter"
            iconColor={AppColors.supportRate}
            filled
            onPress={() => void run(rateApp)}
          />
          <Text accessibilityRole="button" onPress={onClose} style={styles.later}>
            {texts.later}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

interface SupportActionProps {
  label: string;
  color: string;
  emblem: EmblemName;
  iconColor: string;
  filled?: boolean;
  onPress: () => void;
}

// Pilule colorée : rond encre avec l'emblème du badge, libellé et « Débloque un badge » dessous.
function SupportAction({ label, color, emblem, iconColor, filled, onPress }: SupportActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${texts.unlocksBadge}`}
      onPress={onPress}
      style={({ pressed }) => [styles.action, { backgroundColor: color }, pressed && styles.actionPressed]}>
      <View style={styles.disc}>
        <BadgeEmblem name={emblem} size={ICON_SIZE} color={iconColor} filled={filled} />
      </View>
      <View style={styles.actionTexts}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionHint}>{texts.unlocksBadge}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: AppColors.backdrop,
  },
  card: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radiusCard,
    borderWidth: BORDER,
    borderColor: AppColors.supportBorder,
    backgroundColor: AppColors.supportPanel,
    boxShadow: AppShadows.hardInk,
  },
  // Croix à droite, place vide de même largeur à gauche : le titre reste centré.
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  closeSpacer: {
    width: CLOSE_SIZE,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
  },
  close: {
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: CLOSE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.supportClose,
  },
  subtitle: {
    marginTop: -Spacing.two,
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  action: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 3,
    borderColor: AppColors.supportBorder,
    boxShadow: AppShadows.submit,
  },
  actionPressed: {
    boxShadow: AppShadows.submitPressed,
    transform: [{ translateY: 3 }],
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.supportIconDisc,
  },
  actionTexts: {
    flex: 1,
    minWidth: 0,
  },
  actionLabel: {
    color: AppColors.onSupport,
    fontFamily: AppFonts.black,
    fontSize: 19,
    ...TEXT_FIT_SAFETY,
  },
  actionHint: {
    color: AppColors.onSupport,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
    ...TEXT_FIT_SAFETY,
  },
  later: {
    alignSelf: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
