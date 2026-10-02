import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// En-tête des écrans d'accueil joueur : logo QUIZ'IN en or et pastille du code de partie.
export function JoinHeader({ code }: { code?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>{strings.join.appName}</Text>
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
  logo: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 44,
    lineHeight: Math.round(44 * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
    textShadowColor: AppShadows.textColor,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
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
