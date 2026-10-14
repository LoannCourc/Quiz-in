import { NO_QUIZ_FILTERS, QUIZ_AUDIENCES, QUIZ_LEVELS, QUIZ_SORTS, type QuizFilters } from '@shared/quizFilters';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { LevelDots } from '../blindtest/BlindTestParts';
import { FilterToggle } from './FilterToggle';

const texts = strings.catalog.filters;

interface QuizFiltersSheetProps {
  // Réglages appliqués à l'ouverture ; la feuille travaille sur une copie.
  filters: QuizFilters;
  // Nombre de quiz affichés avec ces réglages (« VOIR N QUIZ », mis à jour à chaque choix).
  countFor: (filters: QuizFilters) => number;
  onApply: (filters: QuizFilters) => void;
  onClose: () => void;
}

// Feuille « Trier et filtrer » (maquette QT1) : un tri, une difficulté et un public au plus (un second appui
// les retire), « Cacher ceux déjà faits ». Rien n'est appliqué avant « VOIR N QUIZ » ; fermer la feuille
// abandonne les choix. Montée seulement quand elle est ouverte.
export function QuizFiltersSheet({ filters, countFor, onApply, onClose }: QuizFiltersSheetProps) {
  const [draft, setDraft] = useState(filters);
  const change = (changes: Partial<QuizFilters>) => setDraft((current) => ({ ...current, ...changes }));

  return (
    <BottomSheet
      isOpen
      onClose={onClose}
      title={texts.sheetTitle}
      action={{ label: texts.clearAll, onPress: () => setDraft(NO_QUIZ_FILTERS) }}
      footer={<BigButton label={texts.apply(countFor(draft))} onPress={() => onApply(draft)} />}>
      <Section title={texts.sortTitle}>
        <View style={styles.wrap}>
          {QUIZ_SORTS.map((sort) => (
            <Choice
              key={sort}
              label={texts.sorts[sort]}
              isSelected={draft.sort === sort}
              onPress={() => change({ sort: draft.sort === sort ? null : sort })}
            />
          ))}
        </View>
      </Section>
      <Section title={texts.levelTitle}>
        <View style={styles.levels}>
          {QUIZ_LEVELS.map((level) => {
            const isSelected = draft.level === level;
            return (
              <Pressable
                key={level}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => change({ level: isSelected ? null : level })}
                style={[styles.levelTile, isSelected && styles.selected]}>
                <LevelDots level={level} total={3} color={isSelected ? AppColors.onAccent : undefined} />
                <Text style={[styles.choiceLabel, isSelected && styles.selectedLabel]} numberOfLines={1}>
                  {strings.catalog.difficultyLevels[level]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>
      <Section title={texts.audienceTitle}>
        <View style={styles.wrap}>
          {QUIZ_AUDIENCES.map((audience) => (
            <Choice
              key={audience}
              label={strings.quizSetup.audiences[audience]}
              isSelected={draft.audience === audience}
              onPress={() => change({ audience: draft.audience === audience ? null : audience })}
            />
          ))}
        </View>
      </Section>
      <FilterToggle label={texts.hidePlayed} value={draft.hidePlayed} onChange={(hidePlayed) => change({ hidePlayed })} />
    </BottomSheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Choice({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.choice, isSelected && styles.selected]}>
      <Text style={[styles.choiceLabel, isSelected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const CHOICE_HEIGHT = 44;

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  choice: {
    minHeight: CHOICE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.surface,
  },
  levels: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  levelTile: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  selected: {
    backgroundColor: AppColors.accent,
  },
  choiceLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
  selectedLabel: {
    color: AppColors.onAccent,
  },
});
