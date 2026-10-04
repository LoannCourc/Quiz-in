import type { PosterPalette } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gradientStyle } from '@/components/ui/gradient';
import { AppColors, AppFonts, AppPosterGradients, AppShadows, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface QuizPosterProps {
  title: string;
  poster: PosterPalette;
  width: number;
  // Lu par les lecteurs d'écran ; par défaut, le titre.
  accessibilityLabel?: string;
  // Sans onPress, l'affiche n'est pas un bouton (grande affiche de la fiche).
  onPress?: () => void;
}

// Affiche portrait d'un quiz : dégradé propre au quiz, grand « ? » et titre en bas.
export function QuizPoster({ title, poster, width, accessibilityLabel, onPress }: QuizPosterProps) {
  const height = Math.round(width * AppSizes.posterRatio);
  const markSize = Math.round(width * 0.5);
  const titleSize = Math.max(12, Math.round(width * 0.11));
  const content = (
    <>
      <Text style={[styles.mark, { fontSize: markSize, lineHeight: Math.round(markSize * 1.3) }]}>?</Text>
      <Text numberOfLines={3} style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.15) }]}>
        {title}
      </Text>
    </>
  );
  const posterStyle = [styles.poster, { width, height }, gradientStyle(AppPosterGradients[poster])];

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={accessibilityLabel ?? title} style={posterStyle}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [...posterStyle, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  poster: {
    justifyContent: 'space-between',
    padding: Spacing.two,
    borderRadius: AppSizes.posterRadius,
    backgroundColor: AppColors.surface,
    boxShadow: AppShadows.hard,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  mark: {
    marginTop: Spacing.two,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    textAlign: 'center',
    textShadowColor: AppShadows.textColor,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    textTransform: 'uppercase',
    textShadowColor: AppShadows.textColor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
});
