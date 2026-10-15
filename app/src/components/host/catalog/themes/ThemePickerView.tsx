import type { QuizEntry } from '@shared/quizValidation';
import { MAX_POOL_THEMES, QUESTION_LEVELS, themeGameMinutes, type ThemeStats } from '@shared/themeCatalog';
import { themeIconOf } from '@shared/themeIcons';
import { availableTotal, effectiveQuestionCount, normalizeLevels, poolShortage, type LevelChoice, type PoolShortage } from '@shared/themePool';
import type { QuestionLevel } from '@shared/types';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { LevelDots } from '@/components/host/catalog/blindtest/BlindTestParts';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { QuestionCountCards } from './QuestionCountCards';

// Choix d'une partie tirée dans des thèmes : thèmes, nombre demandé, difficulté.
export interface ThemeGameChoice {
  themes: string[];
  count: number;
  levels: LevelChoice;
}

interface ThemePickerViewProps {
  // Thèmes du Quiz (tuiles, dans l'ordre alphabétique) et fiches du catalogue (questions par niveau).
  themes: ThemeStats[];
  entries: readonly QuizEntry[];
  initial: ThemeGameChoice;
  // VALIDER : le choix, avec le nombre réel de questions s'il en manque.
  onValidate: (choice: ThemeGameChoice) => void;
  // Flèche ou bouton retour d'Android : retour à la fiche sans rien changer.
  onCancel: () => void;
}

const texts = strings.catalog.themePicker;
const TITLE_SIZE = 26;
// Quatre tuiles par rangée tant qu'elles restent assez larges pour « Géographie » ; sinon trois.
const TILE_MIN_WIDTH = 76;

// Texte de l'avertissement : « Seulement 18 questions difficiles en Sport : ajoute un thème pour en avoir plus. »
export function shortageText(shortage: PoolShortage): string {
  const levels = shortage.levels === 'all' ? '' : shortage.levels.map((level) => texts.levelAdjectives[level]).join(' ou ');
  return texts.shortage(shortage.available, levels, texts.themeList(shortage.themes), texts.advice[shortage.advice]);
}

// « Ta partie » (maquette QN1-G) : thèmes à cocher (1 à 3), nombre de questions, difficulté (« Tous niveaux »
// ou un ou plusieurs niveaux) ; s'il manque des questions, l'encadré rose et le nombre réel sur le bouton.
// En bas : récapitulatif et VALIDER, qui revient à la fiche mise à jour.
export function ThemePickerView({ themes, entries, initial, onValidate, onCancel }: ThemePickerViewProps) {
  const [chosen, setChosen] = useState<string[]>(initial.themes);
  const [count, setCount] = useState(initial.count);
  const [levels, setLevels] = useState<LevelChoice>(initial.levels);
  const [columnWidth, setColumnWidth] = useState(0);
  const available = availableTotal(entries, chosen, levels);
  const effective = effectiveQuestionCount(count, available);
  const shortage = poolShortage(entries, chosen, levels, count);
  const isFull = chosen.length >= MAX_POOL_THEMES;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => subscription.remove();
  }, [onCancel]);

  function toggleTheme(theme: string) {
    setChosen((current) => {
      if (current.includes(theme)) return current.length > 1 ? current.filter((name) => name !== theme) : current;
      return current.length < MAX_POOL_THEMES ? [...current, theme] : current;
    });
  }

  function toggleLevel(level: QuestionLevel) {
    setLevels((current) => {
      const list = current === 'all' ? [] : current;
      return normalizeLevels(list.includes(level) ? list.filter((chosenLevel) => chosenLevel !== level) : [...list, level]);
    });
  }

  const columns = (columnWidth - 3 * Spacing.two) / 4 >= TILE_MIN_WIDTH ? 4 : 3;
  const tileWidth = Math.floor((columnWidth - (columns - 1) * Spacing.two) / columns);

  // Avertissement dans le pied, au-dessus du récapitulatif : toujours visible, même à 320 de large.
  const footer = (
    <View style={styles.footer}>
      {shortage && (
        <View style={styles.warning} accessibilityRole="alert">
          <View style={styles.warningIcon}>
            <Text style={styles.warningMark}>!</Text>
          </View>
          <Text style={styles.warningText}>{shortageText(shortage)}</Text>
        </View>
      )}
      <Text style={styles.summary}>{texts.summary(chosen, effective, themeGameMinutes(effective))}</Text>
      <SubmitButton singleLine label={texts.validate(effective)} disabled={effective === 0} onPress={() => onValidate({ themes: chosen, count: effective, levels })} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <View style={styles.column} onLayout={(event) => setColumnWidth(event.nativeEvent.layout.width)}>
        <View style={styles.header}>
          <BackButton onPress={onCancel} label={texts.back} />
          <Text style={styles.title}>{texts.title}</Text>
        </View>
        <Text style={styles.subtitle}>{texts.subtitle}</Text>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>{texts.themes}</Text>
          <Text style={styles.themesCount}>{texts.themesCount(chosen.length, MAX_POOL_THEMES)}</Text>
        </View>
        {columnWidth > 0 && (
          <View style={styles.grid}>
            {themes.map((theme) => {
              const isChecked = chosen.includes(theme.theme);
              const isDisabled = !isChecked && isFull;
              const icon = themeIconOf(theme.theme);
              return (
                <Pressable
                  key={theme.theme}
                  accessibilityRole="checkbox"
                  accessibilityLabel={texts.themeLabel(theme.theme, isChecked)}
                  accessibilityState={{ checked: isChecked, disabled: isDisabled }}
                  disabled={isDisabled}
                  onPress={() => toggleTheme(theme.theme)}
                  style={[styles.tile, { width: tileWidth }, isChecked && styles.tileChecked, isDisabled && styles.disabled]}>
                  <View style={[styles.tileIcon, { backgroundColor: AppColors.themeChips[icon] }]}>
                    <ThemeIcon name={icon} size={22} />
                  </View>
                  <Text style={styles.tileName} numberOfLines={2}>
                    {texts.shortNames[theme.theme] ?? theme.theme}
                  </Text>
                  {isChecked && (
                    <View style={styles.check}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.section}>{texts.questionCount}</Text>
        <QuestionCountCards compact value={count} available={Number.POSITIVE_INFINITY} onChange={setCount} />

        <Text style={styles.section}>{texts.difficulty}</Text>
        <View style={styles.levels}>
          <LevelChip label={texts.allLevels} isSelected={levels === 'all'} onPress={() => setLevels('all')} />
          {QUESTION_LEVELS.map((level) => (
            <LevelChip
              key={level}
              label={strings.catalog.difficultyLevels[level]}
              level={level}
              isSelected={levels !== 'all' && levels.includes(level)}
              onPress={() => toggleLevel(level)}
            />
          ))}
        </View>

      </View>
    </Screen>
  );
}

interface LevelChipProps {
  label: string;
  level?: QuestionLevel;
  isSelected: boolean;
  onPress: () => void;
}

function LevelChip({ label, level, isSelected, onPress }: LevelChipProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={[styles.levelChip, isSelected && styles.levelChipSelected]}>
      {level && <LevelDots level={level} total={3} color={isSelected ? AppColors.onAccent : undefined} />}
      <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const CHECK_SIZE = 22;

const styles = StyleSheet.create({
  column: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 48,
  },
  title: {
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: -Spacing.two,
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  section: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  themesCount: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.half,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: AppColors.themeTile,
  },
  tileChecked: {
    borderColor: AppColors.accent,
  },
  disabled: {
    opacity: 0.4,
  },
  tileIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tileName: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  check: {
    position: 'absolute',
    top: -CHECK_SIZE / 3,
    right: -CHECK_SIZE / 3,
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CHECK_SIZE / 2,
    backgroundColor: AppColors.accent,
  },
  checkMark: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  levels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  levelChip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.countCardBorder,
    backgroundColor: AppColors.countCard,
  },
  levelChipSelected: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accent,
  },
  levelLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  levelLabelSelected: {
    color: AppColors.onAccent,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: AppColors.shortageBorder,
    backgroundColor: AppColors.shortageBackground,
  },
  warningIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: AppColors.shortageBorder,
  },
  warningMark: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
    lineHeight: 18,
  },
  warningText: {
    flex: 1,
    minWidth: 0,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    gap: Spacing.two,
  },
  summary: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
    textAlign: 'center',
  },
});
