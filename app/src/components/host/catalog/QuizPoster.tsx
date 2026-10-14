import { levelDots } from '@shared/blindTestCatalog';
import { fittedFontSize } from '@shared/fontSize';
import { quizIconOf, type QuizIconName } from '@shared/themeIcons';
import type { DifficultyLevel, PosterPalette } from '@shared/types';
import { useState } from 'react';
import { PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';

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
// Le titre garde toujours la place de ses trois lignes : l'icône rétrécit au besoin (pastille de difficulté
// plus haute, grande police du système), jamais le titre.
const TITLE_LINES = 3;
const TITLE_MAX_FONT_SCALE = 1.2;
const TITLE_GAP = Spacing.one;

// Côté de l'icône : la moitié de la largeur, plafonné, et ce qui reste en hauteur une fois le titre placé.
function iconSizeFor(width: number, height: number, titleLineHeight: number, hasLevel: boolean): number {
  const iconTop = hasLevel ? LEVEL_PILL_HEIGHT : Spacing.three;
  const titleHeight = TITLE_LINES * titleLineHeight * Math.min(PixelRatio.getFontScale(), TITLE_MAX_FONT_SCALE);
  const room = height - 2 * Spacing.two - iconTop - titleHeight - TITLE_GAP;
  return Math.max(0, Math.round(Math.min(ICON_MAX_SIZE, width * 0.5, room)));
}
const PLAYED_MARK_SIZE = 10;
const PLAYED_BADGE_SIZE = 18;
// Pastille de difficulté (28 de haut) : trois points (un niveau de quiz : facile, moyen, difficile) et libellé en
// 13 points ; s'il ne tient pas dans la largeur de l'affiche (« Difficile » à 320 de large), les points seuls.
const LEVEL_DOTS = 3;
const LEVEL_DOT = 6;
const LEVEL_DOT_GAP = 3;
const LEVEL_FONT_SIZE = 13;
const LEVEL_PILL_HEIGHT = 28;
const LEVEL_PILL_PADDING = 6;
const LEVEL_PILL_GAP = 4;
// Marge à droite de la pastille, et marge de sécurité sur la mesure du libellé (Android la donne parfois une
// fraction de pixel trop étroite).
const LEVEL_PILL_END = 3;
const LEVEL_MEASURE_MARGIN = 1;
const LEVEL_LINE_HEIGHT = 17;

// Le libellé mesuré (largeur naturelle) tient-il à côté des points ?
function levelLabelFits(labelWidth: number, posterWidth: number): boolean {
  const dotsWidth = LEVEL_DOTS * LEVEL_DOT + (LEVEL_DOTS - 1) * LEVEL_DOT_GAP;
  const available = posterWidth - Spacing.one - LEVEL_PILL_END - 2 * LEVEL_PILL_PADDING - dotsWidth - LEVEL_PILL_GAP;
  return labelWidth + LEVEL_MEASURE_MARGIN <= available;
}

// Lecteur d'écran : la difficulté après le titre.
function withLevel(label: string, level: DifficultyLevel | undefined): string {
  return level ? strings.catalog.withLevel(label, strings.catalog.difficultyLevels[level].toLowerCase()) : label;
}

function LevelPill({ level, width }: { level: DifficultyLevel; width: number }) {
  const label = strings.catalog.difficultyLevels[level];
  const filled = Math.min(LEVEL_DOTS, levelDots(level));
  // Largeur naturelle du libellé, mesurée par un texte invisible (0 : pas encore mesurée, points seuls).
  const [labelWidth, setLabelWidth] = useState(0);
  return (
    <>
      <View style={styles.levelPill}>
        <View style={styles.levelDots}>
          {Array.from({ length: LEVEL_DOTS }, (_, index) => (
            <View key={index} style={[styles.levelDot, index < filled ? styles.levelDotFilled : styles.levelDotEmpty]} />
          ))}
        </View>
        {/* Taille fixe : la police du système ne l'agrandit pas (sinon le mot serait coupé) ; le lecteur d'écran
            lit la difficulté dans le libellé de l'affiche. */}
        {labelWidth > 0 && levelLabelFits(labelWidth, width) && (
          <Text style={styles.levelText} numberOfLines={1} maxFontSizeMultiplier={1}>
            {label}
          </Text>
        )}
      </View>
      {/* Hors de la pastille (dans l'affiche, bien plus large que le mot) : jamais coupé sur deux lignes. */}
      <Text
        style={[styles.levelText, styles.levelMeasure]}
        maxFontSizeMultiplier={1}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        onLayout={(event) => setLabelWidth(event.nativeEvent.layout.width)}>
        {label}
      </Text>
    </>
  );
}

// Affiche portrait d'un quiz : dégradé propre au quiz (champ poster), icône du quiz (ou grand « ? »)
// et titre en bas.
export function QuizPoster({ title, poster, theme, icon: ownIcon, width, accessibilityLabel, onPress, isPlayed = false, level }: QuizPosterProps) {
  const icon = quizIconOf({ theme, icon: ownIcon });
  const height = Math.round(width * AppSizes.posterRatio);
  const titleSize = titleSizeFor(title, width);
  const titleLineHeight = Math.round(titleSize * 1.15);
  // Taille de l'icône : jamais négative (largeur pas encore mesurée).
  const iconSize = iconSizeFor(width, height, titleLineHeight, level !== undefined);
  const content = (
    <>
      {level && <LevelPill level={level} width={width} />}
      <View style={[styles.icon, level && styles.iconBelowLevel]}>
        <View>
          <ThemeIcon name={icon} size={iconSize} />
          {isPlayed && (
            <View style={styles.playedBadge}>
              <MarkIcon kind="check" size={PLAYED_MARK_SIZE} color={AppColors.onCorrect} />
            </View>
          )}
        </View>
      </View>
      <Text numberOfLines={TITLE_LINES} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE} style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
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
    height: LEVEL_PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LEVEL_PILL_GAP,
    paddingHorizontal: LEVEL_PILL_PADDING,
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
    borderWidth: 1.5,
    borderColor: AppColors.levelDotEmpty,
  },
  levelText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: LEVEL_FONT_SIZE,
    lineHeight: LEVEL_LINE_HEIGHT,
  },
  // Invisible, à la largeur naturelle du mot.
  levelMeasure: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  icon: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  // Sous la pastille de difficulté (en haut à gauche, 28 de haut).
  iconBelowLevel: {
    marginTop: LEVEL_PILL_HEIGHT,
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
