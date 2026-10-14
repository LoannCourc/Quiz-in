import { levelDots, type BlindTestFacet } from '@shared/blindTestCatalog';
import { DISPLAY_CHAR_WIDTH } from '@shared/labelFit';
import { quizLevel } from '@shared/quizCatalog';
import type { QuizEntry } from '@shared/quizValidation';
import type { DifficultyLevel } from '@shared/types';
import { themeIconOf } from '@shared/themeIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const texts = strings.catalog.blindTest;

// Libellé d'une tuile (« 80s », « Rock », « Facile ») et titre de sa liste (« Années 80 »).
export function facetLabel(facet: BlindTestFacet): string {
  if (facet.tab === 'genre') return texts.genres[facet.value];
  if (facet.tab === 'decade') return texts.decades[facet.value];
  return strings.catalog.difficultyLevels[facet.value];
}

export function facetTitle(facet: BlindTestFacet): string {
  return facet.tab === 'decade' ? texts.decadeTitles[facet.value] : facetLabel(facet);
}

interface TileProps {
  facet: BlindTestFacet;
  count: number;
  playedCount: number;
  accent: string;
  width: number;
  onPress: () => void;
}

const TILE_HEIGHT = 104;
const TILE_LABEL_MAX = 26;
const CORNER = 40;

// Tuile d'un onglet (maquette BT5) : quart de disque coloré en haut à droite, libellé en couleur,
// nombre de blind tests et nombre déjà joués sur ce téléphone.
export function BlindTestTile({ facet, count, playedCount, accent, width, onPress }: TileProps) {
  const label = facetLabel(facet);
  // Le libellé tient toujours sur une ligne : taille d'après la largeur de la tuile (largeur moyenne mesurée
  // des lettres de Bowlby One), 26 au plus.
  const labelSize = Math.min(TILE_LABEL_MAX, Math.floor((width - Spacing.three * 2) / (label.length * DISPLAY_CHAR_WIDTH)));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${texts.count(count)}, ${texts.played(playedCount)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { width }, pressed && styles.pressed]}>
      <View style={[styles.corner, { backgroundColor: accent }]} />
      <Text style={[styles.tileLabel, { color: accent, fontSize: labelSize, lineHeight: Math.round(labelSize * DISPLAY_LINE_HEIGHT) }]} numberOfLines={1}>
        {label}
      </Text>
      <View>
        <Text style={styles.tileCount}>{texts.count(count)}</Text>
        <Text style={styles.tilePlayed}>{texts.played(playedCount)}</Text>
      </View>
    </Pressable>
  );
}

// Quatre points de difficulté : pleins jusqu'au niveau, le 4e niveau (« Impossible ») tout en rose.
export function LevelDots({ level }: { level: DifficultyLevel }) {
  const filled = levelDots(level);
  const color = level === 'impossible' ? AppColors.levelDotImpossible : AppColors.levelDot;
  return (
    <View style={styles.dots}>
      {[1, 2, 3, 4].map((dot) => (
        <View key={dot} style={[styles.dot, dot <= filled ? { backgroundColor: color } : styles.dotEmpty]} />
      ))}
    </View>
  );
}

export const ROW_HEIGHT = 64;
const ROW_ICON = 44;

// Ligne de la liste filtrée : icône du blind test sur la couleur de son genre, titre et genre, difficulté.
export function BlindTestRow({ quiz, onPress }: { quiz: QuizEntry; onPress: () => void }) {
  const level = quizLevel(quiz);
  const genre = quiz.genre ? texts.genres[quiz.genre] : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${quiz.title}, ${genre}, ${strings.catalog.difficultyLevels[level]}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, { backgroundColor: quiz.genre ? AppColors.blindTestGenres[quiz.genre] : AppColors.surface }]}>
        <ThemeIcon name={quiz.icon ?? themeIconOf(quiz.theme)} size={26} />
      </View>
      <View style={styles.rowTexts}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {quiz.title}
        </Text>
        <Text style={styles.rowGenre} numberOfLines={1}>
          {genre}
        </Text>
      </View>
      <View style={styles.rowLevel}>
        <LevelDots level={level} />
        <Text style={styles.rowLevelLabel}>{strings.catalog.difficultyLevels[level]}</Text>
      </View>
    </Pressable>
  );
}

// Pastille de filtre : active (or, avec ✕ pour la retirer) ou à ouvrir (contour, « ▾ »).
export function FilterChip({ label, isActive, onPress, accessibilityLabel }: { label: string; isActive: boolean; onPress: () => void; accessibilityLabel?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, isActive && styles.chipActive, pressed && styles.pressed]}>
      <ButtonLabel stretch={false} style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
        {label}
      </ButtonLabel>
    </Pressable>
  );
}

const DOT = 8;

const styles = StyleSheet.create({
  tile: {
    height: TILE_HEIGHT,
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.blindTestTile,
    overflow: 'hidden',
  },
  // Quart de disque : un disque dont seul le coin bas gauche dépasse dans la tuile.
  corner: {
    position: 'absolute',
    top: -CORNER,
    right: -CORNER,
    width: CORNER * 2,
    height: CORNER * 2,
    borderRadius: CORNER,
  },
  pressed: {
    opacity: 0.75,
  },
  tileLabel: {
    ...TEXT_FIT_SAFETY,
    // Devant le quart de disque (décoratif), qui est positionné en absolu.
    zIndex: 1,
    fontFamily: AppFonts.display,
  },
  tileCount: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  tilePlayed: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  dotEmpty: {
    borderWidth: 1.5,
    borderColor: AppColors.levelDotEmpty,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.chipBorder,
  },
  rowIcon: {
    width: ROW_ICON,
    height: ROW_ICON,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTexts: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  rowGenre: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  rowLevel: {
    alignItems: 'flex-end',
    gap: 3,
  },
  rowLevelLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
  chip: {
    height: AppSizes.chipHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  chipActive: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accent,
  },
  chipLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  chipLabelActive: {
    color: AppColors.onAccent,
  },
});
