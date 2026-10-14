import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface QuestionCountBarProps {
  // Choix proposés (Quiz : 10 / 20 / 30 ; Bluff : 10 / 15 / 20) et ceux que l'ensemble permet.
  options: readonly number[];
  available: readonly number[];
  value: number;
  onChange: (count: number) => void;
  // À droite du titre : « 2 thèmes · 50 questions », « Choisis un quiz »…
  summary: string;
  // Sous le contrôle : pourquoi des options sont grisées (« Ces thèmes n'ont que 20 questions »).
  note?: string;
  // Bluff : lien « Voir » (feuille de Mon mélange) à côté du résumé.
  onShowSummary?: () => void;
  onContinue: () => void;
  isContinueDisabled?: boolean;
}

// Barre fixe en bas du catalogue (maquette Q1, Quiz et Bluff) : « NOMBRE DE QUESTIONS », contrôle segmenté
// (options impossibles grisées) et CONTINUER. Compacte : environ 130 de haut sans ligne d'explication.
export function QuestionCountBar(props: QuestionCountBarProps) {
  const { options, available, value, onChange, summary, note, onShowSummary, onContinue, isContinueDisabled = false } = props;
  const texts = strings.catalog.questionCount;
  return (
    <View style={styles.bar}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {texts.title}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summary} numberOfLines={1}>
            {summary}
          </Text>
          {onShowSummary && (
            <Pressable accessibilityRole="link" hitSlop={Spacing.two} onPress={onShowSummary}>
              <Text style={styles.link}>{texts.show}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.track} accessibilityRole="radiogroup">
        {options.map((count) => {
          const isAvailable = available.includes(count);
          const isSelected = count === value && isAvailable;
          return (
            <Pressable
              key={count}
              accessibilityRole="radio"
              accessibilityLabel={texts.option(count)}
              accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
              disabled={!isAvailable}
              onPress={() => onChange(count)}
              hitSlop={SEGMENT_SLOP}
              style={[styles.segment, isSelected && styles.segmentSelected]}>
              <ButtonLabel style={[styles.segmentLabel, isSelected && styles.segmentLabelSelected, !isAvailable && styles.segmentLabelDisabled]}>
                {String(count)}
              </ButtonLabel>
            </Pressable>
          );
        })}
      </View>
      {note && <Text style={styles.note}>{note}</Text>}
      <SubmitButton label={texts.continue} onPress={onContinue} disabled={isContinueDisabled} compact />
    </View>
  );
}

const SEGMENT_HEIGHT = 30;
// Zone de toucher d'un segment : 44 de haut avec le contour encre.
const SEGMENT_SLOP = { top: 7, bottom: 7 };

const styles = StyleSheet.create({
  // Fond violet foncé, coins de 20, collée en bas (12 autour), blocs serrés.
  bar: {
    gap: 6,
    padding: 10,
    marginHorizontal: -Spacing.one,
    marginBottom: -Spacing.one,
    borderRadius: 20,
    backgroundColor: AppColors.countBar,
  },
  // Le résumé passe sous le titre quand la place manque (écran étroit, « 3 quiz · 30 questions »).
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.two,
    rowGap: Spacing.one,
  },
  title: {
    ...TEXT_FIT_SAFETY,
    flexShrink: 0,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  summary: {
    flexShrink: 1,
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
  link: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  track: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppSizes.radiusPill,
  },
  segmentSelected: {
    backgroundColor: AppColors.accent,
  },
  segmentLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  segmentLabelSelected: {
    color: AppColors.onAccent,
  },
  note: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  segmentLabelDisabled: {
    color: AppColors.textMuted,
    opacity: 0.4,
  },
});
