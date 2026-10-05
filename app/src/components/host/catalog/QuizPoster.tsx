import { themeIconOf } from '@shared/themeIcons';
import type { PosterPalette } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gradientStyle } from '@/components/ui/gradient';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppPosterGradients, AppShadows, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

interface QuizPosterProps {
  title: string;
  poster: PosterPalette;
  // Thème du quiz : son icône remplace le « ? » (Culture générale et thème inconnu gardent le « ? »).
  theme: string;
  width: number;
  // Lu par les lecteurs d'écran ; par défaut, le titre.
  accessibilityLabel?: string;
  // Sans onPress, l'affiche n'est pas un bouton (grande affiche de la fiche).
  onPress?: () => void;
}

// Largeur moyenne d'une capitale en Nunito Black, en fraction de la taille de police (avec marge).
const UPPERCASE_CHAR_WIDTH = 0.72;
const TITLE_MIN_SIZE = 9;

// Taille du titre : 11 % de la largeur de l'affiche, réduite si besoin pour que le mot le plus long
// tienne sur une ligne (jamais de mot coupé au milieu, comme « FRANCOPHONE / S »).
function titleSizeFor(title: string, width: number): number {
  const innerWidth = width - 2 * Spacing.two;
  const longestWord = Math.max(1, ...title.split(/\s+/).map((word) => word.length));
  const fitting = Math.floor(innerWidth / (longestWord * UPPERCASE_CHAR_WIDTH));
  return Math.max(TITLE_MIN_SIZE, Math.min(Math.max(12, Math.round(width * 0.11)), fitting));
}

// Côté maximal de l'icône de thème sur une affiche.
const ICON_MAX_SIZE = 64;

// Affiche portrait d'un quiz : dégradé propre au quiz (champ poster), icône du thème (ou grand « ? »)
// et titre en bas.
export function QuizPoster({ title, poster, theme, width, accessibilityLabel, onPress }: QuizPosterProps) {
  const icon = themeIconOf(theme);
  const height = Math.round(width * AppSizes.posterRatio);
  const markSize = Math.round(width * 0.5);
  const titleSize = titleSizeFor(title, width);
  const content = (
    <>
      {icon === 'question' ? (
        <Text style={[styles.mark, { fontSize: markSize, lineHeight: Math.round(markSize * 1.3) }]}>?</Text>
      ) : (
        <View style={styles.icon}>
          <ThemeIcon name={icon} size={Math.min(ICON_MAX_SIZE, markSize)} />
        </View>
      )}
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
  icon: {
    alignItems: 'center',
    marginTop: Spacing.three,
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
