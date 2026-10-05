import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { TvCastButton } from '@/components/host/TvCastButton';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { JoinWithoutTv } from './JoinWithoutTv';

interface TvConnectedBarProps {
  code: string;
  isOpen: boolean;
  onToggle: () => void;
}

// TV connectée (maquette L1) : le code, le QR et le lien se réduisent à une barre ; « Détails » les
// déplie. L'icône Cast native reste dans la barre : elle ouvre la liste des TV (changer, déconnecter).
export function TvConnectedBar({ code, isOpen, onToggle }: TvConnectedBarProps) {
  const { tvBar } = strings.hostLobby;
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={styles.dot} />
        <View style={styles.texts}>
          <Text style={styles.title}>{tvBar.connected}</Text>
          <Text style={styles.code} accessibilityLabel={strings.hostLobby.codeAccessibility(code)}>
            {tvBar.codeLabel}
            <Text style={styles.codeValue}>{code}</Text>
          </Text>
        </View>
        <TvCastButton />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          onPress={onToggle}
          style={styles.toggle}>
          <Text style={styles.toggleLabel}>{isOpen ? tvBar.hide : tvBar.details}</Text>
          {/* Chevron du réglage tourné : vers le bas pour déplier, vers le haut pour replier. */}
          <View style={isOpen ? styles.chevronUp : styles.chevronDown}>
            <SettingsIcon name="chevron" color={AppColors.link} />
          </View>
        </Pressable>
      </View>
      {isOpen && <JoinWithoutTv code={code} variant="details" />}
    </View>
  );
}

const DOT_SIZE = 10;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: AppColors.correct,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  code: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  codeValue: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    letterSpacing: 1,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.link,
  },
  toggleLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  chevronDown: {
    transform: [{ rotate: '90deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '-90deg' }],
  },
});
