import { levelDots } from '@shared/blindTestCatalog';
import { fittedFontSize } from '@shared/fontSize';
import { quizIconOf, type QuizIconName } from '@shared/themeIcons';
import type { DifficultyLevel, PosterPalette } from '@shared/types';
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
  // Quiz déjà joué sur ce téléphone (lot E) : coche ronde sur l'icône.
  isPlayed?: boolean;
  // Difficulté (maquette QT1) : pastille encre en haut à gauche, points or et libellé.
  level?: DifficultyLevel;
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
const PLAYED_BADGE_SIZE = 18;
// Pastille de difficulté : trois points (un niveau de quiz : facile, moyen, difficile) et libellé en 9 points ;
// s'il ne tient pas en 9 points (« Difficile » sur une affiche de 85 de large, grille de 320 points), les
// points seuls.
const LEVEL_DOTS = 3;
const LEVEL_DOT = 5;
const LEVEL_DOT_GAP = 2;
const LEVEL_FONT_SIZE = 9;
// Largeur moyenne d'un caractère en Nunito Black, en fraction de la taille (avec marge).
const LEVEL_CHAR_WIDTH = 0.62;

const LEVEL_LINE_HEIGHT = 12;

function levelLabelFits(label: string, width: number): boolean {
  const dotsWidth = LEVEL_DOTS * LEVEL_DOT + (LEVEL_DOTS - 1) * LEVEL_DOT_GAP;
  const available = width - 2 * Spacing.one - 2 * (Spacing.one + 1) - dotsWidth - Spacing.one;
  return label.length * LEVEL_CHAR_WIDTH * LEVEL_FONT_SIZE <= available;
}

// Lecteur d'écran : la difficulté après le titre.
function withLevel(label: string, level: DifficultyLevel | undefined): string {
  return level ? strings.catalog.withLevel(label, strings.catalog.difficultyLevels[level].toLowerCase()) : label;
}

function LevelPill({ level, width }: { level: DifficultyLevel; width: number }) {
  const label = strings.catalog.difficultyLevels[level];
  const filled = Math.min(LEVEL_DOTS, levelDots(level));
  return (
    <View style={styles.levelPill}>
      <View style={styles.levelDots}>
        {Array.from({ length: LEVEL_DOTS }, (_, index) => (
          <View key={index} style={[styles.levelDot, index < filled ? styles.levelDotFilled : styles.levelDotEmpty]} />
        ))}
      </View>
      {/* Place comptée en 9 points : la police du système ne l'agrandit pas (sinon le mot serait coupé) ; le
          lecteur d'écran lit la difficulté dans le libellé de l'affiche. */}
      {levelLabelFits(label, width) && (
        <Text style={styles.levelText} numberOfLines={1} maxFontSizeMultiplier={1}>
          {label}
        </Text>
      )}
    </View>
  );
}

// Affiche portrait d'un quiz : dégradé propre au quiz (champ poster), icône du quiz (ou grand « ? »)
// et titre en bas.
export function QuizPoster({ title, poster, theme, icon: ownIcon, width, accessibilityLabel, onPress, isPlayed = false, level }: QuizPosterProps) {
  const icon = quizIconOf({ theme, icon: ownIcon });
  const height = Math.round(width * AppSizes.posterRatio);
  // Taille de l'icône : jamais négative (largeur pas encore mesurée).
  const markSize = Math.max(0, Math.round(width * 0.5));
  const titleSize = titleSizeFor(title, width);
  const content = (
    <>
      {level && <LevelPill level={level} width={width} />}
      <View style={styles.icon}>
        <View>
          <ThemeIcon name={icon} size={Math.min(ICON_MAX_SIZE, markSize)} />
          {isPlayed && (
            <View style={styles.playedBadge}>
              <MarkIcon kind="check" size={PLAYED_MARK_SIZE} color={AppColors.onCorrect} />
            </View>
          )}
        </View>
      </View>
      <Text numberOfLines={3} style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.15) }]}>
        {title}
      </Text>
    </>
  );
  const posterStyle = [styles.poster, { width, height }, gradientStyle(AppPosterGradients[poster])];
  const label = withLevel(accessibilityLabel ?? title, level);

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label} style={posterStyle}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
    right: -PLAYED_BADGE_SIZE / 3,
    bottom: -PLAYED_BADGE_SIZE / 3,
    width: PLAYED_BADGE_SIZE,
    height: PLAYED_BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PLAYED_BADGE_SIZE / 2,
    borderWidth: 2,
    borderColor: AppColors.ink,
    backgroundColor: AppColors.correct,
  },
  levelPill: {
    position: 'absolute',
    top: Spacing.one,
    left: Spacing.one,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.one + 1,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.ink,
  },
  levelDots: {
    flexDirection: 'row',
    gap: LEVEL_DOT_GAP,
  },
  levelDot: {
    width: LEVEL_DOT,
    height: LEVEL_DOT,
    borderRadius: LEVEL_DOT / 2,
  },
  levelDotFilled: {
    backgroundColor: AppColors.levelDot,
  },
  levelDotEmpty: {
    borderWidth: 1,
    borderColor: AppColors.levelDotEmpty,
  },
  levelText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: LEVEL_FONT_SIZE,
    lineHeight: LEVEL_LINE_HEIGHT,
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
