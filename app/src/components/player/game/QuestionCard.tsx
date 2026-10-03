import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

// Au-delà, l'énoncé (140 caractères au plus) passe en taille réduite pour tenir sans défiler.
const LONG_TEXT_LENGTH = 80;

// Carte blanche à contour rose, énoncé en Bowlby One couleur encre, centré (maquette mobile).
export function QuestionCard({ text }: { text: string }) {
  const fontSize = text.length > LONG_TEXT_LENGTH ? 21 : 24;
  return (
    <View style={styles.card}>
      <Text style={[styles.text, { fontSize, lineHeight: Math.round(fontSize * DISPLAY_LINE_HEIGHT) }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderRadius: AppSizes.radiusCard,
    borderWidth: AppSizes.cardBorder,
    borderColor: AppColors.highlight,
    backgroundColor: AppColors.card,
    boxShadow: AppShadows.hard,
  },
  text: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    textAlign: 'center',
  },
});
