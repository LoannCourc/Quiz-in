import { QUIZ_QUESTION_COUNTS } from '@shared/questionPool';
import type { ThemeStats } from '@shared/themeCatalog';
import { themeIconOf } from '@shared/themeIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { gradientStyle } from '@/components/ui/gradient';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY, themeHeroGradient } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface ThemeHeroCardProps {
  theme: ThemeStats;
  // Nombre de questions choisi sur la carte (20 par défaut) ; les options au-delà des questions du thème
  // sont grisées.
  count: number;
  onCountChange: (count: number) => void;
  onPlay: () => void;
}

const TITLE_SIZE = 30;
const WATERMARK_SIZE = 150;

// Carte « Thème de la semaine » (maquette QN1-A) : dégradé aux couleurs du thème, icône en filigrane, titre,
// chiffres du thème, 10 / 20 / 30 et JOUER, qui mène directement à la fiche de la partie.
export function ThemeHeroCard({ theme, count, onCountChange, onPlay }: ThemeHeroCardProps) {
  const texts = strings.catalog.themesHome;
  const icon = themeIconOf(theme.theme);
  return (
    <View style={[styles.card, gradientStyle(themeHeroGradient([icon]))]}>
      <View style={styles.watermark} importantForAccessibility="no-hide-descendants">
        <ThemeIcon name={icon} size={WATERMARK_SIZE} />
      </View>
      <View style={[styles.scrim, gradientStyle(`linear-gradient(180deg, transparent 35%, ${AppColors.themeHeroScrim} 100%)`)]} />
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>{texts.weekTheme}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {theme.theme}
      </Text>
      <Text style={styles.meta}>{texts.heroMeta(theme.questionCount, theme.quizCount, theme.playedCount)}</Text>
      <View style={styles.actions}>
        <View style={styles.track} accessibilityRole="radiogroup">
          {QUIZ_QUESTION_COUNTS.map((option) => {
            const isAvailable = option <= theme.questionCount;
            const isSelected = option === count;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityLabel={texts.countOption(option)}
                accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                disabled={!isAvailable}
                onPress={() => onCountChange(option)}
                style={[styles.segment, isSelected && styles.segmentSelected]}>
                <Text style={[styles.segmentLabel, isSelected && styles.segmentLabelSelected, !isAvailable && styles.segmentLabelDisabled]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={texts.playLabel(theme.theme, count)}
          onPress={onPlay}
          style={({ pressed }) => [styles.play, pressed && styles.pressed]}>
          <ButtonLabel style={styles.playLabel}>{texts.play}</ButtonLabel>
        </Pressable>
      </View>
    </View>
  );
}

const SEGMENT_SIZE = 40;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    gap: Spacing.one,
    padding: Spacing.three,
    paddingTop: Spacing.five,
    borderRadius: AppSizes.radiusCard,
    boxShadow: AppShadows.hard,
  },
  watermark: {
    position: 'absolute',
    top: Spacing.two,
    right: -Spacing.three,
    opacity: 0.22,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.themeHeroBadge,
  },
  badgeLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * 1.3),
    textTransform: 'uppercase',
    textShadowColor: AppColors.themeHeroTitleShadow,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  meta: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.themeHeroTrack,
  },
  segment: {
    minWidth: SEGMENT_SIZE,
    height: SEGMENT_SIZE,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppSizes.radiusPill,
  },
  segmentSelected: {
    backgroundColor: AppColors.accent,
  },
  segmentLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  segmentLabelSelected: {
    color: AppColors.ink,
  },
  segmentLabelDisabled: {
    opacity: 0.35,
  },
  play: {
    flex: 1,
    minWidth: 0,
    height: SEGMENT_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.submit,
  },
  pressed: {
    boxShadow: AppShadows.submitPressed,
    transform: [{ translateY: 3 }],
  },
  playLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 17,
    textTransform: 'uppercase',
  },
});
