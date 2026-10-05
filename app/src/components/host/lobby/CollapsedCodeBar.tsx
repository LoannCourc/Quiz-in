import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { DetailsToggle } from './DetailsToggle';

// Bloc du code réduit, sans TV connectée : une ligne « Code B9CX · Détails ▾ », pour laisser la place à
// la liste des joueurs et au formulaire de l'hôte. « Détails » rouvre le code, « Afficher sur la TV »
// et « Je n'ai pas de TV ».
export function CollapsedCodeBar({ code, onExpand }: { code: string; onExpand: () => void }) {
  const { tvBar } = strings.hostLobby;
  return (
    <View style={styles.bar}>
      <Text style={styles.code} accessibilityLabel={strings.hostLobby.codeAccessibility(code)}>
        <Text style={styles.label}>{tvBar.codeShort}</Text>
        {code}
      </Text>
      <DetailsToggle label={tvBar.details} isOpen={false} onPress={onExpand} />
    </View>
  );
}

const CODE_SIZE = 22;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  code: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: CODE_SIZE,
    lineHeight: Math.round(CODE_SIZE * DISPLAY_LINE_HEIGHT),
    letterSpacing: 2,
  },
  label: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
