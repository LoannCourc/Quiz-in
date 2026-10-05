import { StyleSheet, Text, View } from 'react-native';

import { TvCastButton } from '@/components/host/TvCastButton';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { DetailsToggle } from './DetailsToggle';
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
        <DetailsToggle label={isOpen ? tvBar.hide : tvBar.details} isOpen={isOpen} onPress={onToggle} />
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
});
