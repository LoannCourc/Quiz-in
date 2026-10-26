import { QUIZ_QUESTION_COUNTS } from '@shared/questionPool';
import { RECOMMENDED_QUESTION_COUNT, themeGameMinutes } from '@shared/themeCatalog';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface QuestionCountCardsProps {
  value: number;
  // Questions disponibles : une carte au-delà est grisée.
  available: number;
  onChange: (count: number) => void;
  // « Ta partie » (QN1-G) : chiffre et durée seulement, sans nom ni badge.
  compact?: boolean;
}

const NUMBER_SIZE = 34;
const COMPACT_NUMBER_SIZE = 26;

// 10 / 20 / 30 questions en cartes (maquettes QN1-A V1 et QN1-G) : chiffre, nom (Express, Classique,
// Marathon) et durée estimée ; « Conseillé » au-dessus de 20. Carte choisie en or.
export function QuestionCountCards({ value, available, onChange, compact = false }: QuestionCountCardsProps) {
  const texts = strings.catalog.themeSheet;
  return (
    <View style={[styles.row, !compact && styles.rowWithBadge]} accessibilityRole="radiogroup">
      {QUIZ_QUESTION_COUNTS.map((count) => {
        const isAvailable = count <= available;
        const isSelected = count === value && isAvailable;
        const isRecommended = !compact && count === RECOMMENDED_QUESTION_COUNT;
        const minutes = themeGameMinutes(count);
        const name = texts.cardNames[count];
        return (
          <Pressable
            key={count}
            accessibilityRole="radio"
            accessibilityLabel={texts.cardLabel(count, name, minutes, isRecommended)}
            accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
            disabled={!isAvailable}
            onPress={() => onChange(count)}
            style={[styles.card, compact && styles.compactCard, isSelected && styles.selected, !isAvailable && styles.disabled]}>
            {isRecommended && (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{texts.recommended}</Text>
              </View>
            )}
            <Text style={[styles.number, compact && styles.compactNumber, isSelected && styles.inkText]}>{count}</Text>
            {!compact && <Text style={[styles.small, isSelected && styles.inkText]}>{texts.questions}</Text>}
            {!compact && <Text style={[styles.name, isSelected && styles.inkText]}>{name}</Text>}
            <Text style={[styles.small, isSelected && styles.inkText]}>{texts.minutes(minutes)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const BADGE_HEIGHT = 22;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  // Place du badge « Conseillé », qui dépasse au-dessus de sa carte.
  rowWithBadge: {
    paddingTop: BADGE_HEIGHT / 2,
  },
  card: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.countCardBorder,
    backgroundColor: AppColors.countCard,
  },
  compactCard: {
    paddingTop: Spacing.two,
  },
  selected: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.submit,
  },
  disabled: {
    opacity: 0.35,
  },
  badge: {
    position: 'absolute',
    top: -BADGE_HEIGHT / 2,
    height: BADGE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: BADGE_HEIGHT / 2,
    backgroundColor: AppColors.countCardBadge,
  },
  badgeLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 11,
  },
  number: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: NUMBER_SIZE,
    lineHeight: Math.round(NUMBER_SIZE * 1.2),
  },
  compactNumber: {
    fontSize: COMPACT_NUMBER_SIZE,
    lineHeight: Math.round(COMPACT_NUMBER_SIZE * 1.2),
  },
  small: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
    textAlign: 'center',
  },
  name: {
    marginTop: Spacing.one,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textAlign: 'center',
  },
  inkText: {
    color: AppColors.ink,
  },
});
