import { activeFilterKeys, effectiveSort, type QuizFilterKey, type QuizFilters } from '@shared/quizFilters';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';


const texts = strings.catalog.filters;

// Bouton jaune « Filtres · N » à côté de la recherche (N : filtres actifs, le tri n'en est pas un).
export function FiltersButton({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texts.buttonLabel(count)}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <SlidersIcon />
      <Text style={styles.buttonLabel} numberOfLines={1}>
        {count === 0 ? texts.button : texts.buttonCount(count)}
      </Text>
    </Pressable>
  );
}

// Réglages, dessinés : deux glissières à curseur.
function SlidersIcon() {
  return (
    <View style={styles.sliders}>
      {[0.65, 0.3].map((position) => (
        <View key={position} style={styles.sliderLine}>
          <View style={[styles.sliderKnob, { left: `${position * 100}%` }]} />
        </View>
      ))}
    </View>
  );
}

function chipLabel(key: QuizFilterKey, filters: QuizFilters): string {
  if (key === 'level' && filters.level) return strings.catalog.difficultyLevels[filters.level];
  if (key === 'audience' && filters.audience) return strings.quizSetup.audiences[filters.audience];
  return texts.hidePlayedChip;
}

interface ActiveFiltersProps {
  filters: QuizFilters;
  // Quiz affichés dans la grille.
  shownCount: number;
  onRemove: (key: QuizFilterKey) => void;
  onClearAll: () => void;
}

// Sous la recherche (tri ou filtre actif) : pastilles jaunes des filtres, retirées d'un appui, « Tout
// effacer », puis « X quiz · triés par Y ».
export function ActiveFilters({ filters, shownCount, onRemove, onClearAll }: ActiveFiltersProps) {
  return (
    <View style={styles.active}>
      <View style={styles.chips}>
        {activeFilterKeys(filters).map((key) => {
          const label = chipLabel(key, filters);
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={texts.removeChip(label)}
              onPress={() => onRemove(key)}
              style={styles.chip}>
              <Text style={styles.chipLabel}>{label}</Text>
              <Text style={styles.chipCross} importantForAccessibility="no">
                ✕
              </Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" onPress={onClearAll} hitSlop={Spacing.two} style={styles.clear}>
          <Text style={styles.clearLabel}>{texts.clearAll}</Text>
        </Pressable>
      </View>
      <Text style={styles.summary}>{texts.summary(shownCount, texts.sorts[effectiveSort(filters)])}</Text>
    </View>
  );
}

const BUTTON_HEIGHT = 48;
const CHIP_HEIGHT = 44;
const SLIDER_WIDTH = 16;
const SLIDER_KNOB = 6;

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  sliders: {
    width: SLIDER_WIDTH,
    gap: 5,
  },
  sliderLine: {
    height: 2,
    borderRadius: 1,
    justifyContent: 'center',
    backgroundColor: AppColors.onAccent,
  },
  sliderKnob: {
    position: 'absolute',
    width: SLIDER_KNOB,
    height: SLIDER_KNOB,
    marginLeft: -SLIDER_KNOB / 2,
    borderRadius: SLIDER_KNOB / 2,
    backgroundColor: AppColors.onAccent,
  },
  active: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  chip: {
    minHeight: CHIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
  },
  chipLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  chipCross: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  clear: {
    minHeight: CHIP_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  clearLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  summary: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
});

