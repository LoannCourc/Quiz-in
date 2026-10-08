import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// En-tête des écrans d'accueil joueur : logo et pastille du code de partie.
export function JoinHeader({ code }: { code?: string }) {
  return (
    <View style={styles.header}>
      <Logo size="large" />
      {code && (
        <View style={styles.codePill}>
          <Text style={styles.codeText}>{strings.join.roomLabel(code)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  codePill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
  },
  codeText: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
