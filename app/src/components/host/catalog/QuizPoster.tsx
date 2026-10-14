import { fittedFontSize } from '@shared/fontSize';
import { quizIconOf, type QuizIconName } from '@shared/themeIcons';
import type { PosterPalette } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { gradientStyle } from '@/components/ui/gradient';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { MarkIcon } from '@/components/ui/MarkIcon';
import { AppColors, AppFonts, AppPosterGradients, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface QuizPosterProps {
  title: string;
  poster: PosterPalette;
  // Icône du quiz (la sienne, sinon celle de son thème) à la place du « ? » ; Culture générale et un
  // thème inconnu gardent le « ? ».
  theme: string;
  icon?: QuizIconName;
  width: number;
  // Lu par les lecteurs d'écran ; par défaut, le titre.
  accessibilityLabel?: string;
  // Sans onPress, l'affiche n'est pas un bouton (grande affiche de la fiche).
  onPress?: () => void;
  // Quiz déjà joué sur ce téléphone (lot E) : pastille « Déjà fait » en haut à droite.
  isPlayed?: boolean;
}

// Largeur moyenne d'une capitale en Nunito Black, en fraction de la taille de police (avec marge).
const UPPERCASE_CHAR_WIDTH = 0.72;
const TITLE_MIN_SIZE = 9;

// Taille du titre : 11 % de la largeur de l'affiche, réduite si besoin pour que le mot le plus long
// tienne sur une ligne (jamais de mot coupé au milieu, comme « FRANCOPHONE / S »).
function titleSizeFor(title: string, width: number): number {
  const innerWidth = width - 2 * Spacing.two;
  const longestWord = Math.max(1, ...title.split(/\s+/).map((word) => word.length));
  const base = Math.max(TITLE_MIN_SIZE, Math.round(width * 0.11));
  return fittedFontSize(base, innerWidth, longestWord, UPPERCASE_CHAR_WIDTH, TITLE_MIN_SIZE);
}

// Côté maximal de l'icône de thème sur une affiche.
const ICON_MAX_SIZE = 64;
const PLAYED_MARK_SIZE = 10;

// Affiche portrait d'un quiz : dégradé propre au quiz (champ poster), icône du quiz (ou grand « ? »)
// et titre en bas.
export function QuizPoster({ title, poster, theme, icon: ownIcon, width, accessibilityLabel, onPress, isPlayed = false }: QuizPosterProps) {
  const icon = quizIconOf({ theme, icon: ownIcon });
  const height = Math.round(width * AppSizes.posterRatio);
  // Taille de l'icône : jamais négative (largeur pas encore mesurée).
  const markSize = Math.max(0, Math.round(width * 0.5));
  const titleSize = titleSizeFor(title, width);
  const content = (
    <>
      {isPlayed && (
        <View style={styles.playedBadge}>
          <MarkIcon kind="check" size={PLAYED_MARK_SIZE} color={AppColors.onCorrect} />
          <Text style={styles.playedText} numberOfLines={1}>
            {strings.catalog.played}
          </Text>
        </View>
      )}
      <View style={styles.icon}>
        <ThemeIcon name={icon} size={Math.min(ICON_MAX_SIZE, markSize)} />
      </View>
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
  playedBadge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.one + 2,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.correct,
  },
  playedText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onCorrect,
    fontFamily: AppFonts.black,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
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
