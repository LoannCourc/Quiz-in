import { QUIZ_QUESTION_COUNTS } from '@shared/questionPool';
import { MAX_POOL_THEMES, RECOMMENDED_QUESTION_COUNT, themesQuestionTotal, type ThemeStats } from '@shared/themeCatalog';
import { themeIconOf } from '@shared/themeIcons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LineIcon } from '@/components/host/catalog/LineIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { QuestionCountCards } from './QuestionCountCards';

interface ThemeSheetProps {
  // Thème touché (tuile du rail ou de « Tout voir ») ; null : feuille fermée.
  theme: string | null;
  themes: ThemeStats[];
  onClose: () => void;
  onContinue: (themes: string[], questionCount: number) => void;
}

// Feuille d'un thème (maquette QN1-A, V1), fermée sans thème. Une feuille neuve à chaque thème ouvert (clé) :
// les choix repartent de zéro.
export function ThemeSheet({ theme, ...props }: ThemeSheetProps) {
  return theme === null ? null : <ThemeSheetBody key={theme} theme={theme} {...props} />;
}

interface ThemeSheetBodyProps extends Omit<ThemeSheetProps, 'theme'> {
  theme: string;
}

// En-tête : tuile, thèmes choisis et questions disponibles, fermer. Puis « COMBIEN DE QUESTIONS ? » (10 Express,
// 20 Classique conseillé, 30 Marathon) et « MÉLANGER AVEC UN AUTRE THÈME ? » (puces « + Thème », 3 thèmes au
// plus) ; en bas, CONTINUER vers la fiche de la partie. Nombre impossible avec ces thèmes : le plus grand possible.
function ThemeSheetBody({ theme, themes, onClose, onContinue }: ThemeSheetBodyProps) {
  const texts = strings.catalog.themeSheet;
  const [chosen, setChosen] = useState<string[]>([theme]);
  const [count, setCount] = useState(RECOMMENDED_QUESTION_COUNT);
  const total = themesQuestionTotal(themes, chosen);
  const possible = QUIZ_QUESTION_COUNTS.filter((option) => option <= total);
  const effective = possible.includes(count) ? count : (possible.at(-1) ?? count);
  const others = themes.filter((other) => other.theme !== theme);
  const isFull = chosen.length >= MAX_POOL_THEMES;
  const icon = themeIconOf(theme);

  function toggle(other: string) {
    setChosen((current) => (current.includes(other) ? current.filter((name) => name !== other) : [...current, other]));
  }

  const header = (
    <View style={styles.header}>
      <View style={[styles.iconBox, { backgroundColor: AppColors.themeChips[icon] }]}>
        <ThemeIcon name={icon} size={30} />
      </View>
      <View style={styles.headerText}>
        <Text style={styles.name}>{chosen.join(' + ')}</Text>
        <Text style={styles.available}>{texts.available(total)}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={texts.close} onPress={onClose} hitSlop={Spacing.two} style={styles.close}>
        <LineIcon name="close" />
      </Pressable>
    </View>
  );
  const footer = <SubmitButton singleLine label={texts.continue(effective)} disabled={possible.length === 0} onPress={() => onContinue(chosen, effective)} />;

  return (
    <BottomSheet isOpen onClose={onClose} header={header} footer={footer}>
      <Text style={styles.section}>{texts.howMany}</Text>
      <QuestionCountCards value={effective} available={total} onChange={setCount} />
      <Text style={styles.section}>{texts.mixTitle}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
        {others.map((other) => {
          const isChosen = chosen.includes(other.theme);
          const isDisabled = !isChosen && isFull;
          return (
            <Pressable
              key={other.theme}
              accessibilityRole="checkbox"
              accessibilityLabel={isChosen ? texts.removeTheme(other.theme) : texts.addTheme(other.theme)}
              accessibilityState={{ checked: isChosen, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => toggle(other.theme)}
              style={[styles.chip, isChosen && styles.chipChosen, isDisabled && styles.chipDisabled]}>
              <Text style={[styles.chipLabel, isChosen && styles.chipLabelChosen]}>{`${isChosen ? '✓' : '+'} ${other.theme}`}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconBox: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 22,
  },
  available: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: AppColors.surface,
  },
  section: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Les puces défilent jusqu'au bord de la feuille.
  chipsScroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  chips: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppColors.mixChipBorder,
  },
  chipChosen: {
    borderStyle: 'solid',
    borderColor: AppColors.accent,
    backgroundColor: AppColors.surface,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  chipLabelChosen: {
    color: AppColors.accent,
  },
});
